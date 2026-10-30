import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase.ts';
import { ChatMessage } from '../types/index.ts';

/* -------------------------------------------------------------------------- */
/*  Kimlik: her sekme / telefon için benzersiz oturum ID'si                    */
/* -------------------------------------------------------------------------- */

export function getSessionId(): string {
  const KEY = 'yakin_session_id_v1';
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'p_' + Math.random().toString(36).slice(2, 12);
  }
}

export async function ensureAuth(): Promise<void> {
  if (auth.currentUser) return;
  try {
    await signInAnonymously(auth);
  } catch (e) {
    // Anonim giriş kapalıysa Firestore kuralları buna izin veriyorsa yine çalışır.
    console.warn('Anonim giriş yapılamadı:', e);
  }
}

/* -------------------------------------------------------------------------- */
/*  Sohbet                                                                    */
/* -------------------------------------------------------------------------- */

export function subscribeMessages(
  roomId: string,
  onMessages: (msgs: ChatMessage[]) => void,
  onError: (e: unknown) => void
): () => void {
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(60)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ ...(d.data() as Omit<ChatMessage, 'id'>), id: d.id }))
        .reverse();
      onMessages(list);
    },
    onError
  );
}

export async function sendRoomMessage(roomId: string, msg: Omit<ChatMessage, 'id'> | ChatMessage) {
  const { id: _ignored, ...rest } = msg as ChatMessage;
  // Firestore undefined değerleri kabul etmez
  const clean = JSON.parse(JSON.stringify(rest));
  await addDoc(collection(db, 'rooms', roomId, 'messages'), clean);
}

/* -------------------------------------------------------------------------- */
/*  Odadakiler (varlık)                                                        */
/* -------------------------------------------------------------------------- */

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  lastSeen: number;
}

const PRESENCE_TTL = 45_000;
const HEARTBEAT = 15_000;

function activeOnly(list: Participant[]): Participant[] {
  const now = Date.now();
  return list.filter((p) => now - p.lastSeen < PRESENCE_TTL);
}

export function joinRoomPresence(
  roomId: string,
  me: Omit<Participant, 'lastSeen'>
): () => void {
  const ref = doc(db, 'rooms', roomId, 'participants', me.id);
  const beat = () => setDoc(ref, { ...me, lastSeen: Date.now() }).catch(() => {});
  beat();
  const timer = setInterval(beat, HEARTBEAT);
  const onUnload = () => {
    deleteDoc(ref).catch(() => {});
  };
  window.addEventListener('pagehide', onUnload);
  return () => {
    clearInterval(timer);
    window.removeEventListener('pagehide', onUnload);
    deleteDoc(ref).catch(() => {});
  };
}

export function subscribeParticipants(
  roomId: string,
  cb: (list: Participant[]) => void,
  onError?: (e: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, 'rooms', roomId, 'participants'),
    (snap) => cb(activeOnly(snap.docs.map((d) => d.data() as Participant))),
    onError
  );
}

/* -------------------------------------------------------------------------- */
/*  WebRTC (mesh) — sinyalleşme Firestore üzerinden                            */
/* -------------------------------------------------------------------------- */

function iceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ];
  const env = (import.meta as any).env || {};
  if (env.VITE_TURN_URL) {
    servers.push({
      urls: String(env.VITE_TURN_URL).split(','),
      username: env.VITE_TURN_USER,
      credential: env.VITE_TURN_PASS,
    });
  }
  return servers;
}

interface CallHandlers {
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onPeerLeft: (peerId: string) => void;
}

export interface RoomCall {
  setParticipants: (list: Participant[]) => void;
  close: () => void;
}

export function createRoomCall(
  roomId: string,
  meId: string,
  localStream: MediaStream | null,
  handlers: CallHandlers
): RoomCall {
  const signalsCol = collection(db, 'rooms', roomId, 'signals');
  const peers = new Map<string, RTCPeerConnection>();
  const pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  let closed = false;

  const sendSignal = (to: string, type: 'offer' | 'answer' | 'candidate', data: unknown) =>
    addDoc(signalsCol, {
      from: meId,
      to,
      type,
      data: JSON.stringify(data),
      createdAt: Date.now(),
    }).catch((e) => console.warn('Sinyal gönderilemedi', e));

  const closePeer = (peerId: string) => {
    const pc = peers.get(peerId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peers.delete(peerId);
    }
    pendingCandidates.delete(peerId);
    handlers.onPeerLeft(peerId);
  };

  const createPeer = (peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    peers.set(peerId, pc);

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(peerId, 'candidate', e.candidate.toJSON());
    };
    pc.ontrack = (e) => {
      const stream = e.streams[0] || new MediaStream([e.track]);
      handlers.onRemoteStream(peerId, stream);
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (peers.get(peerId) === pc) closePeer(peerId);
      }
    };
    return pc;
  };

  const attachLocalMedia = (pc: RTCPeerConnection) => {
    (['audio', 'video'] as const).forEach((kind) => {
      const track = localStream?.getTracks().find((t) => t.kind === kind);
      if (track && localStream) {
        // Cevaplayan tarafta offer'dan gelen transceiver yeniden kullanılır
        const existing = pc
          .getTransceivers()
          .find((t) => t.receiver.track.kind === kind && !t.sender.track);
        if (existing) {
          existing.sender.replaceTrack(track);
          existing.direction = 'sendrecv';
          try {
            existing.sender.setStreams(localStream);
          } catch {
            /* eski tarayıcılar */
          }
        } else {
          pc.addTrack(track, localStream);
        }
      } else if (!pc.getTransceivers().some((t) => t.receiver.track.kind === kind)) {
        pc.addTransceiver(kind, { direction: 'recvonly' });
      }
    });
  };

  const flushCandidates = async (peerId: string, pc: RTCPeerConnection) => {
    const list = pendingCandidates.get(peerId) || [];
    pendingCandidates.delete(peerId);
    for (const c of list) {
      try {
        await pc.addIceCandidate(c);
      } catch {
        /* yoksay */
      }
    }
  };

  const startOffer = async (peerId: string) => {
    const pc = createPeer(peerId);
    attachLocalMedia(pc);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(peerId, 'offer', pc.localDescription);
    } catch (e) {
      console.warn('Offer hatası', e);
      closePeer(peerId);
    }
  };

  const handleSignal = async (sig: { from: string; type: string; data: string; createdAt: number }) => {
    if (Date.now() - sig.createdAt > 60_000) return; // eski sinyal
    const peerId = sig.from;
    const data = JSON.parse(sig.data);

    try {
      if (sig.type === 'offer') {
        if (peers.has(peerId)) closePeer(peerId);
        const pc = createPeer(peerId);
        await pc.setRemoteDescription(data);
        attachLocalMedia(pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(peerId, 'answer', pc.localDescription);
        await flushCandidates(peerId, pc);
      } else if (sig.type === 'answer') {
        const pc = peers.get(peerId);
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(data);
          await flushCandidates(peerId, pc);
        }
      } else if (sig.type === 'candidate') {
        const pc = peers.get(peerId);
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(data);
        } else {
          const arr = pendingCandidates.get(peerId) || [];
          arr.push(data);
          pendingCandidates.set(peerId, arr);
        }
      }
    } catch (e) {
      console.warn('Sinyal işlenemedi', sig.type, e);
    }
  };

  // Bana gelen sinyalleri dinle (tek eşitlik filtresi: ek indeks gerekmez)
  const unsubSignals = onSnapshot(
    query(signalsCol, where('to', '==', meId)),
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type !== 'added') return;
        const sig = change.doc.data() as any;
        deleteDoc(change.doc.ref).catch(() => {});
        if (!closed) handleSignal(sig);
      });
    },
    (e) => console.warn('Sinyal dinleme hatası', e)
  );

  return {
    setParticipants(list) {
      if (closed) return;
      const present = new Set(list.map((p) => p.id).filter((id) => id !== meId));

      // Yeni gelenler: ID'si küçük olan taraf offer başlatır (çakışmayı önler)
      present.forEach((peerId) => {
        if (!peers.has(peerId) && meId < peerId) startOffer(peerId);
      });

      // Ayrılanları kapat
      Array.from(peers.keys()).forEach((peerId) => {
        if (!present.has(peerId)) closePeer(peerId);
      });
    },
    close() {
      closed = true;
      unsubSignals();
      Array.from(peers.keys()).forEach(closePeer);
    },
  };
}

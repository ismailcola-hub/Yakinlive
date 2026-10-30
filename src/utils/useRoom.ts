import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types/index.ts';
import {
  Participant,
  createRoomCall,
  ensureAuth,
  getSessionId,
  joinRoomPresence,
  sendRoomMessage,
  subscribeMessages,
  subscribeParticipants,
} from './realtime.ts';

interface RoomUser {
  name: string;
  avatar: string;
  level: number;
}

export interface RemotePeer {
  id: string;
  name: string;
  avatar: string;
  stream: MediaStream;
}

export function useRoom(roomId: string, user: RoomUser, providedStream?: MediaStream | null) {
  const meId = useRef(getSessionId()).current;
  const userRef = useRef(user);
  userRef.current = user;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [connError, setConnError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [joiner, setJoiner] = useState<Participant | null>(null);

  const localRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    const register = (fn: () => void) => {
      if (cancelled) fn();
      else cleanups.push(fn);
    };

    setMessages([]);
    setParticipants([]);
    setRemoteStreams({});
    setConnError(null);
    setMediaError(null);

    (async () => {
      await ensureAuth();
      if (cancelled) return;

      // 1) Kamera + mikrofon
      let stream: MediaStream | null = providedStream || null;
      let ownStream = false;
      if (!stream) {
        if (!navigator.mediaDevices?.getUserMedia) {
          setMediaError('Bu tarayıcı kamera/mikrofon erişimini desteklemiyor (HTTPS gerekir).');
        } else {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
              audio: { echoCancellation: true, noiseSuppression: true },
            });
            ownStream = true;
          } catch {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              ownStream = true;
              setMediaError('Kamera açılamadı, sadece mikrofon aktif.');
            } catch {
              setMediaError('Kamera/mikrofon izni verilmedi. Tarayıcı ayarlarından izin verin.');
            }
          }
        }
      }
      if (cancelled) {
        if (ownStream) stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      localRef.current = stream;
      setLocalStream(stream);
      setMicOn(!!stream?.getAudioTracks().some((t) => t.enabled));
      setCamOn(!!stream?.getVideoTracks().some((t) => t.enabled));
      if (ownStream && stream) {
        register(() => stream!.getTracks().forEach((t) => t.stop()));
      }

      // 2) Odaya katıl (varlık)
      const me = userRef.current;
      register(joinRoomPresence(roomId, { id: meId, name: me.name, avatar: me.avatar, level: me.level }));

      // 3) Sohbet
      register(
        subscribeMessages(roomId, setMessages, (e: any) => {
          console.warn('Sohbet hatası', e);
          setConnError(
            e?.code === 'permission-denied'
              ? 'Firestore izin hatası: kuralları güncelleyin (firestore.rules).'
              : 'Sohbet bağlantısı kurulamadı.'
          );
        })
      );

      // 4) WebRTC
      const call = createRoomCall(roomId, meId, stream, {
        onRemoteStream: (peerId, s) => setRemoteStreams((prev) => ({ ...prev, [peerId]: s })),
        onPeerLeft: (peerId) =>
          setRemoteStreams((prev) => {
            if (!(peerId in prev)) return prev;
            const { [peerId]: _gone, ...rest } = prev;
            return rest;
          }),
      });
      register(() => call.close());

      let firstSnapshot = true;
      let knownIds = new Set<string>();
      let joinerTimer: ReturnType<typeof setTimeout> | undefined;
      register(() => joinerTimer && clearTimeout(joinerTimer));

      register(
        subscribeParticipants(
          roomId,
          (list) => {
            setParticipants(list);
            call.setParticipants(list);

            const ids = new Set(list.map((p) => p.id));
            if (!firstSnapshot) {
              const fresh = list.find((p) => p.id !== meId && !knownIds.has(p.id));
              if (fresh) {
                setJoiner(fresh);
                if (joinerTimer) clearTimeout(joinerTimer);
                joinerTimer = setTimeout(() => setJoiner(null), 3500);
              }
            }
            knownIds = ids;
            firstSnapshot = false;
          },
          (e: any) => {
            console.warn('Katılımcı hatası', e);
            setConnError(
              e?.code === 'permission-denied'
                ? 'Firestore izin hatası: kuralları güncelleyin (firestore.rules).'
                : 'Oda bağlantısı kurulamadı.'
            );
          }
        )
      );
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      localRef.current = null;
      setLocalStream(null);
    };
    // providedStream bilinçli olarak bağımlılık değil: oda başına bir kez bağlanır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendMessage = useCallback(
    async (msg: Omit<ChatMessage, 'id'>) => {
      try {
        await sendRoomMessage(roomId, msg);
      } catch (e: any) {
        setConnError(
          e?.code === 'permission-denied'
            ? 'Mesaj gönderilemedi: Firestore izin hatası.'
            : 'Mesaj gönderilemedi.'
        );
      }
    },
    [roomId]
  );

  const toggleMic = useCallback(() => {
    const tracks = localRef.current?.getAudioTracks() || [];
    if (!tracks.length) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = localRef.current?.getVideoTracks() || [];
    if (!tracks.length) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setCamOn(next);
  }, []);

  const remotes: RemotePeer[] = Object.entries(remoteStreams).map(([id, stream]) => {
    const p = participants.find((x) => x.id === id);
    return { id, stream, name: p?.name || 'Katılımcı', avatar: p?.avatar || '👤' };
  });

  return {
    meId,
    messages,
    participants,
    remotes,
    localStream,
    mediaError,
    connError,
    micOn,
    camOn,
    joiner,
    sendMessage,
    toggleMic,
    toggleCam,
  };
}

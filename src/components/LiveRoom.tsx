import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Send,
  Share2,
  Flag,
  ArrowLeft,
  Users,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sparkles,
  UserPlus,
  UserCheck,
  Volume2,
  Activity,
} from 'lucide-react';
import { LiveStream, User, ChatMessage, Gift } from '../types/index.ts';
import { GIFTS } from '../data/mockStreams.ts';
import {
  playHeartSound,
  playGiftFanfare,
  playTestSound,
  playApplauseSound,
  monitorMicrophoneLevel,
} from '../utils/audio.ts';
import {
  processGiftTransaction,
  createChatMessage,
  formatViewerCount,
  createJoinNotificationMessage,
} from '../utils/logic.ts';

interface LiveRoomProps {
  stream: LiveStream;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onOpenStore: () => void;
  onTriggerGiftAnimation: (gift: Gift, senderName: string) => void;
  onReportStream: (streamId: string, streamTitle: string, hostName: string, reason: string) => void;
  onEndBroadcast?: (streamId: string) => void;
  isFollowing: boolean;
  onToggleFollow: (hostId: string) => void;
  activeMediaStream?: MediaStream | null;
}

interface FloatingHeartItem {
  id: number;
  x: number;
  color: string;
}

export const LiveRoom: React.FC<LiveRoomProps> = ({
  stream,
  currentUser,
  onUpdateUser,
  onBack,
  onOpenStore,
  onTriggerGiftAnimation,
  onReportStream,
  onEndBroadcast,
  isFollowing,
  onToggleFollow,
  activeMediaStream,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(stream.viewerCount);
  const [likesCount, setLikesCount] = useState(stream.likesCount);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('Uygunsuz davranış');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Floating user entrance animation ribbon
  const [recentJoinBanner, setRecentJoinBanner] = useState<{
    name: string;
    avatar: string;
    level: number;
  } | null>(null);

  // Broadcast media controls if user is host
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Announce user joining the room
  useEffect(() => {
    const joinMsg = createJoinNotificationMessage(stream.id, currentUser);
    setMessages((prev) => [...prev, joinMsg]);
    setRecentJoinBanner({
      name: currentUser.displayName || currentUser.username,
      avatar: currentUser.avatar,
      level: currentUser.level || 1,
    });
    playHeartSound();
    const bannerTimer = setTimeout(() => {
      setRecentJoinBanner(null);
    }, 3800);
    return () => clearTimeout(bannerTimer);
  }, [stream.id]);

  // Monitor microphone in real-time if active broadcast media stream is present
  useEffect(() => {
    if (stream.isUserBroadcasting && activeMediaStream) {
      const stopMonitor = monitorMicrophoneLevel(activeMediaStream, (level, speaking) => {
        setMicLevel(level);
        setIsSpeaking(speaking);
      });
      return () => {
        stopMonitor();
      };
    }
  }, [stream.isUserBroadcasting, activeMediaStream]);

  // Connect local media stream if available
  useEffect(() => {
    if (stream.isUserBroadcasting && activeMediaStream && videoRef.current) {
      videoRef.current.srcObject = activeMediaStream;
    }
  }, [stream.isUserBroadcasting, activeMediaStream]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Periodic simulated realistic viewer actions, joins & chat to give a living atmosphere
  useEffect(() => {
    const simulatedUsers = [
      { name: 'Kaan', avatar: '⚡', level: 3, texts: ['Harika enerji! 🔥', 'Bugün nasılsın?', 'Selamlar'] },
      { name: 'Zeynep', avatar: '🌙', level: 5, texts: ['Ses çok net geliyor ✨', 'Gül gönderdim! 🌹', 'Takipteyim'] },
      { name: 'Burak', avatar: '🦁', level: 2, texts: ['Ooo yeni yayıncı mısın?', 'Keyifli yayınlar!', '👑'] },
      { name: 'Ece', avatar: '🎀', level: 6, texts: ['Kalpleri dolduralım 💕', 'Müzik devam etsin!'] },
    ];

    const interval = setInterval(() => {
      // Occasionally announce a new viewer joining with elegant entrance notification
      if (Math.random() > 0.65) {
        const joiningSim = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
        const simJoinMsg = createJoinNotificationMessage(stream.id, {
          id: 'sim_user_' + joiningSim.name,
          username: joiningSim.name.toLowerCase(),
          displayName: joiningSim.name,
          avatar: joiningSim.avatar,
          level: joiningSim.level,
        });
        setMessages((prev) => [...prev.slice(-40), simJoinMsg]);
        setRecentJoinBanner({
          name: joiningSim.name,
          avatar: joiningSim.avatar,
          level: joiningSim.level,
        });
        setTimeout(() => setRecentJoinBanner(null), 3200);
      } else if (Math.random() > 0.35) {
        const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
        const randomText = randomUser.texts[Math.floor(Math.random() * randomUser.texts.length)];
        const newMsg: ChatMessage = {
          id: 'sim_' + Date.now(),
          streamId: stream.id,
          senderId: 'sim_' + randomUser.name,
          senderName: randomUser.name,
          senderAvatar: randomUser.avatar,
          senderLevel: randomUser.level,
          text: randomText,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev.slice(-40), newMsg]);
      }

      // fluctuate viewer and likes slightly
      setLikesCount((prev) => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.6) {
        setViewerCount((prev) => Math.max(1, prev + (Math.random() > 0.4 ? 1 : -1)));
      }
    }, 4200);

    return () => clearInterval(interval);
  }, [stream.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Heart like burst
  const handleLikeTap = (e?: React.MouseEvent) => {
    playHeartSound();
    setLikesCount((prev) => prev + 1);

    const heartColors = ['#ff4f91', '#ff315d', '#9a68ff', '#ffd700', '#00e5ff'];
    const randomColor = heartColors[Math.floor(Math.random() * heartColors.length)];

    const clientX = e ? e.clientX : window.innerWidth / 2;
    const xPos = Math.max(20, Math.min(window.innerWidth - 60, clientX - 20));

    const newHeart: FloatingHeartItem = {
      id: Date.now() + Math.random(),
      x: xPos,
      color: randomColor,
    };

    setFloatingHearts((prev) => [...prev.slice(-15), newHeart]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1400);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const newMsg = createChatMessage(stream.id, currentUser, text);
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    // award small XP for chatting
    const newXp = (currentUser.xp || 0) + 5;
    onUpdateUser({ ...currentUser, xp: newXp });
  };

  const handleSendGift = (gift: Gift) => {
    if (currentUser.coins < gift.cost) {
      showToast(`Jeton yetersiz! ${gift.name} için ${gift.cost} jeton gerekiyor.`);
      return;
    }

    const { updatedUser, success } = processGiftTransaction(currentUser, gift);
    if (!success) return;

    onUpdateUser(updatedUser);
    playGiftFanfare();
    onTriggerGiftAnimation(gift, currentUser.displayName || currentUser.username);

    // Chat announcement
    const giftChat: ChatMessage = {
      id: 'gift_msg_' + Date.now(),
      streamId: stream.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName || currentUser.username,
      senderAvatar: currentUser.avatar,
      senderLevel: updatedUser.level,
      text: `${gift.name} hediye etti!`,
      isGift: true,
      giftInfo: {
        name: gift.name,
        icon: gift.icon,
        amount: 1,
      },
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, giftChat]);
    setLikesCount((prev) => prev + 25);
    showToast(`${gift.name} başarıyla gönderildi! 🎁`);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Yayın linki panoya kopyalandı! 🔗');
    } else {
      showToast('Yayın linki paylaşıldı!');
    }
  };

  const handleToggleMic = () => {
    if (activeMediaStream) {
      activeMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
    showToast(!isMicMuted ? 'Mikrofon sessize alındı 🔇' : 'Mikrofon açıldı 🎙️');
  };

  const handleToggleVideo = () => {
    if (activeMediaStream) {
      activeMediaStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoDisabled;
      });
    }
    setIsVideoDisabled(!isVideoDisabled);
    showToast(!isVideoDisabled ? 'Kamera kapatıldı (Sanal Görünüm)' : 'Kamera açıldı 🎥');
  };

  const handleSpeakerTest = () => {
    playTestSound();
    showToast('🔊 Hoparlör & Ses Testi: Zil melodisi çalındı!');
  };

  const submitReport = () => {
    onReportStream(stream.id, stream.title, stream.hostName, reportReason);
    setIsReporting(false);
    showToast('Şikâyetiniz moderatör ekibine iletildi. 🛡️');
  };

  return (
    <div className="relative w-full max-w-lg mx-auto min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#100d1b] pb-20 select-none">
      {/* Background Visualizer / Camera Feed */}
      <div
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
        onClick={handleLikeTap}
      >
        {stream.isUserBroadcasting && activeMediaStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isVideoDisabled ? 'hidden' : 'block'
            }`}
          />
        ) : null}

        {/* Fallback Animated Stage Background */}
        {(!stream.isUserBroadcasting || !activeMediaStream || isVideoDisabled) && (
          <div
            className={`w-full h-full bg-gradient-to-b ${stream.bgGradient} flex flex-col items-center justify-center p-6 relative`}
          >
            {/* Ambient glowing circles */}
            <div className="absolute w-72 h-72 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />
            <div className="absolute w-60 h-60 rounded-full bg-purple-500/20 blur-2xl -bottom-10" />

            {/* Host big face avatar */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-700 p-1 shadow-2xl shadow-pink-500/30 animate-pulse">
                <div className="w-full h-full rounded-full bg-[#1b152b] flex items-center justify-center text-6xl">
                  {stream.hostAvatar}
                </div>
              </div>
              <h2 className="mt-3 text-xl font-black text-white text-center drop-shadow-md">
                {stream.hostName}
              </h2>
              <p className="text-xs text-pink-200/90 text-center max-w-xs mt-1 drop-shadow">
                {stream.title}
              </p>

              {/* Animated Equalizer soundwave bars */}
              <div className="flex items-center gap-1.5 mt-5 h-8">
                {[40, 75, 55, 95, 60, 85, 45, 90, 65].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating hearts container */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {floatingHearts.map((h) => (
            <div
              key={h.id}
              style={{ left: `${h.x}px`, color: h.color }}
              className="absolute bottom-32 text-3xl floating-heart drop-shadow-lg"
            >
              ♥
            </div>
          ))}
        </div>
      </div>

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-20 px-3 pt-3 flex items-center justify-between">
        {/* Host Info Capsule */}
        <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            onClick={onBack}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Geri Dön"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-lg">
            {stream.hostAvatar}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black text-white flex items-center gap-1">
              {stream.hostName}
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </span>
            <span className="text-[10px] text-pink-200 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
              {likesCount.toLocaleString('tr-TR')}
            </span>
          </div>

          {!stream.isUserBroadcasting && (
            <button
              onClick={() => onToggleFollow(stream.hostId)}
              className={`ml-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                isFollowing
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Takipte</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  <span>Takip Et</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Viewers & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatViewerCount(viewerCount)}</span>
          </div>

          {/* Speaker Sound Test */}
          <button
            onClick={handleSpeakerTest}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-pink-300 hover:text-white transition-colors"
            title="Hoparlör & Ses Testi"
            aria-label="Hoparlör ve Ses Testi"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-colors"
            title="Yayını Paylaş"
            aria-label="Yayını Paylaş"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsReporting(true)}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-rose-300 transition-colors"
            title="Şikâyet Et"
            aria-label="Şikâyet Et"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Broadcast controls if user is the streamer */}
      {stream.isUserBroadcasting && (
        <div className="relative z-20 mx-3 mt-2 p-2.5 rounded-2xl bg-black/70 backdrop-blur-md border border-pink-500/40 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-black uppercase text-white animate-pulse">
              ● YAYINDASINIZ
            </span>
            {isSpeaking ? (
              <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                <Activity className="w-3 h-3 animate-bounce" />
                <span>Konuşuyorsunuz</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">
                {isMicMuted ? 'Mikrofon kapalı' : 'Ses bekleniyor...'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleVideo}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                isVideoDisabled
                  ? 'bg-rose-500/80 border-rose-400 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title="Kamera Durumu (Aç/Kapat)"
            >
              {isVideoDisabled ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleToggleMic}
              className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                isMicMuted
                  ? 'bg-rose-500/80 border-rose-400 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              title="Mikrofon Durumu (Aç/Kapat)"
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleSpeakerTest}
              className="p-1.5 rounded-lg border bg-purple-900/40 border-purple-500/30 text-pink-300 hover:text-white transition-all"
              title="Ses / Hoparlör Testi"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onEndBroadcast && onEndBroadcast(stream.id)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold shadow-sm active:scale-95 transition-all"
            >
              Yayını Bitir
            </button>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="relative z-30 mx-auto px-4 py-2 rounded-full bg-white text-gray-950 font-black text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BOTTOM SECTION: CHAT & GIFTS */}
      <div className="relative z-20 px-3 pb-2 flex flex-col justify-end">
        {/* Floating Luxury Entrance Ribbon Animation */}
        {recentJoinBanner && (
          <div className="mb-2 pointer-events-none animate-in slide-in-from-left-8 fade-in duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/90 via-pink-600/90 to-purple-700/90 border border-emerald-300/70 shadow-2xl shadow-pink-500/25 backdrop-blur-xl text-white">
              <span className="text-sm animate-pulse">✨</span>
              <span className="text-sm">{recentJoinBanner.avatar}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-black">
                Lv.{recentJoinBanner.level}
              </span>
              <span className="text-xs font-black text-white">
                {recentJoinBanner.name}
              </span>
              <span className="text-[11px] font-bold text-emerald-200">
                yayına katıldı! 👋
              </span>
            </div>
          </div>
        )}

        {/* Chat message box (fading top overlay) */}
        <div
          ref={chatScrollRef}
          className="h-44 overflow-y-auto space-y-1.5 pr-1 mb-2 scroll-smooth flex flex-col justify-end"
        >
          {messages.map((m) =>
            m.isJoinNotification ? (
              <div
                key={m.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs max-w-[95%] bg-gradient-to-r from-emerald-500/25 via-pink-500/25 to-purple-600/25 border border-emerald-400/50 text-white shadow-lg shadow-emerald-500/10 backdrop-blur-md animate-in slide-in-from-left-6 duration-300"
              >
                <span className="text-sm">✨</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/80 text-[9px] font-black text-white shrink-0">
                  Lv.{m.senderLevel}
                </span>
                <span className="text-sm">{m.senderAvatar}</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-emerald-300">
                  {m.senderName}
                </span>
                <span className="text-[11px] font-semibold text-purple-200">
                  yayına katıldı
                </span>
                <span className="text-xs">💫</span>
              </div>
            ) : (
              <div
                key={m.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs max-w-[90%] backdrop-blur-md shadow-sm ${
                  m.isGift
                    ? 'bg-gradient-to-r from-pink-600/90 to-purple-700/90 border border-amber-400/50 text-white'
                    : 'bg-black/55 text-white/95 border border-white/10'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-[9px] font-black text-white shrink-0">
                  Lv.{m.senderLevel}
                </span>
                <span className="font-extrabold text-pink-300 shrink-0">
                  {m.senderName}:
                </span>
                {m.isGift && m.giftInfo ? (
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <span>{m.giftInfo.icon}</span>
                    <span>{m.giftInfo.name}</span>
                  </span>
                ) : (
                  <span className="break-words">{m.text}</span>
                )}
              </div>
            )
          )}
        </div>

        {/* Quick Gift Row */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-1 mb-1 text-[11px] text-pink-200">
            <span className="font-bold flex items-center gap-1">
              <span>🎁 Hediye Gönder</span>
              <span className="text-[10px] text-amber-300 font-extrabold">
                ({currentUser.coins} Jeton)
              </span>
            </span>
            <button
              onClick={onOpenStore}
              className="text-[11px] font-extrabold text-amber-300 hover:underline flex items-center gap-0.5"
            >
              + Jeton Yükle
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {GIFTS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSendGift(g)}
                className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-black/60 hover:bg-pink-600/30 active:scale-95 border border-white/15 backdrop-blur-md transition-all group"
                title={`${g.name} - ${g.cost} Jeton`}
              >
                <span className="text-xl group-hover:scale-125 transition-transform">
                  {g.icon}
                </span>
                <span className="text-[10px] font-black text-amber-300 mt-0.5">
                  {g.cost}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Mesaj yaz veya soru sor..."
            className="flex-1 px-3.5 py-2 rounded-full bg-black/65 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-pink-500 backdrop-blur-md"
          />

          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:opacity-40 shadow-lg shadow-pink-500/25 transition-all"
            aria-label="Mesaj Gönder"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              playApplauseSound();
              showToast('👏 Alkışlar gönderildi!');
            }}
            className="p-2.5 rounded-full bg-purple-600/80 hover:bg-purple-600 text-white active:scale-90 shadow-lg shadow-purple-500/30 transition-transform"
            aria-label="Alkış Gönder"
            title="Alkış ve Tezahürat"
          >
            <span className="text-sm">👏</span>
          </button>

          <button
            type="button"
            onClick={handleLikeTap}
            className="p-2.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white active:scale-90 shadow-lg shadow-rose-500/30 transition-transform"
            aria-label="Kalp Gönder"
          >
            <Heart className="w-3.5 h-3.5 fill-white text-white" />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#1b152b] border border-pink-500/40 p-5 text-white">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-rose-400">
              <Flag className="w-4 h-4" />
              <span>Yayını Şikâyet Et</span>
            </h3>
            <p className="text-xs text-purple-200 mt-1">
              Topluluk kurallarını ihlal eden durumları bize bildirin.
            </p>

            <div className="mt-3 space-y-2 text-xs">
              {[
                'Uygunsuz veya saldırgan içerik',
                'Nefret söylemi veya taciz',
                'Spam veya yanıltıcı yayın',
                'Telif hakkı ihlali',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#241c38] cursor-pointer hover:bg-[#2d2346]"
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-pink-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsReporting(false)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 text-xs font-bold hover:bg-gray-700"
              >
                Vazgeç
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md"
              >
                Şikâyeti Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  X,
  Radio,
  RefreshCw,
  Volume2,
  CheckCircle2,
  Activity,
  Sliders,
  FlipHorizontal,
} from 'lucide-react';
import { LiveStream } from '../types/index.ts';
import { playTestSound, monitorMicrophoneLevel } from '../utils/audio.ts';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLive: (streamConfig: {
    title: string;
    category: LiveStream['category'];
    tags: string[];
    filter: string;
    mediaStream: MediaStream | null;
  }) => void;
  userAvatar: string;
  userName: string;
}

const FILTERS = [
  { id: 'none', label: 'Doğal', style: '' },
  { id: 'warm', label: 'Sıcak Stüdyo', style: 'sepia(25%) saturate(140%) brightness(105%)' },
  { id: 'cyber', label: 'Siber Neon', style: 'hue-rotate(290deg) contrast(120%)' },
  { id: 'vibrant', label: 'Canlı Renk', style: 'saturate(180%) contrast(110%)' },
  { id: 'noir', label: 'Sinematik Gri', style: 'grayscale(70%) contrast(130%)' },
];

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onStartLive,
  userAvatar,
  userName,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LiveStream['category']>('chat');
  const [tagsInput, setTagsInput] = useState('Sohbet, Eğlence, Canlı');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);

  // Real-time Audio / Mic test states
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioTestSuccess, setAudioTestSuccess] = useState<boolean>(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micMonitorCleanupRef = useRef<(() => void) | null>(null);

  // Default suggested title & initialize media
  useEffect(() => {
    if (isOpen) {
      setTitle(`${userName} ile Canlı Sohbet 🎙️`);
      startCameraPreview(facingMode);
    } else {
      stopCameraPreview();
    }
    return () => {
      stopCameraPreview();
    };
  }, [isOpen, userName]);

  const startCameraPreview = async (mode: 'user' | 'environment') => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tarayıcınız kamera/mikrofon erişimini desteklemiyor veya izin verilmedi.');
      return;
    }

    try {
      setIsRequestingMedia(true);
      setCameraError(null);

      // Stop previous tracks if any
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (micMonitorCleanupRef.current) {
        micMonitorCleanupRef.current();
        micMonitorCleanupRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCameraActive(true);

      // Start real-time audio VU-meter monitor
      const stopMonitor = monitorMicrophoneLevel(stream, (level, speaking) => {
        setMicLevel(level);
        setIsSpeaking(speaking);
      });
      micMonitorCleanupRef.current = stopMonitor;
    } catch {
      setCameraError('Kamera/mikrofon izni alınamadı. Sanal avatar stüdyo modunda canlı yayın açabilirsiniz!');
      setCameraActive(false);
    } finally {
      setIsRequestingMedia(false);
    }
  };

  const stopCameraPreview = () => {
    if (micMonitorCleanupRef.current) {
      micMonitorCleanupRef.current();
      micMonitorCleanupRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setMicLevel(0);
    setIsSpeaking(false);
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !micActive));
    }
    setMicActive(!micActive);
  };

  const toggleVideo = () => {
    if (cameraActive) {
      stopCameraPreview();
    } else {
      startCameraPreview(facingMode);
    }
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCameraPreview(nextMode);
  };

  const handleTestSpeakerSound = () => {
    const ok = playTestSound();
    if (ok) {
      setAudioTestSuccess(true);
      setTimeout(() => setAudioTestSuccess(false), 3000);
    }
  };

  const handleStart = () => {
    const finalTitle = title.trim() || `${userName} ile Canlı Yayın`;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onStartLive({
      title: finalTitle,
      category,
      tags: tags.length ? tags : ['Canlı', 'Sohbet'],
      filter: selectedFilter,
      mediaStream: mediaStreamRef.current,
    });
  };

  if (!isOpen) return null;

  const currentFilterStyle =
    FILTERS.find((f) => f.id === selectedFilter)?.style || 'none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#171226] border border-[#372b4f] rounded-3xl shadow-2xl p-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2243]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="font-extrabold text-base">Canlı Yayın & Test Stüdyosu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241c38] hover:bg-[#32274d] text-gray-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Preview Area (Kamera Testi) */}
        <div className="mt-4 relative w-full h-56 bg-black/60 rounded-2xl overflow-hidden border border-[#3b2e56] flex items-center justify-center shadow-inner">
          {cameraActive ? (
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              style={{ filter: currentFilterStyle }}
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'transform -scale-x-100' : ''
              }`}
            />
          ) : (
            <div className="text-center p-4">
              <div className="text-6xl mb-2 animate-bounce">{userAvatar}</div>
              <p className="text-sm font-bold text-gray-200">{userName}</p>
              <p className="text-xs text-purple-300 mt-1 max-w-xs px-2">
                {cameraError || 'Kamera kapalı veya sanal stüdyo modu devrede.'}
              </p>
              <div className="mt-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => startCameraPreview(facingMode)}
                  disabled={isRequestingMedia}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#ff4f91] hover:bg-[#ff367f] text-white inline-flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRequestingMedia ? 'animate-spin' : ''}`} />
                  <span>Kamerayı Başlat & Test Et</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera Status Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-auto">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 ${
                cameraActive
                  ? 'bg-emerald-500/80 border-emerald-400 text-white shadow-lg'
                  : 'bg-amber-500/80 border-amber-400 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>{cameraActive ? 'Kamera Testi: Görüntü Aktif' : 'Sanal Avatar Modu'}</span>
            </span>
          </div>

          {/* Quick controls on video (Kamera / Mic / Switch Facing) */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg transition-transform active:scale-90 ${
                cameraActive
                  ? 'bg-emerald-600/90 border-emerald-400 text-white'
                  : 'bg-rose-600/90 border-rose-400 text-white'
              }`}
              title={cameraActive ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
              aria-label="Kamera Geçişi"
            >
              {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2.5 rounded-xl backdrop-blur-md border shadow-lg transition-transform active:scale-90 ${
                micActive
                  ? 'bg-emerald-600/90 border-emerald-400 text-white'
                  : 'bg-rose-600/90 border-rose-400 text-white'
              }`}
              title={micActive ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
              aria-label="Mikrofon Geçişi"
            >
              {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {cameraActive && (
              <button
                type="button"
                onClick={switchCameraFacing}
                className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-lg transition-transform active:scale-90"
                title="Kamerayı Döndür (Ön / Arka)"
                aria-label="Kamera Yönü Değiştir"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SES VE MİKROFON TEST ALANI (SES TESTLERİ & VU-METER) */}
        <div className="mt-3.5 p-3 rounded-2xl bg-[#1d162e] border border-[#37274e] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-purple-200">
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              <span>Mikrofon & Ses Testi:</span>
            </div>
            <div className="flex items-center gap-1">
              {isSpeaking ? (
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Ses Algılanıyor 🎙️</span>
                </span>
              ) : micActive ? (
                <span className="text-[10px] text-gray-400 font-medium">Ses bekleniyor...</span>
              ) : (
                <span className="text-[10px] text-rose-400 font-bold">Mikrofon Kapalı</span>
              )}
            </div>
          </div>

          {/* Real-time VU-Meter bar */}
          <div className="w-full h-3 rounded-full bg-black/50 p-0.5 overflow-hidden border border-white/10">
            <div
              style={{ width: `${micActive ? Math.max(micLevel, 4) : 0}%` }}
              className={`h-full rounded-full transition-all duration-100 ${
                micLevel > 70
                  ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500'
                  : micLevel > 30
                  ? 'bg-gradient-to-r from-emerald-400 to-amber-300'
                  : 'bg-emerald-400'
              }`}
            />
          </div>

          {/* Speaker Sound Test Button */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <span className="text-[11px] text-purple-300">
              Hoparlör / Kulaklık testi:
            </span>
            <button
              type="button"
              onClick={handleTestSpeakerSound}
              className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-pink-300 text-[11px] font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span>{audioTestSuccess ? '✓ Ses Çalındı!' : 'Ses Testi Yap (Zil)'}</span>
            </button>
          </div>
        </div>

        {/* Filter Selection (Görsel Filtre Testi) */}
        <div className="mt-3">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Kamera Filtresi:</span>
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap transition-all border ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] border-pink-400 text-white font-bold shadow-md'
                    : 'bg-[#211833] border-[#372b4f] text-gray-300 hover:bg-[#2d2146]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-3 space-y-2.5">
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              Yayın Başlığı:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yayınınıza çekici bir başlık verin..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#100d1b] border border-[#3b2e56] text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Kategori:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LiveStream['category'])}
                className="w-full px-3 py-2 rounded-xl bg-[#100d1b] border border-[#3b2e56] text-white text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="chat">💬 Sohbet & Tanışma</option>
                <option value="music">🎵 Müzik & Akustik</option>
                <option value="gaming">🎮 Oyun & Espor</option>
                <option value="popular">🔥 Şov & Eğlence</option>
                <option value="new">🆕 Yeni Başlayanlar</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                Etiketler:
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Örn: Sohbet, Müzik"
                className="w-full px-3 py-2 rounded-xl bg-[#100d1b] border border-[#3b2e56] text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Launch Button (Canlı Yayın Aç) */}
        <button
          onClick={handleStart}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff4f91] via-[#d63384] to-[#9a68ff] text-white font-black text-xs shadow-xl shadow-pink-500/35 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4 animate-ping" />
          <span>🔴 Canlı Yayını Başlat</span>
        </button>
      </div>
    </div>
  );
};

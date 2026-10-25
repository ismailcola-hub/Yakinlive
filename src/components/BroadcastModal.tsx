import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, Sparkles, X, Radio, RefreshCw } from 'lucide-react';
import { LiveStream } from '../types/index.ts';

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
  { id: 'warm', label: 'Sıcak Stüdyo', style: 'sepia(30%) saturate(140%) brightness(105%)' },
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Default suggested title
  useEffect(() => {
    if (isOpen) {
      setTitle(`${userName} ile Canlı Sohbet 🎙️`);
      startCameraPreview();
    } else {
      stopCameraPreview();
    }
    return () => {
      stopCameraPreview();
    };
  }, [isOpen, userName]);

  const startCameraPreview = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Tarayıcınız kamera erişimini desteklemiyor veya izin verilmedi.');
      return;
    }

    try {
      setIsRequestingMedia(true);
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError('Kamera/mikrofon izni alınamadı. Sanal stüdyo modunda yayın açabilirsiniz!');
      setCameraActive(false);
    } finally {
      setIsRequestingMedia(false);
    }
  };

  const stopCameraPreview = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
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
      startCameraPreview();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#171226] border border-[#372b4f] rounded-2xl shadow-2xl p-5 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2243]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="font-extrabold text-base">Canlı Yayın Başlat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241c38] hover:bg-[#32274d] text-gray-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Preview Area */}
        <div className="mt-4 relative w-full h-56 bg-black/60 rounded-xl overflow-hidden border border-[#3b2e56] flex items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              style={{ filter: currentFilterStyle }}
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="text-center p-4">
              <div className="text-6xl mb-2 animate-bounce">{userAvatar}</div>
              <p className="text-sm font-bold text-gray-200">{userName}</p>
              <p className="text-xs text-purple-300 mt-1 max-w-xs px-2">
                {cameraError || 'Kamera kapalı veya sanal avatar modu aktif.'}
              </p>
              <div className="mt-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={startCameraPreview}
                  disabled={isRequestingMedia}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#ff4f91] hover:bg-[#ff367f] text-white inline-flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRequestingMedia ? 'animate-spin' : ''}`} />
                  <span>Kamerayı Etkinleştir</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera & Mic Action Toggles Overlay */}
          <div className="absolute top-2.5 right-2.5 pointer-events-auto">
            <span className="text-[10px] font-bold bg-black/70 px-2 py-0.5 rounded-full text-pink-300 backdrop-blur-sm border border-white/10">
              {cameraActive ? '● Kamera Canlı' : 'Sanal Mod'}
            </span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-2 rounded-full backdrop-blur-md border ${
                cameraActive
                  ? 'bg-emerald-500/80 border-emerald-300 text-white'
                  : 'bg-rose-500/80 border-rose-300 text-white'
              }`}
              title={cameraActive ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
              aria-label="Kamera Geçişi"
            >
              {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-full backdrop-blur-md border ${
                micActive
                  ? 'bg-emerald-500/80 border-emerald-300 text-white'
                  : 'bg-rose-500/80 border-rose-300 text-white'
              }`}
              title={micActive ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
              aria-label="Mikrofon Geçişi"
            >
              {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Filter Selection */}
        <div className="mt-3">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Filtre & Görünüm</span>
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-all border ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] border-pink-400 text-white font-bold'
                    : 'bg-[#211833] border-[#372b4f] text-gray-300 hover:bg-[#2d2146]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">
              Yayın Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yayınınıza çekici bir başlık verin..."
              className="w-full px-3 py-2 rounded-xl bg-[#100d1b] border border-[#3b2e56] text-white text-sm focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Kategori
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
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Etiketler
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

        {/* Launch Button */}
        <button
          onClick={handleStart}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white font-extrabold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4 animate-ping" />
          <span>🔴 Canlı Yayını Başlat</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  X,
  Radio,
  ExternalLink,
  Sparkles,
  Heart,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { LiveStream } from '../types/index.ts';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendLiveBroadcastNotification,
  sendTestNotification,
  NotificationStatus,
} from '../utils/notifications.ts';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  followedHostIds: string[];
  streams: LiveStream[];
  onSelectStream: (stream: LiveStream) => void;
  onToggleFollow: (hostId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  followedHostIds,
  streams,
  onSelectStream,
  onToggleFollow,
}) => {
  const [permission, setPermission] = useState<NotificationStatus>('default');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEnablePermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      showToast('✓ Tarayıcı bildirimleri başarıyla etkinleştirildi!');
      sendTestNotification(() => {
        onClose();
      });
    } else {
      showToast('Bildirim izni verilmedi veya tarayıcı tarafından engellendi.');
    }
  };

  const handleSendTestNotification = () => {
    const sent = sendTestNotification(() => {
      const match = streams.find((s) => s.hostId === 'host_mavikedi') || streams[0];
      if (match) onSelectStream(match);
      onClose();
    });

    if (sent) {
      showToast('🔔 Test bildirimi tarayıcınıza gönderildi!');
    } else {
      showToast('Bildirim gönderilemedi. Lütfen önce bildirim iznini açın.');
    }
  };

  const handleSimulateFavoriteGoesLive = (stream: LiveStream) => {
    const sent = sendLiveBroadcastNotification(stream, () => {
      onSelectStream(stream);
      onClose();
    });
    if (sent) {
      showToast(`🔴 ${stream.hostName} canlı yayın bildirimi gönderildi!`);
    } else {
      showToast(`Bildirim izni kapalı. Ekranda yayın açıldı.`);
      onSelectStream(stream);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#161126] border border-[#3b2b52] rounded-3xl shadow-2xl p-5 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2243]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
              <BellRing className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Canlı Yayın Bildirimleri</h3>
              <p className="text-[11px] text-purple-200">
                Favori yayıncıların yayına başladığında anında haberin olsun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241c38] hover:bg-[#32274d] text-gray-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Permission Status Box */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#1d162e] border border-[#37274e] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Tarayıcı Bildirim Durumu:</span>
            {permission === 'granted' ? (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Aktif</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <BellOff className="w-3 h-3" />
                <span>Engellendi</span>
              </span>
            ) : (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>İzin Bekleniyor</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-purple-200/90 leading-relaxed">
            {permission === 'granted'
              ? 'Bildirimler açık! Takip ettiğin favori yayıncılar canlı yayına geçtiğinde tarayıcına anlık sesli bildirim iletilir.'
              : permission === 'denied'
              ? 'Tarayıcınızda bildirim izni kilitlenmiş. Adres çubuğundaki kilit simgesine dokunup Bildirimlere izin verebilirsiniz.'
              : 'Favorilerin canlı yayına başladığında kaçırmamak için bildirim iznini açın.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            {permission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnablePermission}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-extrabold text-xs text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Bildirimleri Etkinleştir</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendTestNotification}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                permission === 'granted'
                  ? 'flex-1 bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/40 text-pink-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Test Bildirimi Gönder</span>
            </button>
          </div>
        </div>

        {/* Favorite Broadcasters List */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-300">
            <span>Favori ve Takip Edilen Yayıncılar ({followedHostIds.length})</span>
            <span className="text-[10px] text-pink-400">Canlı Bildirim Açık</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-none">
            {streams.map((stream) => {
              const isFollowed = followedHostIds.includes(stream.hostId);
              return (
                <div
                  key={stream.id}
                  className="p-2.5 rounded-2xl bg-[#1b142a] border border-[#36274e] flex items-center justify-between text-xs transition-colors hover:border-purple-500/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{stream.hostAvatar}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{stream.hostName}</span>
                        {stream.isLive && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-500 text-white flex items-center gap-0.5 animate-pulse">
                            <Radio className="w-2.5 h-2.5" /> CANLI
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-purple-300 truncate max-w-[170px]">
                        {stream.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Simulate Going Live Notification */}
                    <button
                      type="button"
                      onClick={() => handleSimulateFavoriteGoesLive(stream)}
                      title="Canlı Bildirim Test Et"
                      className="p-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/20 text-pink-300"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                    </button>

                    {/* Follow/Unfollow Toggle */}
                    <button
                      type="button"
                      onClick={() => onToggleFollow(stream.hostId)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                        isFollowed
                          ? 'bg-pink-600/20 border-pink-500/40 text-pink-300'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      {isFollowed ? '★ Favori' : '☆ Takip Et'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-gray-400">
            Bildirime dokunduğunuzda uygulama doğrudan favori yayıncının canlı odasını açar.
          </p>
        </div>
      </div>
    </div>
  );
};

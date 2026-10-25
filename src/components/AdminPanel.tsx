import React, { useState } from 'react';
import { Shield, Users, Radio, AlertTriangle, CheckCircle2, XCircle, Bell, Ban, Eye, Lock, Unlock } from 'lucide-react';
import { LiveStream, ReportItem } from '../types/index.ts';

interface AdminPanelProps {
  streams: LiveStream[];
  reports: ReportItem[];
  onEndStream: (streamId: string) => void;
  onResolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
  onSendAnnouncement: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  streams,
  reports,
  onEndStream,
  onResolveReport,
  onSendAnnouncement,
}) => {
  const [announcementText, setAnnouncementText] = useState('');
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const totalViewers = streams.reduce((acc, s) => acc + s.viewerCount, 0);
  const pendingReports = reports.filter((r) => r.status === 'pending');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    onSendAnnouncement(announcementText.trim());
    setAnnouncementText('');
    showToast('Duyuru tüm canlı odalara gönderildi! 📢');
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-gray-900 font-extrabold text-xs shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-500" />
            <span>Yönetici & Moderasyon</span>
          </h2>
          <p className="text-xs text-purple-300">
            Platform güvenliği, aktif yayınlar ve canlı kontroller.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
          Sistem Çevrimiçi
        </span>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 rounded-2xl bg-[#1b1429] border border-[#37274e] text-center">
          <div className="flex items-center justify-center gap-1 text-pink-400 text-xs font-bold mb-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Yayınlar</span>
          </div>
          <span className="text-xl font-black text-white">{streams.length}</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#1b1429] border border-[#37274e] text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>İzleyiciler</span>
          </div>
          <span className="text-xl font-black text-white">
            {totalViewers.toLocaleString('tr-TR')}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#1b1429] border border-[#37274e] text-center">
          <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Şikâyetler</span>
          </div>
          <span className="text-xl font-black text-rose-300">{pendingReports.length}</span>
        </div>
      </div>

      {/* Quick Global Controls */}
      <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e] mb-4">
        <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2.5">
          Canlı Kontroller
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setIsChatLocked(!isChatLocked);
              showToast(isChatLocked ? 'Sohbetler yeniden açıldı.' : 'Sohbetler kilitlendi.');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isChatLocked
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-[#221834] border-[#443360] text-purple-200 hover:bg-[#2b1f41]'
            }`}
          >
            {isChatLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isChatLocked ? 'Sohbeti Aç' : 'Sohbeti Kilitle'}</span>
          </button>

          <button
            onClick={() => showToast('İzleyici bot filtresi ve IP koruması aktif.')}
            className="py-2 px-3 rounded-xl bg-[#221834] border border-[#443360] hover:bg-[#2b1f41] text-purple-200 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Spam Koruması</span>
          </button>
        </div>

        {/* System Announcement Input */}
        <form onSubmit={handleBroadcastAnnouncement} className="mt-3 flex gap-2">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Tüm odalara sistem duyurusu yayınla..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#110c1c] border border-[#3b2b54] text-xs text-white focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-extrabold flex items-center gap-1 shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Yayınla</span>
          </button>
        </form>
      </div>

      {/* Reports Queue */}
      <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e] mb-4">
        <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2.5 flex items-center justify-between">
          <span>Kullanıcı Şikâyetleri ({pendingReports.length})</span>
          {pendingReports.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </h3>

        {pendingReports.length === 0 ? (
          <p className="text-xs text-emerald-400 py-3 text-center">
            ✓ İncelenmeyi bekleyen şikâyet bulunmuyor.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-xl bg-[#221834] border border-[#402e5c] text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-pink-300">@{report.reportedUser}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(report.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-white mt-1 font-medium">{report.reason}</p>
                <p className="text-[10px] text-purple-300 mt-0.5 truncate">
                  Yayın: {report.streamTitle}
                </p>

                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#34244b]">
                  <button
                    onClick={() => onResolveReport(report.id, 'dismissed')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Reddet</span>
                  </button>
                  <button
                    onClick={() => {
                      onResolveReport(report.id, 'resolved');
                      showToast(`@${report.reportedUser} uyarıldı ve işlem tamamlandı.`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-extrabold text-white flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Onayla & İşlem Yap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Broadcasts Management */}
      <div className="p-4 rounded-2xl bg-[#1b1429] border border-[#37274e]">
        <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-2.5">
          Aktif Canlı Yayınlar ({streams.length})
        </h3>
        <div className="space-y-2">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="p-2.5 rounded-xl bg-[#221834] border border-[#3e2e58] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{stream.hostAvatar}</span>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{stream.hostName}</span>
                    <span className="text-[10px] text-pink-300">({stream.viewerCount} izleyici)</span>
                  </div>
                  <p className="text-[10px] text-purple-300 truncate max-w-[180px]">
                    {stream.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onEndStream(stream.id);
                  showToast(`${stream.hostName} yayını sonlandırıldı.`);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <Ban className="w-3 h-3" />
                <span>Kapat</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

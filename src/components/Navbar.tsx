
import React from 'react';
import {
  Coins,
  Volume2,
  VolumeX,
  Shield,
  Bell,
  Download,
} from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  user: User;
  onOpenStore: () => void;
  onStartBroadcast: () => void;
  onOpenExport: () => void;
  onOpenAuth?: () => void; // artık Navbar'da kullanılmıyor, App.tsx bozulmasın diye durur
  onOpenNotifications?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenStore,
  onOpenExport,
  onOpenNotifications,
  isMuted,
  onToggleMute,
  onTabChange,
}) => {
  const isAdmin = user.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#100d1b]/95 backdrop-blur-md border-b border-[#332a47] px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 w-full select-none overflow-hidden">
      {/* Brand logo */}
      <div
        className="flex items-center gap-1.5 cursor-pointer shrink-0"
        onClick={() => onTabChange('discover')}
      >
        {/* Logo işareti: konum pini (Yakın) + kırmızı canlı noktası (Live) */}
        <div className="relative w-9 h-9 rounded-[14px] bg-gradient-to-br from-[#ff4f91] to-[#9a68ff] flex items-center justify-center shadow-lg shadow-pink-500/30">
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#ffffff" />
            <circle cx="12" cy="10" r="3" fill="#9a68ff" />
          </svg>
          <span className="absolute -top-1 -right-1 flex w-3.5 h-3.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-75 animate-ping" />
            <span className="relative inline-flex w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#100d1b]" />
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <div className="font-black text-base sm:text-xl tracking-tight leading-none">
            <span className="text-white">Yakın</span>
            <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f91] to-[#9a68ff]">
              Live
            </span>
          </div>
          <p className="hidden sm:block mt-1 text-[9px] text-[#b9b0cb] tracking-wider uppercase font-semibold leading-none">
            Canlı Topluluk
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Jeton */}
        <button
          onClick={onOpenStore}
          title="Jeton Mağazası ve Bakiye Yükle"
          aria-label="Jeton Mağazası ve Bakiye"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#241a38] hover:bg-[#31234b] border border-amber-400/50 text-amber-300 text-xs font-black shadow-sm active:scale-95 transition-all shrink-0"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-tight">{user.coins.toLocaleString('tr-TR')}</span>
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff4f91] text-white flex items-center justify-center text-[10px] font-black ml-0.5">
            +
          </span>
        </button>

        {/* Bildirimler */}
        <button
          onClick={onOpenNotifications}
          title="Canlı Yayın Bildirimleri"
          aria-label="Canlı Yayın Bildirimleri"
          className="relative p-1.5 sm:p-2 rounded-xl bg-[#211a31] hover:bg-[#2c2342] text-pink-300 hover:text-white border border-[#332a47] shrink-0 transition-colors"
        >
          <Bell className="w-4 h-4 text-pink-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1 right-1" />
        </button>

        {/* Admin (sadece yöneticilere görünür) */}
        {isAdmin && (
          <button
            onClick={() => onTabChange('admin')}
            title="Yönetici Paneli"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-sm hover:bg-amber-500/30 transition-all shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* İndir (eski Giriş butonunun yerinde) */}
        <style>{`
          @keyframes dlArrow { 0%,100% { transform: translateY(-1.5px); } 50% { transform: translateY(2px); } }
          @media (prefers-reduced-motion: reduce) { .dl-arrow { animation: none !important; } }
        `}</style>
        <button
          onClick={onOpenExport}
          title="Uygulamayı Telefona İndir (APK / ZIP)"
          aria-label="Uygulamayı Telefona İndir"
          className="group flex items-center gap-2 pl-1 pr-3 sm:pr-4 py-1 rounded-full bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white overflow-hidden">
            <Download
              className="dl-arrow w-4 h-4 text-[#9a68ff]"
              strokeWidth={3}
              style={{ animation: 'dlArrow 1.6s ease-in-out infinite' }}
            />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[13px] font-black">İndir</span>
            <span className="hidden sm:block text-[9px] font-semibold text-white/80 mt-0.5">
              APK / ZIP
            </span>
          </span>
        </button>

        {/* Ses (sadece masaüstü) */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="hidden sm:flex p-1.5 sm:p-2 rounded-xl bg-[#211a31] hover:bg-[#2c2342] text-[#d9d0e8] border border-[#332a47] transition-colors shrink-0"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>
      </div>
    </header>
  );
};

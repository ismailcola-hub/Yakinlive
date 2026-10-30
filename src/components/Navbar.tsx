import React from 'react';
import {
  Sparkles,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Shield,
  LogIn,
  Bell,
} from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  user: User;
  onOpenStore: () => void;
  onStartBroadcast: () => void;
  onOpenExport: () => void;
  onOpenAuth?: () => void;
  onOpenNotifications?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenStore,
  onStartBroadcast,
  onOpenExport,
  onOpenAuth,
  onOpenNotifications,
  isMuted,
  onToggleMute,
  activeTab,
  onTabChange,
}) => {
  const isAdmin = user.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#100d1b]/95 backdrop-blur-md border-b border-[#332a47] px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 w-full select-none overflow-hidden">
      {/* Brand logo - Compact on mobile, no overflow */}
      <div
        className="flex items-center gap-1.5 cursor-pointer shrink-0"
        onClick={() => onTabChange('discover')}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff4f91] to-[#9a68ff] flex items-center justify-center shadow-md shadow-pink-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="font-black text-base sm:text-lg tracking-tight flex items-center gap-1 leading-tight">
            <span className="text-white">Yakın</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f91] to-[#9a68ff]">
              Live
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="hidden sm:block text-[9px] text-[#b9b0cb] tracking-wider uppercase font-semibold">
            Canlı Topluluk
          </p>
        </div>
      </div>

      {/* Right controls - Perfectly sized for mobile phone screens */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Coin Balance / Jeton Satın Alma */}
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

        {/* Canlı Yayın Bildirimleri (Bell) */}
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

        {/* Telefona İndir ZIP / APK */}
        <button
          onClick={onOpenExport}
          title="Telefona İndir, ZIP ve APK"
          aria-label="Telefona İndir, ZIP ve APK"
          className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#211a31] hover:bg-[#2c2342] text-pink-300 border border-pink-500/30 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>📲</span>
          <span className="hidden sm:inline">İndir</span>
        </button>

        {/* Admin / Giriş & Üye Ol */}
        {isAdmin ? (
          <button
            onClick={() => onTabChange('admin')}
            title="Yönetici Paneli"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black shadow-sm hover:bg-amber-500/30 transition-all shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            title="Üye Girişi / Yeni Üye Ol"
            aria-label="Üye Girişi veya Yeni Kayıt"
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-pink-500/30 active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>Giriş<span className="hidden sm:inline"> / Üye Ol</span></span>
          </button>
        )}

        {/* Ses Aç / Kapat (Desktop only to prevent mobile crowding) */}
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

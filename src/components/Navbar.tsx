import React from 'react';
import { Sparkles, Coins, Gem, Volume2, VolumeX, Radio } from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  user: User;
  onOpenStore: () => void;
  onStartBroadcast: () => void;
  onOpenExport: () => void;
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
  isMuted,
  onToggleMute,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#100d1b]/90 backdrop-blur-md border-b border-[#332a47] px-4 py-3 flex items-center justify-between">
      {/* Brand logo */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => onTabChange('discover')}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4f91] to-[#9a68ff] flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-black text-xl tracking-tight flex items-center gap-1">
            <span className="text-white">Yakın</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f91] to-[#9a68ff]">
              Live
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>
          <p className="text-[10px] text-[#b9b0cb] -mt-1 tracking-wider uppercase font-semibold">
            Canlı Topluluk
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Sound toggle button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="p-2 rounded-xl bg-[#211a31] hover:bg-[#2c2342] text-[#d9d0e8] border border-[#332a47] transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Export / Download ZIP & APK button */}
        <button
          onClick={onOpenExport}
          title="Telefona İndir, ZIP & APK"
          aria-label="Telefona İndir, ZIP ve APK"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#211a31] hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <span>📲</span>
          <span className="hidden sm:inline">İndir / APK</span>
        </button>

        {/* Diamonds badge (broadcaster earnings) */}
        <div
          title="Kazanılan Elmaslar"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1b152b] border border-cyan-500/30 text-cyan-300 text-xs font-bold"
        >
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <span>{user.diamonds}</span>
        </div>

        {/* Coin balance button & store trigger */}
        <button
          onClick={onOpenStore}
          aria-label="Jeton Mağazası ve Bakiye"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a203c] hover:bg-[#34284b] border border-[#ff4f91]/40 text-amber-300 text-xs font-extrabold shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">{user.coins.toLocaleString('tr-TR')}</span>
          <span className="w-4 h-4 rounded-full bg-[#ff4f91] text-white flex items-center justify-center text-[10px] ml-0.5">
            +
          </span>
        </button>

        {/* Start broadcast quick button */}
        <button
          onClick={onStartBroadcast}
          aria-label="Canlı Yayın Başlat"
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Yayın Aç</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import {
  Sparkles,
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Radio,
  UserRound,
  ShieldCheck,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface NavbarProps {
  user: User;
  onOpenStore: () => void;
  onStartBroadcast: () => void;
  onOpenExport: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenStore,
  onStartBroadcast,
  onOpenExport,
  isMuted,
  onToggleMute,
  onTabChange,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#100d1b]/95 backdrop-blur-md border-b border-[#332a47] px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onTabChange('discover')}
          className="flex items-center gap-2"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4f91] to-[#9a68ff] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </span>
          <span className="font-black text-xl text-white">
            Yakın <span className="text-pink-400">Live</span>
          </span>
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="p-2 rounded-xl bg-[#211a31] text-white"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-[#211a31] text-pink-300"
            aria-label="İndir"
          >
            📲
          </button>

          <button
            type="button"
            onClick={onOpenStore}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2a203c] text-amber-300"
          >
            <Coins size={16} />
            {user.coins.toLocaleString('tr-TR')}
            <Gem size={15} />
            {user.diamonds}
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-pink-600 text-white font-bold"
          >
            <UserRound size={16} />
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3 py-2 rounded-xl border border-purple-400 text-purple-300 font-bold"
          >
            Üye Ol
          </button>

          <button
            type="button"
            onClick={() => onTabChange('admin')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-700 text-white font-bold"
          >
            <ShieldCheck size={16} />
            Admin
          </button>

          <button
            type="button"
            onClick={onStartBroadcast}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-700 text-white font-bold"
          >
            <Radio size={16} />
            Yayın Aç
          </button>
        </div>
      </div>
    </header>
  );
};

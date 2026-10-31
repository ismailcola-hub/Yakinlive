import React from 'react';
import { Compass, Radio, MessageCircle, User as UserIcon, Shield, PlusCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStartBroadcast: () => void;
  hasActiveBroadcast?: boolean;
  unreadMessagesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onStartBroadcast,
  hasActiveBroadcast,
  unreadMessagesCount = 1,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#120c22]/95 backdrop-blur-2xl border-t border-purple-500/20 py-2 px-3 flex items-center justify-around max-w-lg mx-auto shadow-2xl shadow-black select-none">
      {/* 1. Keşfet */}
      <button
        onClick={() => onTabChange('discover')}
        className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition-all ${
          activeTab === 'discover'
            ? 'text-[#ff3385] scale-105 font-black'
            : 'text-purple-300/70 hover:text-white'
        }`}
        aria-label="Keşfet Sayfası"
      >
        <Compass className="w-5 h-5 drop-shadow" />
        <span className="text-[10.5px]">Keşfet</span>
      </button>

      {/* 2. Canlı Oda */}
      <button
        onClick={() => onTabChange('live')}
        className={`flex flex-col items-center gap-1 min-w-[50px] py-1 relative transition-all ${
          activeTab === 'live'
            ? 'text-[#ff3385] scale-105 font-black'
            : 'text-purple-300/70 hover:text-white'
        }`}
        aria-label="Canlı Yayın Odası"
      >
        <div className="relative">
          <Radio className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
        </div>
        <span className="text-[10.5px]">Canlı</span>
      </button>

      {/* 3. Ortadaki Parlak Canlı Yayın Başlat Butonu (Bigo Tarzı Büyük İkon) */}
      <button
        onClick={onStartBroadcast}
        className="flex flex-col items-center group -mt-5"
        aria-label="Canlı Yayın Aç"
      >
        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#ff3385] via-[#ff5ca1] to-[#8d4bff] p-1 shadow-xl shadow-pink-500/50 group-hover:scale-110 active:scale-95 transition-all border-2 border-white/30">
          <div className="w-full h-full rounded-full bg-[#181126] group-hover:bg-transparent transition-colors flex items-center justify-center text-white">
            <PlusCircle className="w-7 h-7 text-[#ff3385] group-hover:text-white transition-colors drop-shadow" />
          </div>
        </div>
        <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f91] to-[#a875ff] mt-0.5">
          {hasActiveBroadcast ? 'Yayındasın' : 'Yayın Aç'}
        </span>
      </button>

      {/* 4. Birebir Özel Sohbetler (DM - Bigo Sohbetler Menüsü) */}
      <button
        onClick={() => onTabChange('messages')}
        className={`flex flex-col items-center gap-1 min-w-[50px] py-1 relative transition-all ${
          activeTab === 'messages'
            ? 'text-[#ff3385] scale-105 font-black'
            : 'text-purple-300/70 hover:text-white'
        }`}
        aria-label="Birebir Sohbetler"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
              {unreadMessagesCount}
            </span>
          )}
        </div>
        <span className="text-[10.5px]">Sohbetler</span>
      </button>

      {/* 5. Profil (Ben) */}
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 min-w-[50px] py-1 transition-all ${
          activeTab === 'profile'
            ? 'text-[#ff3385] scale-105 font-black'
            : 'text-purple-300/70 hover:text-white'
        }`}
        aria-label="Profil Sayfası"
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10.5px]">Ben</span>
      </button>

      {/* 6. Admin Paneli (Sadece admin tabı için) */}
      <button
        onClick={() => onTabChange('admin')}
        className={`flex flex-col items-center gap-1 min-w-[45px] py-1 transition-all ${
          activeTab === 'admin'
            ? 'text-amber-400 scale-105 font-black'
            : 'text-amber-400/60 hover:text-amber-300'
        }`}
        aria-label="Yönetici Paneli"
      >
        <Shield className="w-4 h-4" />
        <span className="text-[9.5px]">Admin</span>
      </button>
    </nav>
  );
};

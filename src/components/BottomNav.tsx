import React from 'react';
import { Compass, Radio, User as UserIcon, Shield, PlusCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStartBroadcast: () => void;
  hasActiveBroadcast?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onStartBroadcast,
  hasActiveBroadcast,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#140f24]/95 backdrop-blur-xl border-t border-[#332a47] py-2 px-3 flex items-center justify-around max-w-lg mx-auto shadow-2xl">
      {/* Keşfet */}
      <button
        onClick={() => onTabChange('discover')}
        className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${
          activeTab === 'discover'
            ? 'text-[#ff4f91] scale-105 font-bold'
            : 'text-[#9c8fb3] hover:text-white'
        }`}
        aria-label="Keşfet Sayfası"
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px]">Keşfet</span>
      </button>

      {/* Canlı Oda */}
      <button
        onClick={() => onTabChange('live')}
        className={`flex flex-col items-center gap-1 min-w-[56px] py-1 relative transition-all ${
          activeTab === 'live'
            ? 'text-[#ff4f91] scale-105 font-bold'
            : 'text-[#9c8fb3] hover:text-white'
        }`}
        aria-label="Canlı Yayın Odası"
      >
        <div className="relative">
          <Radio className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
        <span className="text-[11px]">Canlı</span>
      </button>

      {/* Ortadaki Canlı Yayın Başlat butonu */}
      <button
        onClick={onStartBroadcast}
        className="flex flex-col items-center group -mt-4"
        aria-label="Canlı Yayın Aç"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff4f91] to-[#9a68ff] p-0.5 shadow-lg shadow-pink-500/40 group-hover:scale-110 active:scale-95 transition-all">
          <div className="w-full h-full rounded-full bg-[#1b152b] group-hover:bg-transparent transition-colors flex items-center justify-center text-white">
            <PlusCircle className="w-6 h-6 text-[#ff4f91] group-hover:text-white transition-colors" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] mt-0.5">
          {hasActiveBroadcast ? 'Yayındasın' : 'Yayın Aç'}
        </span>
      </button>

      {/* Profil */}
      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${
          activeTab === 'profile'
            ? 'text-[#ff4f91] scale-105 font-bold'
            : 'text-[#9c8fb3] hover:text-white'
        }`}
        aria-label="Profil Sayfası"
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[11px]">Profil</span>
      </button>

      {/* Admin Panel */}
      <button
        onClick={() => onTabChange('admin')}
        className={`flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all ${
          activeTab === 'admin'
            ? 'text-[#ff4f91] scale-105 font-bold'
            : 'text-[#9c8fb3] hover:text-white'
        }`}
        aria-label="Yönetici Paneli"
      >
        <Shield className="w-5 h-5" />
        <span className="text-[11px]">Admin</span>
      </button>
    </nav>
  );
};

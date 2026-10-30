import React, { useState } from 'react';
import {
  Search,
  Radio,
  Sparkles,
  Flame,
  Music,
  MessageCircle,
  Gamepad2,
  Zap,
  Heart,
  LogIn,
  UserPlus,
  Shield,
  X,
} from 'lucide-react';
import { LiveStream } from '../types/index.ts';
import { filterStreams, formatViewerCount } from '../utils/logic.ts';

interface DiscoverViewProps {
  streams: LiveStream[];
  onOpenRoom: (stream: LiveStream) => void;
  onStartBroadcast: () => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'admin') => void;
  currentUserRole?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Keşfet', icon: Sparkles },
  { id: 'popular', label: 'Popüler', icon: Flame },
  { id: 'music', label: 'Müzik', icon: Music },
  { id: 'chat', label: 'Sohbet', icon: MessageCircle },
  { id: 'gaming', label: 'Oyun', icon: Gamepad2 },
  { id: 'new', label: 'Yeni', icon: Zap },
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  streams,
  onOpenRoom,
  onStartBroadcast,
  onOpenAuth,
  currentUserRole,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeroDismissed, setIsHeroDismissed] = useState(false);

  const filteredStreams = filterStreams(streams, activeCategory, searchQuery);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-24">
      {/* Siteye ilk girişte ekranda görünen Hoş Geldin & Üye Ol / Giriş Kartı */}
      {onOpenAuth && currentUserRole !== 'admin' && !isHeroDismissed && (
        <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-pink-600/30 via-purple-700/30 to-indigo-950/40 border border-pink-500/40 shadow-xl relative overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-pink-500/30 shrink-0">
                ✨
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5 flex-wrap">
                  <span>Yakın Live'a Hoş Geldiniz!</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-sm">
                    500 Jeton Hediye 🎁
                  </span>
                </h3>
                <p className="text-[11px] text-purple-200 mt-0.5 leading-snug">
                  Yayınları izleyin, canlı sohbete katılın ve hediye gönderin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHeroDismissed(true)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black text-xs shadow-md shadow-pink-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yeni Üyelik Aç</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-pink-300" />
              <span>Giriş Yap</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Yayıncı, başlık veya etiket ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1b1429] border border-[#34274c] text-white placeholder-purple-300/50 text-xs focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] border-pink-400 text-white shadow-md shadow-pink-500/25 scale-105'
                  : 'bg-[#1e172e] border-[#36274e] text-purple-200 hover:bg-[#281e3d]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Stream Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            onClick={() => onOpenRoom(stream)}
            className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-pink-400/60 shadow-lg hover:shadow-pink-500/20 transition-all flex flex-col justify-between p-3"
          >
            {/* Background gradient / simulated video cover */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${stream.bgGradient} opacity-90 group-hover:scale-105 transition-transform duration-500`}
            />

            {/* Glowing corner orb */}
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/15 blur-xl pointer-events-none" />

            {/* Top Bar inside card */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-rose-600/90 backdrop-blur-sm text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                CANLI
              </span>

              <span className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-[10px] font-bold text-white">
                👁 {formatViewerCount(stream.viewerCount)}
              </span>
            </div>

            {/* Center Avatar */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 transition-transform">
                {stream.hostAvatar}
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="relative z-10 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-black text-white truncate max-w-[90px]">
                  {stream.hostName}
                </strong>
                <span className="text-[10px] text-pink-300 font-bold flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 fill-pink-400" />
                  {formatViewerCount(stream.likesCount)}
                </span>
              </div>
              <p className="text-[10px] text-purple-200 truncate mt-0.5 font-medium">
                {stream.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredStreams.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#1b152b] border border-[#332a47]">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="font-extrabold text-sm text-white">Sonuç Bulunamadı</h3>
          <p className="text-xs text-purple-300 mt-1">
            Aramanıza veya seçtiğiniz kategoriye uygun aktif yayın bulunmuyor.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-xs font-extrabold text-white"
          >
            Tüm Yayınları Göster
          </button>
        </div>
      )}

      {/* Broadcast CTA Card */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#2c1c43] via-[#211736] to-[#1a1329] border border-[#443360] shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-pink-400 text-xs font-black uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Senin Sıran!</span>
            </div>
            <h3 className="text-base font-black text-white">
              Kendi Canlı Yayınını Başlat 🎙️
            </h3>
            <p className="text-xs text-purple-200 mt-1 max-w-xs leading-relaxed">
              Kameranı aç, yeteneğini göster veya takipçilerinle sohbet et. Jeton ve hediyeler topla!
            </p>
          </div>
        </div>

        <button
          onClick={onStartBroadcast}
          className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white text-xs font-black shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4" />
          <span>＋ Canlı Yayın Başlat</span>
        </button>
      </div>
    </div>
  );
};

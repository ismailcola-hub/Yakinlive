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
  Users,
  Compass,
} from 'lucide-react';
import { LiveStream } from '../types/index.ts';
import { filterStreams, formatViewerCount } from '../utils/logic.ts';

interface DiscoverViewProps {
  streams: LiveStream[];
  onOpenRoom: (stream: LiveStream) => void;
  onStartBroadcast: () => void;
  onOpenAuth?: (mode?: 'login' | 'register' | 'admin') => void;
  currentUserRole?: string;
  onOpenDirectChat?: (hostId: string, hostName: string, hostAvatar: string) => void;
}

// Bigo Tarzı Üst Kategori Sekmeleri
const TOP_TABS = [
  { id: 'popular', label: 'Popüler', icon: Flame },
  { id: 'all', label: 'Keşfet', icon: Compass },
  { id: 'chat', label: 'Sohbet', icon: MessageCircle },
  { id: 'music', label: 'Müzik', icon: Music },
  { id: 'gaming', label: 'Oyun', icon: Gamepad2 },
  { id: 'new', label: 'Yeni', icon: Zap },
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  streams,
  onOpenRoom,
  onStartBroadcast,
  onOpenAuth,
  currentUserRole,
  onOpenDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeroDismissed, setIsHeroDismissed] = useState(false);

  const filteredStreams = filterStreams(streams, activeTab, searchQuery);

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-3 pb-28 text-white select-none">
      {/* 1. ÜYE OL / HOŞ GELDİN KARTI (Aynen korundu) */}
      {onOpenAuth && currentUserRole !== 'admin' && !isHeroDismissed && (
        <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-pink-600/35 via-purple-700/35 to-indigo-950/50 border border-pink-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff3385] to-[#8d4bff] flex items-center justify-center text-2xl shadow-lg shadow-pink-500/40 shrink-0 border border-white/20">
                ✨
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5 flex-wrap">
                  <span>Yakın Live'a Hoş Geldiniz!</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-black shadow-sm">
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
              className="text-gray-400 hover:text-white p-1 rounded-lg text-xs"
              title="Kapat"
            >
              ✕
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

      {/* 2. BIGO TARZI ÜST KATEGORİ ÇUBUĞU */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2">
        {TOP_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff3385] to-[#8d4bff] text-white shadow-lg shadow-pink-500/25 scale-105 border border-white/20'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-purple-200 border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ARAMA ÇUBUĞU */}
      <div className="relative mb-3.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Yayıncı adı, etiket veya oda ara..."
          className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-purple-300/60 text-xs focus:outline-none focus:border-pink-500 focus:bg-[#1a1329] transition-all backdrop-blur-md"
        />
        <Search className="w-4 h-4 text-purple-300 absolute left-3 top-2.5" />
      </div>

      {/* 4. BIGO TARZI 2 SÜTUNLU CANLI YAYIN KARTLARI */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {filteredStreams.map((stream, idx) => (
          <div
            key={stream.id}
            onClick={() => onOpenRoom(stream)}
            className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer border border-white/15 hover:border-pink-500/70 shadow-xl hover:shadow-pink-500/30 transition-all flex flex-col justify-between p-3 active:scale-[0.98]"
          >
            {/* Canlı Arka Plan Gradyanı ve Glow Efekti */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${stream.bgGradient} opacity-95 group-hover:scale-105 transition-transform duration-700`}
            />

            {/* Arka plan ışık küresi */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />

            {/* Üst Bilgiler (CANLI rozeti + Kategori + İzleyici Sayısı) */}
            <div className="relative z-10 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1 shadow-md shadow-rose-600/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  CANLI
                </span>
                {stream.tags[0] && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-extrabold text-pink-200 border border-white/10">
                    {stream.tags[0]}
                  </span>
                )}
              </div>

              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-white flex items-center gap-1 border border-white/10 shadow-sm">
                <Users className="w-3 h-3 text-amber-300" />
                {formatViewerCount(stream.viewerCount)}
              </span>
            </div>

            {/* Orta Alan (Büyük Avatar & Seviye Rozeti) */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-1 shadow-2xl group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <div className="w-full h-full rounded-full bg-[#181126] flex items-center justify-center text-4xl shadow-inner">
                    {stream.hostAvatar}
                  </div>
                </div>

                {/* Bigo Tarzı Seviye Rozeti (Lv.26, Lv.32) */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black shadow-md border border-white/30 flex items-center gap-0.5">
                  <span>Lv.{stream.hostLevel || (idx + 1) * 7}</span>
                </div>
              </div>
            </div>

            {/* Alt Kısım (Yayıncı Adı, Beğeni & Başlık) */}
            <div className="relative z-10 bg-black/60 backdrop-blur-xl p-2.5 rounded-2xl border border-white/15 shadow-lg">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-xs font-black text-white truncate max-w-[95px] flex items-center gap-1">
                  <span>{stream.hostName}</span>
                </strong>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenDirectChat && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDirectChat(
                          stream.hostId,
                          stream.hostName,
                          stream.hostAvatar,
                          stream.hostLevel || (idx + 1) * 7
                        );
                      }}
                      className="p-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 border border-pink-500/30 transition-all active:scale-90"
                      title="Birebir Özel Sohbet Başlat"
                      aria-label="Özel Sohbet"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                  )}
                  <span className="text-[10px] text-pink-300 font-extrabold flex items-center gap-0.5 shrink-0">
                    <Heart className="w-2.5 h-2.5 fill-pink-400 text-pink-400" />
                    {formatViewerCount(stream.likesCount)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-purple-200 truncate mt-0.5 font-medium">
                {stream.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredStreams.length === 0 && (
        <div className="text-center py-12 px-4 rounded-3xl bg-[#1b152b] border border-[#332a47] mt-4">
          <div className="text-5xl mb-2">🔍</div>
          <h3 className="font-extrabold text-sm text-white">Yayın Bulunamadı</h3>
          <p className="text-xs text-purple-300 mt-1">
            Seçtiğiniz kategoriye veya aramaya uygun aktif yayın yok.
          </p>
          <button
            onClick={() => {
              setActiveTab('popular');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-xs font-black text-white shadow-md"
          >
            Tüm Popüler Yayınlar
          </button>
        </div>
      )}

      {/* 5. CANLI YAYIN BAŞLAT BANNERI */}
      <div className="mt-5 p-4 rounded-3xl bg-gradient-to-r from-[#2c1c43] via-[#211736] to-[#1a1329] border border-pink-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-pink-400 text-xs font-black uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Yayın Sırası Sende!</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              Kendi Canlı Yayınını Başlat 🎙️
            </h3>
            <p className="text-xs text-purple-200 mt-1 max-w-xs leading-relaxed">
              Kameranı ve mikrofonunu aç, izleyicilerden animasyonlu hediyeler ve elmas topla!
            </p>
          </div>
        </div>

        <button
          onClick={onStartBroadcast}
          className="mt-3.5 w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#ff3385] via-[#ff5ca1] to-[#8d4bff] text-white text-xs font-black shadow-lg shadow-pink-500/35 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Radio className="w-4 h-4" />
          <span>＋ Canlı Yayın Başlat</span>
        </button>
      </div>
    </div>
  );
};

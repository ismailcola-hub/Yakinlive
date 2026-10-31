import React, { useState } from 'react';
import {
  X,
  Coins,
  Send,
  Sparkles,
  Flame,
  Crown,
  Car,
  Gift as GiftIcon,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { GIFTS } from '../data/mockStreams.ts';
import { Gift, User } from '../types/index.ts';

interface GiftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSendGift: (gift: Gift, count?: number) => void;
  onOpenStore: () => void;
  recipientName: string;
}

const GIFT_TABS = [
  { id: 'popular', label: 'Popüler', icon: Flame },
  { id: 'luxury', label: 'Lüks', icon: Car },
  { id: 'vip', label: 'VIP', icon: Crown },
  { id: 'event', label: 'Etkinlik', icon: Sparkles },
];

export const GiftDrawer: React.FC<GiftDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSendGift,
  onOpenStore,
  recipientName,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'luxury' | 'vip' | 'event'>('popular');
  const [selectedGift, setSelectedGift] = useState<Gift>(GIFTS[0]);
  const [giftMultiplier, setGiftMultiplier] = useState<number>(1);

  if (!isOpen) return null;

  const filteredGifts = GIFTS.filter((g) => (g.category || 'popular') === activeTab);
  const totalCost = (selectedGift?.cost || 0) * giftMultiplier;
  const canAfford = currentUser.coins >= totalCost;

  const handleSend = () => {
    if (!selectedGift) return;
    if (!canAfford) {
      onOpenStore();
      return;
    }
    for (let i = 0; i < giftMultiplier; i++) {
      onSendGift(selectedGift, giftMultiplier);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg mx-auto bg-[#181126]/95 backdrop-blur-2xl border-t border-purple-500/30 rounded-t-3xl p-4 text-white shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
        {/* Top Drag Bar & Tabs */}
        <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-3" />

        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {GIFT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 border border-white/20'
                      : 'text-purple-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 text-gray-300 hover:text-white ml-2 shrink-0"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gift Grid (Bigo Tarzı 4 Sütunlu Kartlar) */}
        <div className="grid grid-cols-4 gap-2 py-3 min-h-[190px] max-h-[220px] overflow-y-auto no-scrollbar">
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift?.id === gift.id;
            return (
              <div
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-pink-500/30 to-purple-600/30 border-2 border-pink-400 shadow-lg shadow-pink-500/30 scale-105'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {/* Rozet */}
                {gift.badge && (
                  <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[8px] font-black text-white shadow-sm">
                    {gift.badge}
                  </span>
                )}

                <span className="text-3xl my-1 transform group-hover:scale-125 transition-transform filter drop-shadow">
                  {gift.icon}
                </span>

                <span className="text-[10px] font-black text-white truncate max-w-full">
                  {gift.name}
                </span>

                <div className="flex items-center gap-0.5 text-amber-300 text-[10px] font-black mt-0.5">
                  <Coins className="w-2.5 h-2.5 text-amber-400" />
                  <span>{gift.cost}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar (Bakiye, Çarpan & Gönder Butonu) */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          {/* Kullanıcı Bakiyesi */}
          <div
            onClick={onOpenStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.07] border border-amber-400/40 cursor-pointer hover:bg-white/[0.12] transition-colors"
            title="Jeton Yükle"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-black shadow-sm">
              🪙
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-amber-300 leading-none">
                {currentUser.coins.toLocaleString('tr-TR')}
              </span>
              <span className="text-[9px] text-amber-400/80 font-bold leading-none mt-0.5 flex items-center gap-0.5">
                Yükle <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* Çarpan Seçimi (x1, x5, x10, x66) */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-2xl border border-white/10">
            {[1, 5, 10, 66].map((num) => (
              <button
                key={num}
                onClick={() => setGiftMultiplier(num)}
                className={`px-2 py-1 rounded-xl text-[10px] font-black transition-all ${
                  giftMultiplier === num
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                x{num}
              </button>
            ))}
          </div>

          {/* Gönder Butonu */}
          <button
            onClick={handleSend}
            disabled={!selectedGift}
            className={`px-5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
              canAfford
                ? 'bg-gradient-to-r from-[#ff3385] via-[#ff5ca1] to-[#8d4bff] text-white shadow-pink-500/35 hover:brightness-110'
                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{canAfford ? 'Gönder' : 'Yükle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

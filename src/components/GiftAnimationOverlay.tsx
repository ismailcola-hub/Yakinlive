import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift } from '../types/index.ts';

interface GiftAnimationOverlayProps {
  gift: Gift | null;
  senderName: string;
  onAnimationEnd: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({
  gift,
  senderName,
  onAnimationEnd,
}) => {
  useEffect(() => {
    if (!gift) return;

    if (gift.tier === 'epic' || gift.tier === 'legendary') {
      try {
        confetti({
          particleCount: gift.tier === 'legendary' ? 90 : 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff3385', '#9a68ff', '#ffd700', '#00e5ff', '#ff5722'],
        });
      } catch {
        // fallback
      }
    }

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3200);

    return () => clearTimeout(timer);
  }, [gift, onAnimationEnd]);

  if (!gift) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black/30 backdrop-blur-[2px]">
      {/* Top Banner announcement (TikTok / Bigo banner) */}
      <div className="animate-in slide-in-from-top-6 fade-in duration-500 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600/95 via-purple-700/95 to-indigo-900/95 border-2 border-amber-400 shadow-2xl flex items-center gap-3">
        <span className="text-4xl animate-bounce">{gift.icon}</span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
              HEDİYE ŞÖLENİ
            </span>
            <span className="text-[11px] text-pink-200 font-medium">Büyük Sürpriz!</span>
          </div>
          <p className="text-sm sm:text-base font-black text-white mt-0.5">
            <span className="text-amber-300 underline decoration-pink-500">{senderName}</span>,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-amber-200">
              {gift.name}
            </span>{' '}
            gönderdi!
          </p>
        </div>
      </div>

      {/* 1. EJDERHA ANİMASYONU (Bigo Dragon) */}
      {gift.animation === 'dragon' && (
        <div className="relative flex flex-col items-center animate-in zoom-in-75 duration-700">
          <div className="text-9xl animate-pulse filter drop-shadow-[0_0_50px_rgba(255,215,0,0.9)]">
            🐉
          </div>
          <div className="mt-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-black text-sm uppercase tracking-widest shadow-xl border-2 border-white">
            ALTIN EJDERHA ATEŞİ 🔥
          </div>
        </div>
      )}

      {/* 2. MEGA YAT (Yacht) */}
      {gift.animation === 'yacht' && (
        <div className="relative flex flex-col items-center animate-in slide-in-from-right-20 duration-1000">
          <div className="text-9xl animate-bounce filter drop-shadow-[0_0_40px_rgba(0,229,255,0.8)]">
            🛥️
          </div>
          <div className="mt-2 px-5 py-1 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl border border-white">
            LÜKS MEGA YAT 🌊
          </div>
        </div>
      )}

      {/* 3. BÜYÜLÜ ŞATO (Castle) */}
      {gift.animation === 'castle' && (
        <div className="relative flex flex-col items-center animate-in zoom-in-50 duration-800">
          <div className="text-9xl filter drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]">
            🏰
          </div>
          <div className="mt-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-widest shadow-xl border border-white">
            BÜYÜLÜ KRALLIK ŞATOSU ✨
          </div>
        </div>
      )}

      {/* 4. HAVAİ FİŞEK (Fireworks) */}
      {gift.animation === 'fireworks' && (
        <div className="relative flex flex-col items-center animate-ping duration-700">
          <div className="text-9xl">🎆</div>
        </div>
      )}

      {/* 5. UZAY ROKETİ (Blast) */}
      {gift.animation === 'blast' && (
        <div className="relative animate-pulse flex flex-col items-center">
          <div className="text-9xl transform -rotate-45 transition-transform duration-1000 -translate-y-8 filter drop-shadow-[0_0_35px_rgba(255,100,50,0.9)]">
            🚀
          </div>
          <div className="w-8 h-36 bg-gradient-to-t from-transparent via-amber-500 to-rose-500 blur-sm rounded-full animate-ping" />
        </div>
      )}

      {/* 6. KRALİYET TACI (Crown) */}
      {gift.animation === 'crown' && (
        <div className="flex flex-col items-center animate-bounce">
          <div className="text-9xl drop-shadow-[0_10px_35px_rgba(255,215,0,0.8)]">
            👑
          </div>
          <span className="mt-2 text-sm sm:text-base font-black text-amber-300 uppercase tracking-widest bg-black/75 px-5 py-1.5 rounded-full border-2 border-amber-400 shadow-2xl">
            VIP Kraliyet Hediyesi
          </span>
        </div>
      )}

      {/* 7. SPOR ARABA (Car) */}
      {gift.animation === 'car' && (
        <div className="w-full flex flex-col items-center animate-in slide-in-from-left-24 duration-700">
          <div className="text-9xl filter drop-shadow-[0_10px_35px_rgba(255,50,100,0.9)]">
            🏎️
          </div>
          <span className="mt-2 px-4 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg border border-white">
            SÜPER SPOR GEÇİŞİ 💨
          </span>
        </div>
      )}

      {/* STANDART ANİMASYONLAR */}
      {gift.animation === 'pulse' && (
        <div className="animate-ping text-9xl drop-shadow-[0_0_40px_rgba(255,50,100,0.9)]">
          {gift.icon}
        </div>
      )}

      {gift.animation === 'float' && (
        <div className="text-9xl animate-bounce drop-shadow-[0_0_30px_rgba(255,100,150,0.8)]">
          {gift.icon}
        </div>
      )}
    </div>
  );
};

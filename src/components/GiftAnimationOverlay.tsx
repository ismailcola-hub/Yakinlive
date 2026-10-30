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
          particleCount: gift.tier === 'legendary' ? 80 : 45,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff4f91', '#9a68ff', '#ffd700', '#00e5ff'],
        });
      } catch {
        // fallback
      }
    }

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 2800);

    return () => clearTimeout(timer);
  }, [gift, onAnimationEnd]);

  if (!gift) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Top Banner announcement */}
      <div className="animate-bounce mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-600/90 via-purple-700/90 to-indigo-800/90 border border-white/30 backdrop-blur-md shadow-2xl flex items-center gap-3">
        <span className="text-3xl">{gift.icon}</span>
        <div>
          <p className="text-xs text-pink-200 font-medium">Büyük Hediye Sürprizi!</p>
          <p className="text-sm font-extrabold text-white">
            <span className="text-amber-300">{senderName}</span>, {gift.name} gönderdi!
          </p>
        </div>
      </div>

      {/* Specific Animation per gift type */}
      {gift.animation === 'blast' && (
        <div className="relative animate-pulse flex flex-col items-center">
          <div className="text-8xl transform -rotate-45 transition-transform duration-1000 translate-y-[-40px]">
            🚀
          </div>
          <div className="w-6 h-32 bg-gradient-to-t from-transparent via-amber-500 to-rose-500 blur-sm rounded-full animate-ping" />
        </div>
      )}

      {gift.animation === 'crown' && (
        <div className="flex flex-col items-center animate-bounce">
          <div className="text-9xl drop-shadow-[0_10px_25px_rgba(255,215,0,0.6)]">
            👑
          </div>
          <span className="mt-2 text-xl font-black text-amber-300 uppercase tracking-widest bg-black/60 px-4 py-1 rounded-full border border-amber-400">
            Kraliyet Hediyesi
          </span>
        </div>
      )}

      {gift.animation === 'car' && (
        <div className="w-full flex justify-center overflow-hidden">
          <div className="text-9xl transform hover:scale-110 animate-pulse drop-shadow-[0_10px_30px_rgba(255,79,145,0.8)]">
            🏎️
          </div>
        </div>
      )}

      {gift.animation === 'pulse' && (
        <div className="animate-ping text-8xl drop-shadow-[0_0_35px_rgba(255,50,90,0.8)]">
          {gift.icon}
        </div>
      )}

      {gift.animation === 'float' && (
        <div className="text-8xl animate-bounce drop-shadow-[0_0_20px_rgba(255,100,150,0.6)]">
          {gift.icon}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Coins, Sparkles, Gift, CheckCircle2, X, CreditCard, ShieldCheck } from 'lucide-react';
import { COIN_PACKAGES } from '../data/mockStreams.ts';
import { CoinPackage } from '../types/index.ts';
import { playCoinSound } from '../utils/audio.ts';
import confetti from 'canvas-confetti';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  onCoinsPurchased: (amount: number) => void;
  canClaimDaily: boolean;
  onClaimDaily: () => void;
}

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
  onCoinsPurchased,
  canClaimDaily,
  onClaimDaily,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (pack: CoinPackage) => {
    setSelectedPackage(pack);
    setIsProcessing(true);

    setTimeout(() => {
      const totalCoins = pack.coins + pack.bonus;
      onCoinsPurchased(totalCoins);
      playCoinSound();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ffd700', '#ff4f91', '#00e5ff'],
        });
      } catch {
        // fallback
      }

      setIsProcessing(false);
      setSuccessMessage(`${totalCoins} Jeton hesabınıza eklendi! ✨`);

      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPackage(null);
      }, 2500);
    }, 1200);
  };

  const handleClaimBonus = () => {
    onClaimDaily();
    playCoinSound();
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#161124] border border-[#372b4f] rounded-2xl shadow-2xl p-5 text-white my-8">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2243]">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base">Jeton Yükleme Merkezi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#241c38] hover:bg-[#32274d] text-gray-400 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Display */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-[#291b3e] to-[#1c162b] border border-[#443360] flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-200 font-medium">Mevcut Bakiyeniz</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-amber-300">
                {currentCoins.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs font-bold text-amber-400">Jeton</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
            🪙
          </div>
        </div>

        {/* Daily Reward Box */}
        <div className="mt-3 p-3 rounded-xl bg-[#201831] border border-pink-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Günlük Giriş Bonusu</p>
              <p className="text-[11px] text-pink-200">+50 Ücretsiz Jeton</p>
            </div>
          </div>

          <button
            onClick={handleClaimBonus}
            disabled={!canClaimDaily}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              canClaimDaily
                ? 'bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] text-white hover:scale-105 active:scale-95 shadow-md shadow-pink-500/20'
                : 'bg-[#2b223d] text-gray-400 cursor-not-allowed'
            }`}
          >
            {canClaimDaily ? 'Hemen Al' : 'Alındı ✓'}
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Packages Grid */}
        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mt-4 mb-2">
          Jeton Paketleri
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          {COIN_PACKAGES.map((pack) => {
            const isSelected = selectedPackage?.id === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => !isProcessing && handleBuy(pack)}
                className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                  pack.isPopular
                    ? 'bg-gradient-to-b from-[#2e1c45] to-[#1e152f] border-[#ff4f91]/60 shadow-lg shadow-pink-500/10'
                    : 'bg-[#1e172e] border-[#36274e] hover:border-purple-400'
                } hover:scale-[1.02] active:scale-[0.98]`}
              >
                {pack.badge && (
                  <span className="absolute -top-2 right-2 px-2 py-0.5 text-[9px] font-black rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm">
                    {pack.badge}
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-amber-300 font-black text-lg">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{pack.coins.toLocaleString('tr-TR')}</span>
                </div>

                {pack.bonus > 0 ? (
                  <p className="text-[11px] font-bold text-emerald-400 mt-0.5 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    +{pack.bonus} Bonus Jeton
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-0.5">Standart Paket</p>
                )}

                <button
                  disabled={isProcessing}
                  className="mt-2.5 w-full py-1.5 rounded-lg bg-[#2c1f43] hover:bg-gradient-to-r hover:from-[#ff4f91] hover:to-[#9a68ff] text-white text-xs font-extrabold border border-[#483665] transition-all flex items-center justify-center gap-1"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>{pack.priceTry.toFixed(2)} ₺</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Security badge */}
        <div className="mt-4 pt-3 border-t border-[#291f3c] flex items-center justify-center gap-1.5 text-[11px] text-purple-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Güvenli 256-bit şifrelenmiş demo ödeme simülasyonu</span>
        </div>
      </div>
    </div>
  );
};

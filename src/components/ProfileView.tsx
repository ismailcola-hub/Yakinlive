import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Coins,
  Gem,
  Edit3,
  Check,
  Trophy,
  Heart,
  Users,
  RefreshCw,
  Volume2,
  Shield,
  Crown,
  Wallet,
  ShoppingBag,
  Award,
  ChevronRight,
  Flame,
  UserCheck,
} from 'lucide-react';
import { DEFAULT_AVATARS } from '../data/mockStreams.ts';
import { calculateLevel } from '../utils/logic.ts';
import { playCoinSound } from '../utils/audio.ts';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onOpenStore: () => void;
  onOpenExport: () => void;
  onOpenAuth?: () => void;
  onOpenMessages?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onOpenStore,
  onOpenExport,
  onOpenAuth,
  onOpenMessages,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const levelInfo = calculateLevel(user.xp);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveProfile = () => {
    if (!displayName.trim()) {
      showNotification('Lütfen geçerli bir isim yazın.');
      return;
    }
    const updated = {
      ...user,
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
    };
    onUpdateUser(updated);
    setIsEditing(false);
    showNotification('Profil bilgileri güncellendi! ✨');
  };

  const handleConvertDiamonds = () => {
    if (user.diamonds <= 0) {
      showNotification('Dönüştürülecek elmasınız bulunmuyor.');
      return;
    }

    const diamondsToConvert = user.diamonds;
    const coinsGained = diamondsToConvert; // 1 diamond = 1 coin
    const updated: User = {
      ...user,
      diamonds: 0,
      coins: user.coins + coinsGained,
    };

    onUpdateUser(updated);
    playCoinSound();
    showNotification(`${diamondsToConvert} Elmas, ${coinsGained} Jetona dönüştürüldü! 🪙`);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-3 pb-32 text-white select-none">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-gray-900 font-black text-xs shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* 1. ÜST PROFİL BİLGİ KARTI */}
      <div className="relative p-5 rounded-3xl bg-gradient-to-b from-[#26173d] via-[#1a122a] to-[#140e21] border border-purple-500/30 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Avatar & Düzenle Rozeti */}
          <div
            className="relative cursor-pointer shrink-0 group"
            onClick={() => setShowAvatarPicker(true)}
            title="Avatarı Değiştir"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff3385] via-[#ff5ca1] to-[#8d4bff] p-1 shadow-xl shadow-pink-500/30 border border-white/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#181126] flex items-center justify-center text-4xl">
                {selectedAvatar}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#ff3385] text-white shadow-md border-2 border-[#161124]">
              <Edit3 className="w-3 h-3" />
            </div>
          </div>

          {/* İsim, Kullanıcı Adı ve Seviye */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-black/60 border border-pink-500/50 text-white font-bold"
                  placeholder="Görünen İsim"
                />
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-black/60 border border-white/20 text-white"
                  placeholder="Hakkında"
                />
                <button
                  onClick={handleSaveProfile}
                  className="px-3 py-1 bg-pink-500 hover:bg-pink-600 rounded-lg text-xs font-black"
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-white leading-tight truncate">
                    {user.displayName}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-purple-300 hover:text-white"
                    title="Düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-purple-300 font-medium">@{user.username}</p>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black shadow-sm">
                    Lv.{levelInfo.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600/40 border border-purple-500/40 text-purple-200 text-[9px] font-bold">
                    ID: {user.id.slice(-6)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. BIGO TARZI İSTATİSTİK SÜTUNLARI (Arkadaş, Takip Edilen, Hayranlar) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/10 text-center">
          <div className="flex flex-col">
            <span className="text-base font-black text-white">
              {user.friendsCount || 12}
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">Arkadaşlar</span>
          </div>

          <div className="flex flex-col border-x border-white/10">
            <span className="text-base font-black text-white">
              {user.followingCount}
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">Takip Edilen</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-black text-pink-400">
              {user.followersCount.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">Hayranlar</span>
          </div>
        </div>
      </div>

      {/* 3. BIGO TARZI 4'LÜ HIZLI KART (Lv, VIP, Aile, Para Kazan) */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {/* Seviye */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col items-center text-center shadow-md">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg mb-1">
            💎
          </div>
          <span className="text-[10px] font-black text-white">Lv.{levelInfo.level}</span>
          <span className="text-[8.5px] text-cyan-300/80 font-bold">Deneyim</span>
        </div>

        {/* VIP */}
        <div
          onClick={onOpenStore}
          className="p-2.5 rounded-2xl bg-white/[0.05] border border-amber-400/30 flex flex-col items-center text-center shadow-md cursor-pointer hover:bg-white/[0.1] transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg mb-1">
            👑
          </div>
          <span className="text-[10px] font-black text-amber-300">VIP</span>
          <span className="text-[8.5px] text-amber-400/80 font-bold">Ayrıcalık</span>
        </div>

        {/* Klan / Aile */}
        <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col items-center text-center shadow-md">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg mb-1">
            🛡️
          </div>
          <span className="text-[10px] font-black text-white">Aile</span>
          <span className="text-[8.5px] text-purple-300/80 font-bold">Topluluk</span>
        </div>

        {/* Cüzdan & Kazanç */}
        <div
          onClick={handleConvertDiamonds}
          className="p-2.5 rounded-2xl bg-white/[0.05] border border-emerald-400/30 flex flex-col items-center text-center shadow-md cursor-pointer hover:bg-white/[0.1] transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg mb-1">
            💰
          </div>
          <span className="text-[10px] font-black text-emerald-300">{user.diamonds}</span>
          <span className="text-[8.5px] text-emerald-400/80 font-bold">Elmas Dönüştür</span>
        </div>
      </div>

      {/* 4. BIGO TARZI MENÜ LİSTESİ */}
      <div className="mt-3.5 space-y-2">
        {/* Cüzdanım (Jeton & Bakiye) */}
        <div
          onClick={onOpenStore}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1228] hover:bg-[#251a3a] border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg">
              🪙
            </div>
            <div>
              <h4 className="font-black text-xs text-white">Cüzdanım</h4>
              <p className="text-[10px] text-amber-300 font-bold">
                {user.coins.toLocaleString('tr-TR')} Jeton • Yükleme Yap
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-300" />
        </div>

        {/* Birebir Mesajlar & Sohbetler */}
        {onOpenMessages && (
          <div
            onClick={onOpenMessages}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1228] hover:bg-[#251a3a] border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-lg">
                💬
              </div>
              <div>
                <h4 className="font-black text-xs text-white">Birebir Sohbetler</h4>
                <p className="text-[10px] text-purple-300 font-medium">
                  Yayıncılar ve arkadaşlarla özel mesajlaş
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </div>
        )}

        {/* Görev ve Etkinlik Merkezi */}
        <div
          onClick={() => showNotification('🎉 Günlük görevler tamamlandı! +50 XP eklendi.')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1228] hover:bg-[#251a3a] border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
              🎯
            </div>
            <div>
              <h4 className="font-black text-xs text-white">Görev & Ödül Merkezi</h4>
              <p className="text-[10px] text-purple-300 font-medium">
                Günlük görevleri tamamla, ücretsiz jeton kazan
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black">
            Yeni
          </span>
        </div>

        {/* Projeyi İndir / Paylaş */}
        <div
          onClick={onOpenExport}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1228] hover:bg-[#251a3a] border border-pink-500/30 cursor-pointer transition-all shadow-md active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-lg">
              📲
            </div>
            <div>
              <h4 className="font-black text-xs text-white">Telefona İndir & Kur (.APK / .ZIP)</h4>
              <p className="text-[10px] text-pink-300 font-medium">
                Mobil uygulama paketini indir
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-300" />
        </div>
      </div>

      {/* Avatar Seçici Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#1c132b] border border-pink-500/40 p-5 shadow-2xl">
            <h4 className="font-black text-sm text-white mb-3">Avatar Seçin</h4>
            <div className="grid grid-cols-4 gap-2.5">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    setSelectedAvatar(av);
                    setShowAvatarPicker(false);
                  }}
                  className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-pink-500/30 flex items-center justify-center text-3xl transition-transform active:scale-95 border border-white/10"
                >
                  {av}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="mt-4 w-full py-2 rounded-xl bg-gray-800 text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

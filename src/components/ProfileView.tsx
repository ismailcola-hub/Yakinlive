import React, { useState } from 'react';
import { User, Sparkles, Coins, Gem, Edit3, Check, Trophy, Heart, Users, RefreshCw, Volume2, Shield } from 'lucide-react';
import { DEFAULT_AVATARS } from '../data/mockStreams.ts';
import { calculateLevel } from '../utils/logic.ts';
import { playCoinSound } from '../utils/audio.ts';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onOpenStore: () => void;
  onOpenExport: () => void;
  onOpenAuth?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onOpenStore,
  onOpenExport,
  onOpenAuth,
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
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-gray-900 font-extrabold text-xs shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-b from-[#251b3d] to-[#181226] border border-[#3e2e5c] shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with edit badge */}
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ff4f91] via-[#9a68ff] to-[#4facfe] p-1 shadow-xl shadow-pink-500/25">
              <div className="w-full h-full rounded-full bg-[#171224] flex items-center justify-center text-5xl">
                {selectedAvatar}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#ff4f91] text-white shadow-md hover:scale-110 transition-transform">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Name & Username */}
          {isEditing ? (
            <div className="w-full mt-3 space-y-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Görünen İsim"
                className="w-full px-3 py-1.5 rounded-xl bg-[#110c1c] border border-pink-500 text-white text-center text-sm font-bold focus:outline-none"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Biyografi veya durum mesajı..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-xl bg-[#110c1c] border border-[#3f2e5d] text-white text-center text-xs focus:outline-none focus:border-pink-500"
              />
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg bg-gray-800 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-xl font-black text-white">{user.displayName}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-pink-400"
                  aria-label="Profili Düzenle"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-xs text-purple-300 font-mono">@{user.username}</p>
                {user.role === 'admin' ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black border border-amber-300 flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                ) : user.role === 'moderator' ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Moderatör
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    Üye
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-200 mt-2 max-w-xs leading-relaxed">{user.bio}</p>
              {onOpenAuth && (
                <div className="mt-2.5">
                  <button
                    onClick={onOpenAuth}
                    className="text-xs text-pink-300 hover:text-white px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-pink-500/20 transition-all font-bold"
                  >
                    Giriş Yap / Yeni Üyelik / Admin Girişi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Level Progress */}
          <div className="w-full mt-4 p-3 rounded-xl bg-[#1b1429] border border-[#35274d]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1 text-pink-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>Seviye {levelInfo.level}</span>
              </span>
              <span className="text-[11px] text-purple-300">
                {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#110c1c] overflow-hidden">
              <div
                style={{ width: `${levelInfo.progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#ff4f91] to-[#9a68ff] rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="p-2.5 rounded-xl bg-[#1d162c] border border-[#372851]">
            <span className="text-xs text-purple-300 font-medium">Jeton</span>
            <p className="text-base font-black text-amber-300 mt-0.5">{user.coins}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#1d162c] border border-[#372851]">
            <span className="text-xs text-purple-300 font-medium">Elmas</span>
            <p className="text-base font-black text-cyan-300 mt-0.5">{user.diamonds}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#1d162c] border border-[#372851]">
            <span className="text-xs text-purple-300 font-medium">Takipçi</span>
            <p className="text-base font-black text-white mt-0.5">{user.followersCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#1d162c] border border-[#372851]">
            <span className="text-xs text-purple-300 font-medium">Takip</span>
            <p className="text-base font-black text-white mt-0.5">{user.followingCount}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={onOpenStore}
            className="py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>Jeton Yükle</span>
          </button>

          <button
            onClick={handleConvertDiamonds}
            className="py-2.5 rounded-xl bg-[#231a37] hover:bg-[#2c2045] border border-cyan-500/40 text-cyan-300 font-extrabold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>Elmas Bozdur</span>
          </button>
        </div>

        {/* Export / Download Project button */}
        <button
          onClick={onOpenExport}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#221834] hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 border border-pink-500/40 text-pink-200 hover:text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>📦</span>
          <span>Projeyi İndir (.ZIP), GitHub & APK Rehberi</span>
        </button>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-[#1b152b] border border-purple-500/30 p-4 text-center">
            <h3 className="font-black text-sm mb-3">Avatarını Seç</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {DEFAULT_AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => {
                    setSelectedAvatar(av);
                    onUpdateUser({ ...user, avatar: av });
                    setShowAvatarPicker(false);
                    showNotification('Avatar güncellendi! ✨');
                  }}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border transition-all ${
                    selectedAvatar === av
                      ? 'bg-pink-600/30 border-pink-500 scale-110'
                      : 'bg-[#251d38] border-white/10 hover:border-purple-400'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-1.5 rounded-xl bg-gray-800 text-xs font-bold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Settings & Info Section */}
      <div className="mt-4 p-4 rounded-2xl bg-[#1a1428] border border-[#35274d] space-y-3">
        <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
          Uygulama Bilgileri
        </h4>
        <div className="flex items-center justify-between text-xs py-1 border-b border-[#281e3d]">
          <span className="text-gray-300">Sürüm</span>
          <span className="font-mono text-pink-400 font-bold">Yakın Live v1.2 Canlı</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1 border-b border-[#281e3d]">
          <span className="text-gray-300">Yayın Altyapısı</span>
          <span className="text-emerald-400 font-bold">WebRTC / MediaStream</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1">
          <span className="text-gray-300">Hesap Tipi</span>
          <span className="text-purple-300 font-bold">Doğrulanmış Yayıncı & İzleyici</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  Sparkles,
  KeyRound,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import {
  registerAccount,
  loginWithCredentials,
  DEFAULT_ADMIN_ACCOUNT,
} from '../utils/storage.ts';
import {
  validateRegistrationInput,
  validateLoginInput,
  isDefaultAdminCredentials,
} from '../utils/logic.ts';
import { DEFAULT_AVATARS } from '../data/mockStreams.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userPartial: Partial<User>) => void;
  initialMode?: 'login' | 'register' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(initialMode);

  // Registration states (Yeni Üyelik)
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('✨');

  // Login states (Giriş Yap)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin Login states (Yönetici Girişi)
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Common UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle New Membership Registration (Yeni Üyelik)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validation = validateRegistrationInput({
      username: regUsername,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });

    if (!validation.isValid) {
      setError(validation.error || 'Lütfen bilgilerinizi kontrol edin.');
      return;
    }

    setLoading(true);

    try {
      const res = registerAccount({
        username: regUsername,
        displayName: regDisplayName || regUsername,
        email: regEmail,
        password: regPassword,
        avatar: regAvatar,
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Kayıt işlemi başarısız oldu.');
        setLoading(false);
        return;
      }

      setSuccessMsg('🎉 Tebrikler! Üyeliğiniz oluşturuldu ve 500 Hoş Geldin Jetonu hesabınıza yüklendi!');
      onLoginSuccess(res.user);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Member Login (Giriş Yap)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validation = validateLoginInput(loginIdentifier, loginPassword);
    if (!validation.isValid) {
      setError(validation.error || 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);

    try {
      const res = loginWithCredentials(loginIdentifier, loginPassword);
      if (!res.success || !res.user) {
        setError(res.error || 'Giriş yapılamadı.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`Hoş geldin, ${res.user.displayName || res.user.username}! Giriş başarılı.`);
      onLoginSuccess(res.user);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Login (Yönetici Girişi)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    setLoading(true);

    try {
      // Check admin credentials
      const res = loginWithCredentials(adminIdentifier, adminPassword);
      if (!res.success || !res.user) {
        // Also check if matches default admin credentials fallback
        if (isDefaultAdminCredentials(adminIdentifier, adminPassword)) {
          const adminUser: Partial<User> = {
            id: DEFAULT_ADMIN_ACCOUNT.id,
            username: DEFAULT_ADMIN_ACCOUNT.username,
            displayName: DEFAULT_ADMIN_ACCOUNT.displayName,
            email: DEFAULT_ADMIN_ACCOUNT.email,
            role: 'admin',
            avatar: DEFAULT_ADMIN_ACCOUNT.avatar,
            coins: DEFAULT_ADMIN_ACCOUNT.coins,
            diamonds: DEFAULT_ADMIN_ACCOUNT.diamonds,
            isVerified: true,
            isModerator: true,
          };
          setSuccessMsg('🛡️ Yönetici girişi doğrulandı! Admin paneline yönlendiriliyorsunuz...');
          onLoginSuccess(adminUser);
          setTimeout(onClose, 1200);
          return;
        }
        setError(res.error || 'Yönetici şifresi veya e-posta hatalı!');
        setLoading(false);
        return;
      }

      if (res.user.role !== 'admin') {
        setError('Bu hesap yönetici (Admin) yetkisine sahip değil. Lütfen yönetici bilgilerinizi girin.');
        setLoading(false);
        return;
      }

      setSuccessMsg('🛡️ Yönetici girişi başarılı! Admin paneli tam erişim aktif.');
      onLoginSuccess(res.user);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Yönetici girişi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoMember = () => {
    setLoginIdentifier('kullanici@yakinlive.com');
    setLoginPassword('123456');
    setError('');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    setForgotSuccess(true);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#16112a] border border-purple-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Title & Logo */}
        <div className="p-5 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-900 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              {activeTab === 'admin' ? (
                <Shield className="w-6 h-6 text-amber-300" />
              ) : (
                <Sparkles className="w-6 h-6 text-pink-300" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>Yakın Live</span>
                {activeTab === 'admin' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold uppercase">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-purple-200">
                {activeTab === 'register'
                  ? 'Yeni Üyelik & Şifre Belirleme'
                  : activeTab === 'admin'
                  ? 'Yönetici Giriş Kapısı & Yetkilendirme'
                  : 'Hesabına Giriş Yap'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="grid grid-cols-3 bg-[#110c22] p-1.5 border-b border-[#2d2146]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccessMsg('');
              setShowForgotPassword(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccessMsg('');
              setShowForgotPassword(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yeni Üyelik</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
              setSuccessMsg('');
              setShowForgotPassword(false);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Giriş</span>
          </button>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="m-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        <div className="p-6">
          {/* TAB 1: YENİ ÜYELİK (NEW REGISTRATION WITH PASSWORD & CONFIRMATION) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
                <span className="text-xs font-bold text-pink-300">Yeni Üyelik Formu</span>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  🎁 +500 Jeton Hediye
                </span>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-[11px] font-semibold text-purple-200 block mb-1.5">
                  Avatarınızı Seçin:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {DEFAULT_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setRegAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 transition-transform ${
                        regAvatar === emoji
                          ? 'bg-pink-500/30 border-2 border-pink-400 scale-110 shadow-lg'
                          : 'bg-black/30 border border-white/10 hover:border-purple-400'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username */}
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Kullanıcı adı (en az 3 karakter)"
                  minLength={3}
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
              </div>

              {/* Display Name */}
              <div className="relative">
                <Sparkles className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="Görünen İsim (Örn: Melis Kaya)"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="E-posta adresi (ornek@mail.com)"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Şifre (en az 6 karakter)"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-purple-300/70 hover:text-white"
                  title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Confirmation */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Şifre Tekrarı"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-purple-300/70 hover:text-white"
                  title={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Match Indicator */}
              {regConfirmPassword.length > 0 && (
                <div className="text-[11px] font-semibold flex items-center gap-1.5">
                  {regPassword === regConfirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Şifreler eşleşiyor
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Şifreler uyuşmuyor
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 font-black text-xs text-white shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Kaydınız Yapılıyor...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Üye Ol & Giriş Yap</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-purple-300 hover:text-pink-300 underline transition-colors"
                >
                  Zaten bir hesabın var mı? Giriş Yap
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ÜYE GİRİŞİ (MEMBER LOGIN WITH FORGOT PASSWORD & DEMO FILL) */}
          {activeTab === 'login' && !showForgotPassword && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
                <span className="text-xs font-bold text-pink-300">Kullanıcı Girişi</span>
                <button
                  type="button"
                  onClick={fillDemoMember}
                  className="text-[10px] text-purple-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg border border-purple-500/20 transition-all"
                >
                  ⚡ Demo Üye Doldur
                </button>
              </div>

              {/* Identifier (Email or Username) */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="E-posta veya Kullanıcı adı"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Giriş Şifresi"
                  className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-purple-300/50 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-purple-300/70 hover:text-white"
                  title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 text-purple-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-black/40 border-purple-500/40 text-pink-500" />
                  <span>Beni hatırla</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                  className="text-pink-400 hover:text-pink-300 underline"
                >
                  Şifremi unuttum?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-black text-xs text-white shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Kontrol Ediliyor...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </>
                )}
              </button>

              <div className="p-3 rounded-xl bg-[#1b1429] border border-[#392953] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-white">Hesabınız yok mu?</p>
                  <p className="text-[10px] text-purple-300">Yeni üyelik açın ve canlı yayınları izleyin.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold shrink-0 shadow-sm"
                >
                  Üye Ol
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD SUB-VIEW */}
          {activeTab === 'login' && showForgotPassword && (
            <div className="space-y-4">
              <h3 className="font-bold text-pink-300 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Şifremi Unuttum</span>
              </h3>
              <p className="text-xs text-purple-300">
                Kayıtlı e-posta adresinizi girin. Şifrenizi sıfırlamanız için doğrulama bağlantısı iletilecektir.
              </p>

              {forgotSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs space-y-2">
                  <p className="font-bold">✓ Şifre Sıfırlama Bağlantısı Gönderildi!</p>
                  <p className="text-purple-200">
                    {forgotEmail} adresine geçici şifre sıfırlama kodu gönderildi. Ayrıca varsayılan demo şifreniz: <strong className="text-white">123456</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    Giriş Ekranına Dön
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-300/70" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Kayıtlı E-posta Adresiniz"
                      className="w-full bg-black/40 border border-purple-500/30 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-purple-300/50 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-xs text-white"
                  >
                    Şifre Sıfırlama Kodu Gönder
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-xs text-gray-400 hover:text-white"
                  >
                    ← Giriş ekranına geri dön
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN GİRİŞİ (ADMIN LOGIN WITH DEFAULT CREDENTIALS & INSTANT ROLE ACTIVATION) */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {/* Admin Panel Info Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-extrabold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Yetkili Yönetici Giriş Kapısı</span>
                  </span>
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">
                    Root
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Admin şifresiyle giriş yaparak yayınları kapatabilir, şikayetleri çözebilir, üye hesaplarını ve şifrelerini yönetebilirsiniz.
                </p>
              </div>

              {/* Admin Identifier */}
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Yönetici E-posta veya Kullanıcı Adı:
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-amber-400/80" />
                  <input
                    type="text"
                    required
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="E-posta veya kullanıcı adı"
                    className="w-full bg-black/40 border border-amber-500/40 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div>
                <label className="text-[11px] font-bold text-amber-300 block mb-1">
                  Yönetici Giriş Şifresi:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-amber-400/80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Yönetici şifresi"
                    className="w-full bg-black/40 border border-amber-500/40 focus:border-amber-400 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-amber-300/80 hover:text-white"
                    title={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-black text-xs text-white shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Doğrulanıyor...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-white" />
                    <span>Yönetici Olarak Giriş Yap</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400">
                Giriş sonrası Yönetici Paneline ve tüm canlı kontrol araçlarına tam yetki tanımlanır.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

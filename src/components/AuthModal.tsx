import React, { useState } from 'react';
import { User } from '../types/index.ts';
import { Shield, Mail, Lock, Phone, CheckCircle, Smartphone } from 'lucide-react';
git add .
git commit -m "AuthModal dosyasi eklendi"
git push origin main

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userPartial: Partial<User>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'selection' | 'email' | 'phone'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Google Giriş Simülasyonu
    onLoginSuccess({
      id: 'user_google_' + Date.now(),
      username: 'google_user',
      displayName: 'Google Kullanıcısı',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'user'
    });
    setSuccessMsg('Google ile başarıyla giriş yapıldı!');
    setTimeout(onClose, 1200);
  };

  const handleFacebookLogin = () => {
    // Facebook Giriş Simülasyonu
    onLoginSuccess({
      id: 'user_fb_' + Date.now(),
      username: 'facebook_user',
      displayName: 'Facebook Kullanıcısı',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'user'
    });
    setSuccessMsg('Facebook ile başarıyla giriş yapıldı!');
    setTimeout(onClose, 1200);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Süper Admin mail kontrolü (God Mode)
    const isAdmin = email.trim().toLowerCase() === 'admin@yakinlive.com';

    onLoginSuccess({
      id: isAdmin ? 'admin_master_1' : 'user_email_' + Date.now(),
      username: email.split('@')[0],
      displayName: isAdmin ? 'Süper Admin' : email.split('@')[0],
      email: email,
      role: isAdmin ? 'admin' : 'user',
      avatar: isAdmin 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });
    setSuccessMsg(isAdmin ? 'Süper Admin (God Mode) Olarak Giriş Yapıldı!' : 'E-posta ile giriş yapıldı!');
    setTimeout(onClose, 1200);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin SMS OTP kodu: 2026
    const isAdminOtp = otpCode.trim() === '2026';

    onLoginSuccess({
      id: isAdminOtp ? 'admin_sms_1' : 'user_phone_' + Date.now(),
      username: isAdminOtp ? 'super_admin' : 'tel_user_' + phone.slice(-4),
      displayName: isAdminOtp ? 'Süper Admin (SMS)' : 'Kullanıcı (' + phone.slice(-4) + ')',
      role: isAdminOtp ? 'admin' : 'user',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
    });

    setSuccessMsg(isAdminOtp ? 'Süper Admin SMS Doğrulaması Başarılı!' : 'Telefon doğrulaması başarılı!');
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#16122b] border border-purple-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-900 flex justify-between items-center border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/20 rounded-2xl border border-pink-500/40 text-pink-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Yakın Live Giriş</h2>
              <p className="text-xs text-purple-200">Canlı yayına katılmak için giriş yap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 p-3 text-center text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        <div className="p-6">
          {authMode === 'selection' && (
            <div className="space-y-3.5">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Google ile Devam Et (+100 Jeton)
              </button>

              <button
                onClick={handleFacebookLogin}
                className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] text-white hover:bg-[#166fe5] font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5 filter brightness-200" alt="Facebook" />
                Facebook ile Devam Et
              </button>

              <button
                onClick={() => setAuthMode('email')}
                className="w-full py-3 px-4 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-white hover:bg-purple-900/60 font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Mail className="w-5 h-5 text-pink-400" />
                E-posta / Admin Girişi
              </button>

              <button
                onClick={() => setAuthMode('phone')}
                className="w-full py-3 px-4 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-white hover:bg-purple-900/60 font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Phone className="w-5 h-5 text-pink-400" />
                Telefon / SMS OTP (Admin Kodu: 2026)
              </button>
            </div>
          )}

          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400">E-posta ile Giriş</span>
                <button type="button" onClick={() => setAuthMode('selection')} className="text-[10px] text-gray-400 hover:text-white underline">
                  ← Geri dön
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 mb-1">E-posta Adresi (Admin: admin@yakinlive.com)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@yakinlive.com"
                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
              >
                Giriş Yap ve Devam Et
              </button>
            </form>
          )}

          {authMode === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400">Telefon SMS Doğrulama</span>
                <button type="button" onClick={() => { setAuthMode('selection'); setStep('phone'); }} className="text-[10px] text-gray-400 hover:text-white underline">
                  ← Geri dön
                </button>
              </div>

              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-300 mb-1">Cep Telefonu Numarası</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0532 000 0000"
                        className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                  >
                    SMS Doğrulama Kodu Gönder
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/20 text-center">
                    <p className="text-xs text-gray-300">{phone} numarasına kod gönderildi.</p>
                    <p className="text-[10px] text-pink-400 mt-1 font-semibold">Süper Admin Test Kodu: 2026</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-300 mb-1">4 Haneli SMS Kodu</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 text-center text-lg tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    Kodu Onayla ve Giriş Yap
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

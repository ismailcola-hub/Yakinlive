import React, { useState } from "react";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";

import { auth } from "../firebase";
import {
  Shield,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  Smartphone,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userPartial: {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar: string;
    role: "user" | "admin";
  }) => void;
}

const ADMIN_EMAIL = "admin@yakinlive.com";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<
    "selection" | "email" | "phone"
  >("selection");

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const completeLogin = (user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }) => {
    const userEmail = user.email ?? "";
    
    // Admin rolü istemcide yalnızca e-posta ile belirlenmemelidir.
    // Gerçek admin yetkisi güvenli backend/Firestore kurallarıyla
    // doğrulanmalıdır. Burada tüm kullanıcılar normal kullanıcıdır.
    onLoginSuccess({
      id: user.uid,
      username:
        userEmail.split("@")[0] ||
        `kullanici_${user.uid.slice(0, 6)}`,
      displayName:
        user.displayName ||
        userEmail.split("@")[0] ||
        "Yakın Live Kullanıcısı",
      email: userEmail || undefined,
      avatar:
        user.photoURL ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      role: "user",
    });

    setSuccessMsg("Giriş başarılı!");
    setTimeout(onClose, 1000);
  };

  const handleEmailSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const credential = isRegister
        ? await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          )
        : await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

      completeLogin(credential.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Giriş yapılamadı.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      completeLogin(result.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google ile giriş başarısız."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      completeLogin(result.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Facebook ile giriş başarısız."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier =
          new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
          });
      }

      const verifier = (window as any).recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        phone.trim(),
        verifier
      );

      setConfirmation(result);
      setSuccessMsg("SMS doğrulama kodu gönderildi.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "SMS gönderilemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmation) {
        throw new Error("Önce SMS doğrulama kodu isteyin.");
      }

      const result = await confirmation.confirm(otpCode.trim());
      completeLogin(result.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Doğrulama başarısız."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#16122b] border border-purple-500/30 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl text-white">
        <div className="p-5 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-pink-300" />
            <div>
              <h2 className="text-lg font-bold">Yakın Live</h2>
              <p className="text-xs text-purple-200">
                Güvenli giriş ve üyelik
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-xl bg-red-500/20 text-red-300 text-sm break-words">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm flex gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMsg}
          </div>
        )}

        <div className="p-6 space-y-4">
          {authMode === "selection" && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold disabled:opacity-50"
              >
                Google ile giriş yap
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFacebookLogin}
                className="w-full py-3 rounded-xl bg-blue-600 font-bold disabled:opacity-50"
              >
                Facebook ile giriş yap
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("email")}
                className="w-full py-3 rounded-xl bg-purple-900/50 border border-purple-500/30 flex justify-center items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                E-posta / Üyelik / Admin
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("phone")}
                className="w-full py-3 rounded-xl bg-purple-900/50 border border-purple-500/30 flex justify-center items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Telefon ile giriş
              </button>
            </>
          )}

          {authMode === "email" && (
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <h3 className="font-bold text-pink-300">
                {isRegister ? "Yeni Üyelik" : "E-posta ile Giriş"}
              </h3>

              <p className="text-xs text-gray-400">
                Yönetici hesabı: {ADMIN_EMAIL}. Bu adres tek başına
                yönetici yetkisi vermez.
              </p>

              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresi"
                  className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-3 text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre (en az 6 karakter)"
                  className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold disabled:opacity-50"
              >
                {loading
                  ? "İşleniyor..."
                  : isRegister
                    ? "Üye Ol"
                    : "Giriş Yap"}
              </button>

              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="w-full text-sm text-pink-300 underline"
              >
                {isRegister
                  ? "Zaten üye misin? Giriş yap"
                  : "Hesabın yok mu? Üye ol"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("selection");
                  setError("");
                }}
                className="w-full text-sm text-gray-400"
              >
                ← Geri dön
              </button>
            </form>
          )}

          {authMode === "phone" && (
            <>
              <h3 className="font-bold text-pink-300">
                Telefon doğrulama
              </h3>

              {!confirmation ? (
                <form
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+905321234567"
                      className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-3 text-sm"
                    />
                  </div>

                  <div id="recaptcha-container" />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold"
                  >
                    {loading ? "Gönderiliyor..." : "SMS kodu gönder"}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="SMS doğrulama kodu"
                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 px-4 text-center"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 font-bold"
                  >
                    {loading ? "Kontrol ediliyor..." : "Kodu doğrula"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthMode("selection");
                  setConfirmation(null);
                  setError("");
                }}
                className="w-full text-sm text-gray-400"
              >
                ← Geri dön
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

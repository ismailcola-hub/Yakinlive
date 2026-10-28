

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";

export default function Login({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");
    try {
      if (register) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (error: any) {
      setMessage(error.message || "Bir hata oluştu.");
    }
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Önce e-posta adresini yaz.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Şifre sıfırlama e-postası gönderildi.");
    } catch (error: any) {
      setMessage(error.message || "E-posta gönderilemedi.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0a18] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold text-center">Yakın Live</h1>
        <p className="text-center text-purple-200">
          {register ? "Yeni hesap oluştur" : "Hesabına giriş yap"}
        </p>
        <input
          className="w-full rounded-xl bg-white/10 p-3"
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-white/10 p-3"
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full rounded-xl bg-pink-600 p-3 font-bold"
          onClick={submit}
        >
          {register ? "Kayıt ol" : "Giriş yap"}
        </button>
        <button
          className="w-full p-2 text-purple-200"
          onClick={() => {
            setRegister(!register);
            setMessage("");
          }}
        >
          {register ? "Zaten hesabın var mı? Giriş yap" : "Yeni hesap oluştur"}
        </button>
        {!register && (
          <button className="w-full p-2" onClick={resetPassword}>
            Şifremi unuttum
          </button>
        )}
        {message && (
          <p className="break-words text-center text-sm text-pink-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

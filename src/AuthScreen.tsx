
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

type AuthScreenProps = {
  onSuccess: () => void;
};

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }

    if (isRegister && username.trim().length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(credential.user, {
          displayName: username.trim(),
        });

        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          username: username.trim(),
          email: credential.user.email,
          role: 'member',
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      onSuccess();
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı.',
        'auth/invalid-email': 'E-posta adresini kontrol et.',
        'auth/invalid-credential': 'E-posta veya şifre yanlış.',
        'auth/weak-password': 'Daha güçlü bir şifre belirle.',
        'auth/network-request-failed': 'İnternet bağlantını kontrol et.',
        'auth/operation-not-allowed':
          'Firebase Console üzerinden e-posta/şifre girişini etkinleştir.',
      };

      setError(messages[err.code] || 'İşlem başarısız oldu. Tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a18] text-white flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-purple-500/30 bg-[#171126] p-6 shadow-xl"
      >
        <h1 className="text-3xl font-bold text-center">
          <span className="text-pink-400">Yakın</span> Live
        </h1>

        <p className="text-center text-purple-200 mt-2 mb-6">
          {isRegister ? 'Yeni hesabını oluştur' : 'Hesabına giriş yap'}
        </p>

        {isRegister && (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adı"
            autoComplete="username"
            required
            minLength={3}
            className="w-full mb-3 rounded-xl bg-white/10 p-3 outline-none"
          />
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresi"
          autoComplete="email"
          required
          className="w-full mb-3 rounded-xl bg-white/10 p-3 outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre (en az 6 karakter)"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          minLength={6}
          required
          className="w-full mb-4 rounded-xl bg-white/10 p-3 outline-none"
        />

        {error && (
          <p role="alert" className="text-sm text-red-400 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-3 font-bold disabled:opacity-50"
        >
          {loading
            ? 'Lütfen bekle...'
            : isRegister
              ? 'Üye Ol'
              : 'Giriş Yap'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="w

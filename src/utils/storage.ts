import { User, LiveStream, ReportItem, UserAccount } from '../types/index.ts';
import { INITIAL_STREAMS, INITIAL_REPORTS } from '../data/mockStreams.ts';
import { isDefaultAdminCredentials } from './logic.ts';

const USER_KEY = 'yakin_live_user_v1';
const STREAMS_KEY = 'yakin_live_streams_v2';
const REPORTS_KEY = 'yakin_live_reports_v1';
const DAILY_BONUS_KEY = 'yakin_live_daily_bonus_v1';
const ACCOUNTS_KEY = 'yakin_live_accounts_v1';

export const DEFAULT_ADMIN_ACCOUNT: UserAccount = {
  id: 'admin_root',
  username: 'admin',
  email: 'admin@yakinlive.com',
  password: 'admin123',
  displayName: 'Süper Admin',
  avatar: '👑',
  role: 'admin',
  coins: 99999,
  diamonds: 50000,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_MEMBER_ACCOUNT: UserAccount = {
  id: 'user_local_guest',
  username: 'yakin_yildiz',
  email: 'kullanici@yakinlive.com',
  password: '123456',
  displayName: 'YakınKullanıcı',
  avatar: '✨',
  role: 'user',
  coins: 500,
  diamonds: 80,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEFAULT_USER: User = {
  id: 'user_local_guest',
  username: 'yakin_yildiz',
  displayName: 'YakınKullanıcı',
  avatar: '✨',
  role: 'user',
  coins: 500,
  diamonds: 80,
  level: 3,
  xp: 320,
  bio: 'Yakın Live topluluğuna yeni katıldım! 🌟',
  followersCount: 14,
  followingCount: 3,
  isVerified: false,
  isModerator: false,
};

export function loadAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [DEFAULT_ADMIN_ACCOUNT, DEFAULT_MEMBER_ACCOUNT];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin account always exists
        const hasAdmin = parsed.some((acc) => acc.role === 'admin' || acc.email === 'admin@yakinlive.com');
        if (!hasAdmin) {
          const combined = [DEFAULT_ADMIN_ACCOUNT, ...parsed];
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(combined));
          return combined;
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  const defaults = [DEFAULT_ADMIN_ACCOUNT, DEFAULT_MEMBER_ACCOUNT];
  saveAccounts(defaults);
  return defaults;
}

export function saveAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // fallback
  }
}

export function registerAccount(accountData: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  avatar?: string;
  role?: 'user' | 'moderator' | 'admin';
}): { success: boolean; user?: User; error?: string } {
  const accounts = loadAccounts();
  const cleanEmail = accountData.email.trim().toLowerCase();
  const cleanUsername = accountData.username.trim().toLowerCase();

  // Check unique email and username
  if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Bu e-posta adresi ile zaten kayıtlı bir üyelik var.' };
  }
  if (accounts.some((acc) => acc.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.' };
  }

  const isFirstAdmin = cleanEmail === 'admin@yakinlive.com' || cleanUsername === 'admin';
  const role = accountData.role || (isFirstAdmin ? 'admin' : 'user');

  const newAccount: UserAccount = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    username: accountData.username.trim(),
    email: cleanEmail,
    password: accountData.password,
    displayName: accountData.displayName?.trim() || accountData.username.trim(),
    avatar: accountData.avatar || '✨',
    role,
    coins: role === 'admin' ? 99999 : 500, // 500 starting bonus coins
    diamonds: role === 'admin' ? 50000 : 0,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  const user: User = {
    id: newAccount.id,
    username: newAccount.username,
    displayName: newAccount.displayName,
    avatar: newAccount.avatar,
    email: newAccount.email,
    role: newAccount.role,
    coins: newAccount.coins,
    diamonds: newAccount.diamonds,
    level: 1,
    xp: 0,
    bio: 'Yakın Live üyesi ✨',
    followersCount: 0,
    followingCount: 0,
    isVerified: role === 'admin',
    isModerator: role === 'admin' || role === 'moderator',
    createdAt: newAccount.createdAt,
  };

  saveUser(user);
  return { success: true, user };
}

export function loginWithCredentials(
  identifier: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. Master administrator check: admin / admin@yakinlive.com with admin123 ALWAYS succeeds
  if (isDefaultAdminCredentials(cleanId, cleanPass)) {
    const accounts = loadAccounts();
    const adminIdx = accounts.findIndex(
      (acc) =>
        acc.role === 'admin' ||
        acc.email.toLowerCase() === 'admin@yakinlive.com' ||
        acc.username.toLowerCase() === 'admin'
    );
    if (adminIdx !== -1) {
      accounts[adminIdx].password = cleanPass;
      accounts[adminIdx].role = 'admin';
    } else {
      accounts.unshift(DEFAULT_ADMIN_ACCOUNT);
    }
    saveAccounts(accounts);

    const adminUser: User = {
      id: DEFAULT_ADMIN_ACCOUNT.id,
      username: DEFAULT_ADMIN_ACCOUNT.username,
      displayName: DEFAULT_ADMIN_ACCOUNT.displayName,
      email: DEFAULT_ADMIN_ACCOUNT.email,
      role: 'admin',
      avatar: DEFAULT_ADMIN_ACCOUNT.avatar,
      coins: DEFAULT_ADMIN_ACCOUNT.coins,
      diamonds: DEFAULT_ADMIN_ACCOUNT.diamonds,
      level: 99,
      xp: 99999,
      bio: 'Yakın Live Sistem Yöneticisi 🛡️',
      followersCount: 999,
      followingCount: 10,
      isVerified: true,
      isModerator: true,
      createdAt: DEFAULT_ADMIN_ACCOUNT.createdAt,
    };
    saveUser(adminUser);
    return { success: true, user: adminUser };
  }

  // 2. Standard account lookup
  const accounts = loadAccounts();
  const match = accounts.find(
    (acc) => acc.email.toLowerCase() === cleanId || acc.username.toLowerCase() === cleanId
  );

  if (!match) {
    return { success: false, error: 'Kayıtlı üye bulunamadı. E-posta veya kullanıcı adınızı kontrol edin.' };
  }

  if (match.isBanned) {
    return { success: false, error: 'Bu hesabın erişimi yönetici tarafından kısıtlanmıştır.' };
  }

  if (match.password !== cleanPass) {
    return { success: false, error: 'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.' };
  }

  const user: User = {
    id: match.id,
    username: match.username,
    displayName: match.displayName,
    avatar: match.avatar,
    email: match.email,
    role: match.role,
    coins: match.coins,
    diamonds: match.diamonds,
    level: Math.max(1, Math.floor(match.coins / 300) + 1),
    xp: match.coins,
    bio: match.role === 'admin' ? 'Yakın Live Sistem Yöneticisi 🛡️' : 'Yakın Live üyesi ✨',
    followersCount: match.role === 'admin' ? 999 : 14,
    followingCount: match.role === 'admin' ? 10 : 3,
    isVerified: match.role === 'admin',
    isModerator: match.role === 'admin' || match.role === 'moderator',
    createdAt: match.createdAt,
  };

  saveUser(user);
  return { success: true, user };
}

export function updateAccount(accountId: string, updates: Partial<UserAccount>): boolean {
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx === -1) return false;

  accounts[idx] = { ...accounts[idx], ...updates };
  saveAccounts(accounts);
  return true;
}

export function deleteAccount(accountId: string): boolean {
  let accounts = loadAccounts();
  // Don't delete root admin
  if (accountId === DEFAULT_ADMIN_ACCOUNT.id) return false;
  accounts = accounts.filter((a) => a.id !== accountId);
  saveAccounts(accounts);
  return true;
}

export function resetAccountPassword(accountId: string, newPassword: string): boolean {
  return updateAccount(accountId, { password: newPassword });
}

export function loadUser(): User {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      return { ...DEFAULT_USER, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // fallback
  }
}

export function loadStreams(): LiveStream[] {
  if (typeof window === 'undefined') return INITIAL_STREAMS;
  try {
    const raw = localStorage.getItem(STREAMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_STREAMS;
}

export function saveStreams(streams: LiveStream[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAMS_KEY, JSON.stringify(streams));
  } catch {
    // fallback
  }
}

export function loadReports(): ReportItem[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS;
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_REPORTS;
}

export function saveReports(reports: ReportItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch {
    // fallback
  }
}

export function canClaimDailyBonus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastClaim = localStorage.getItem(DAILY_BONUS_KEY);
    if (!lastClaim) return true;
    const lastTime = parseInt(lastClaim, 10);
    const hoursPassed = (Date.now() - lastTime) / (1000 * 60 * 60);
    return hoursPassed >= 12;
  } catch {
    return true;
  }
}

export function recordDailyBonusClaim(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_BONUS_KEY, Date.now().toString());
  } catch {
    // fallback
  }
}

import { User, LiveStream, ReportItem } from '../types/index.ts';
import { INITIAL_STREAMS, INITIAL_REPORTS } from '../data/mockStreams.ts';

const USER_KEY = 'yakin_live_user_v1';
const STREAMS_KEY = 'yakin_live_streams_v1';
const REPORTS_KEY = 'yakin_live_reports_v1';
const DAILY_BONUS_KEY = 'yakin_live_daily_bonus_v1';

export const DEFAULT_USER: User = {
  id: 'user_local_guest',
  username: 'yakin_yildiz',
  displayName: 'YakınKullanıcı',
  avatar: '✨',
  coins: 500, // starting balance
  diamonds: 80,
  level: 3,
  xp: 320,
  bio: 'Yakın Live topluluğuna yeni katıldım! 🌟',
  followersCount: 14,
  followingCount: 3,
  isVerified: false,
  isModerator: true, // give admin access test capability
};

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
    // Can claim every 24 hours (or 1 minute for demo testing if last claim was > 1 min ago)
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

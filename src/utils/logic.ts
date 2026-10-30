import { User, Gift, LiveStream, ChatMessage } from '../types/index.ts';

/**
 * Calculates user level based on XP (earned through watching, gifting, chatting)
 */
export function calculateLevel(xp: number): {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, xp);
  let level = 1;
  let remaining = safeXp;
  let threshold = 100;

  while (remaining >= threshold && level < 99) {
    remaining -= threshold;
    level++;
    threshold = Math.floor(100 * Math.pow(1.15, level - 1));
  }

  const progressPercent = Math.min(100, Math.round((remaining / threshold) * 100));

  return {
    level,
    currentXp: remaining,
    nextLevelXp: threshold,
    progressPercent,
  };
}

/**
 * Validates if a user has sufficient coins to send a gift
 */
export function canAffordGift(userCoins: number, giftCost: number): boolean {
  return typeof userCoins === 'number' && userCoins >= giftCost && giftCost > 0;
}

/**
 * Processes a gift purchase and produces updated user balance and diamonds
 */
export function processGiftTransaction(
  user: User,
  gift: Gift
): {
  updatedUser: User;
  success: boolean;
  earnedDiamonds: number;
  earnedXp: number;
} {
  if (!canAffordGift(user.coins, gift.cost)) {
    return {
      updatedUser: user,
      success: false,
      earnedDiamonds: 0,
      earnedXp: 0,
    };
  }

  const earnedXp = Math.round(gift.cost * 1.5);
  const earnedDiamonds = gift.diamondsReward || Math.floor(gift.cost * 0.5);
  const newXp = (user.xp || 0) + earnedXp;
  const levelInfo = calculateLevel(newXp);

  const updatedUser: User = {
    ...user,
    coins: user.coins - gift.cost,
    xp: newXp,
    level: levelInfo.level,
    diamonds: (user.diamonds || 0) + earnedDiamonds,
  };

  return {
    updatedUser,
    success: true,
    earnedDiamonds,
    earnedXp,
  };
}

/**
 * Formats viewer counts to clean human-readable notation (e.g. 1.2K, 850)
 */
export function formatViewerCount(count: number): string {
  if (count < 0) return '0';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}

export function normalizeText(str: string): string {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filters and searches live streams
 */
export function filterStreams(
  streams: LiveStream[],
  filterCategory: string,
  searchQuery: string = ''
): LiveStream[] {
  const query = normalizeText(searchQuery.trim());

  return streams.filter((stream) => {
    // Category match
    const categoryMatch =
      filterCategory === 'all' ||
      (filterCategory === 'popular' && stream.viewerCount >= 500) ||
      (filterCategory === 'new' && stream.viewerCount < 500) ||
      stream.category === filterCategory;

    // Search query match
    if (!query) return categoryMatch;

    const queryMatch =
      normalizeText(stream.title).includes(query) ||
      normalizeText(stream.hostName).includes(query) ||
      stream.tags.some((tag) => normalizeText(tag).includes(query));

    return categoryMatch && queryMatch;
  });
}

/**
 * Builds a chat message with safe defaults
 */
export function createChatMessage(
  streamId: string,
  user: User,
  text: string,
  gift?: Gift
): ChatMessage {
  return {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    streamId,
    senderId: user.id,
    senderName: user.displayName || user.username,
    senderAvatar: user.avatar,
    senderLevel: user.level,
    isHost: false,
    isModerator: !!user.isModerator,
    text: text.trim(),
    isGift: !!gift,
    giftInfo: gift
      ? {
          name: gift.name,
          icon: gift.icon,
          amount: 1,
        }
      : undefined,
    timestamp: Date.now(),
  };
}

/**
 * Validates registration input for Yeni Üyelik
 */
export function validateRegistrationInput(data: {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): { isValid: boolean; error?: string } {
  const username = data.username.trim();
  const email = data.email.trim();
  const password = data.password;

  if (username.length < 3) {
    return { isValid: false, error: 'Kullanıcı adı en az 3 karakter olmalıdır.' };
  }

  // Basic email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: 'Lütfen geçerli bir e-posta adresi girin.' };
  }

  if (!password || password.length < 6) {
    return { isValid: false, error: 'Şifre en az 6 karakter olmalıdır.' };
  }

  if (data.confirmPassword !== undefined && password !== data.confirmPassword) {
    return { isValid: false, error: 'Girdiğiniz şifreler birbiriyle eşleşmiyor!' };
  }

  return { isValid: true };
}

/**
 * Validates login input
 */
export function validateLoginInput(
  identifier: string,
  password: string
): { isValid: boolean; error?: string } {
  if (!identifier || identifier.trim().length === 0) {
    return { isValid: false, error: 'Lütfen e-posta veya kullanıcı adınızı girin.' };
  }
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Lütfen şifrenizi girin.' };
  }
  return { isValid: true };
}

/**
 * Checks if credentials match the predefined administrator credentials
 */
export function isDefaultAdminCredentials(identifier: string, password: string): boolean {
  const clean = identifier.trim().toLowerCase();
  const isMatchUser = clean === 'admin' || clean === 'admin@yakinlive.com';
  const isMatchPass = password === 'admin123';
  return isMatchUser && isMatchPass;
}

export function isHostFollowed(followedIds: string[], hostId: string): boolean {
  return Array.isArray(followedIds) && followedIds.includes(hostId);
}

/**
 * Creates an elegant user join chat notification
 */
export function createJoinNotificationMessage(
  streamId: string,
  user: {
    id: string;
    displayName?: string;
    username: string;
    avatar: string;
    level?: number;
    role?: string;
  }
): ChatMessage {
  const name = user.displayName || user.username;
  return {
    id: 'join_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    streamId,
    senderId: user.id,
    senderName: name,
    senderAvatar: user.avatar,
    senderLevel: user.level || 1,
    isModerator: user.role === 'admin' || user.role === 'moderator',
    text: `${name} yayına katıldı ✨`,
    isJoinNotification: true,
    timestamp: Date.now(),
  };
}

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
  // Each level requires 100 * level XP
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

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  email?: string;
  role: UserRole;
  coins: number;
  diamonds: number;
  level: number;
  xp: number;
  bio: string;
  followersCount: number;
  followingCount: number;
  friendsCount?: number;
  isVerified?: boolean;
  isModerator?: boolean;
  isBanned?: boolean;
  createdAt?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password: string; // Stored password
  displayName: string;
  avatar: string;
  role: UserRole;
  coins: number;
  diamonds: number;
  isBanned?: boolean;
  createdAt: string;
}

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: 'all' | 'popular' | 'new' | 'music' | 'chat' | 'gaming' | 'party';
  viewerCount: number;
  likesCount: number;
  tags: string[];
  isLive: boolean;
  isUserBroadcasting?: boolean;
  bgGradient: string;
  filter?: string;
  startedAt: number;
  coverImage?: string;
  hostLevel?: number;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  diamondsReward: number;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  category?: 'popular' | 'luxury' | 'event' | 'vip';
  animation: 'float' | 'pulse' | 'blast' | 'crown' | 'car' | 'dragon' | 'castle' | 'yacht' | 'fireworks';
  badge?: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderLevel: number;
  isHost?: boolean;
  isModerator?: boolean;
  text: string;
  isGift?: boolean;
  isJoinNotification?: boolean;
  giftInfo?: {
    name: string;
    icon: string;
    amount: number;
  };
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isGift?: boolean;
  giftIcon?: string;
}

export interface DirectChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantLevel: number;
  isOnline: boolean;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export interface ReportItem {
  id: string;
  streamId: string;
  streamTitle: string;
  reportedUser: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: number;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  priceTry: number;
  isPopular?: boolean;
  badge?: string;
}

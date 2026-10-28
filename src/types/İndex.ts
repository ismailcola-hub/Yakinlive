
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coins: number;
  diamonds: number;
  level: number;
  xp: number;
  bio: string;
  followersCount: number;
  followingCount: number;
  email?: string;
  role?: "user" | "admin";
  isVerified?: boolean;
  isModerator?: boolean;
}

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: "all" | "popular" | "new" | "music" | "chat" | "gaming";
  viewerCount: number;
  likesCount: number;
  tags: string[];
  isLive: boolean;
  isUserBroadcasting?: boolean;
  bgGradient: string;
  filter?: string;
  startedAt: number;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
  diamondsReward: number;
  tier: "common" | "rare" | "epic" | "legendary";
  animation: "float" | "pulse" | "blast" | "crown" | "car";
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
  giftInfo?: {
    name: string;
    icon: string;
    amount: number;
  };
  timestamp: number;
}

export interface ReportItem {
  id: string;
  streamId: string;
  streamTitle: string;
  reportedUser: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
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

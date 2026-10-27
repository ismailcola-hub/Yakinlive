export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatar: string;
  role?: 'user' | 'admin';
  coins: number;
  diamonds: number;
  level: number;
  xp: number;
  followersCount: number;
  followingCount: number;
  isModerator?: boolean;
}

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  category: string;
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
  image: string;
  price: number;
  animation?: string;
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

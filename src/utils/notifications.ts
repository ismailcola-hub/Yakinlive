import { LiveStream } from '../types/index.ts';
import { playCoinSound } from './audio.ts';

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationStatus;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return false;
  }
}

export function sendLiveBroadcastNotification(
  stream: LiveStream,
  onClick?: () => void
): boolean {
  if (typeof window === 'undefined') return false;

  // Play audio chime
  try {
    playCoinSound();
  } catch {}

  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const title = `${stream.hostAvatar} ${stream.hostName} Canlı Yayına Başladı! 🔴`;
      const options: NotificationOptions = {
        body: `"${stream.title}"\nŞimdi izlemek için dokunun! 👥 ${stream.viewerCount} kişi izliyor.`,
        icon: '/assets/icon.svg',
        badge: '/assets/icon.svg',
        tag: `live_stream_${stream.id}_${Date.now()}`,
        requireInteraction: false,
      };

      const notif = new Notification(title, options);

      notif.onclick = () => {
        try {
          window.focus();
        } catch {}
        if (onClick) onClick();
        notif.close();
      };

      return true;
    } catch (err) {
      console.warn('Native notification trigger warning:', err);
      return false;
    }
  }

  return false;
}

export function sendTestNotification(onClick?: () => void): boolean {
  const dummyStream: LiveStream = {
    id: 'test_stream_' + Date.now(),
    hostId: 'host_mavikedi',
    hostName: 'MaviKedi',
    hostAvatar: '🎀',
    title: 'Gece Akustik & Şarkı İstekleri 🎵',
    category: 'music',
    viewerCount: 1420,
    likesCount: 3800,
    tags: ['müzik', 'canlı'],
    isLive: true,
    bgGradient: 'from-pink-500 to-purple-600',
    startedAt: Date.now(),
  };

  return sendLiveBroadcastNotification(dummyStream, onClick);
}

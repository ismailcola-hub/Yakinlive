import React, { useState, useEffect } from 'react';
import { User, LiveStream, Gift, ReportItem } from './types/index.ts';
import {
  loadUser,
  saveUser,
  loadStreams,
  saveStreams,
  loadReports,
  saveReports,
  canClaimDailyBonus,
  recordDailyBonusClaim,
} from './utils/storage.ts';
import { toggleMuteSound, getMuteState } from './utils/audio.ts';
import { Navbar } from './components/Navbar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { LiveRoom } from './components/LiveRoom.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { BroadcastModal } from './components/BroadcastModal.tsx';
import { CoinStoreModal } from './components/CoinStoreModal.tsx';
import { GiftAnimationOverlay } from './components/GiftAnimationOverlay.tsx';
import { ExportDownloadModal } from './components/ExportDownloadModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { sendLiveBroadcastNotification } from './utils/notifications.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(loadUser);
  const [streams, setStreams] = useState<LiveStream[]>(loadStreams);
  const [reports, setReports] = useState<ReportItem[]>(loadReports);
  const [activeTab, setActiveTab] = useState<'discover' | 'live' | 'profile' | 'admin'>('discover');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  // Modals
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('login');
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);

  // Floating Live Notification Banner for Favorite Broadcasters
  const [activeLiveBanner, setActiveLiveBanner] = useState<LiveStream | null>(null);

  // Sound and Animations
  const [isMuted, setIsMuted] = useState(getMuteState);
  const [activeAnimatedGift, setActiveAnimatedGift] = useState<{ gift: Gift; senderName: string } | null>(null);

  // Global Admin Announcement Banner
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string | null>(null);

  // Followed host IDs
  const [followedHostIds, setFollowedHostIds] = useState<string[]>(['host_mavikedi']);

  // Daily bonus state
  const [canClaimDaily, setCanClaimDaily] = useState(canClaimDailyBonus);

  // Save changes to storage
  useEffect(() => {
    saveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStreams(streams);
  }, [streams]);

  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  // Handle URL query parameters (e.g. ?autostart=1 or ?room=id or ?admin=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && streams.length > 0) {
        setSelectedStream(streams[0]);
        setActiveTab('live');
      } else if (params.get('room')) {
        const roomId = params.get('room');
        const match = streams.find((s) => s.id === roomId);
        if (match) {
          setSelectedStream(match);
          setActiveTab('live');
        }
      } else if (params.get('admin') === 'true') {
        setCurrentUser((prev) => ({
          ...prev,
          role: 'admin',
          username: 'admin',
          displayName: 'Süper Admin',
          isVerified: true,
          isModerator: true,
        }));
        setActiveTab('admin');
      }
    }
  }, [streams]);

  // Show login/registration modal on first site visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('yakin_seen_welcome_v3');
      if (!hasVisited) {
        localStorage.setItem('yakin_seen_welcome_v3', 'true');
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  const handleToggleMute = () => {
    const newState = toggleMuteSound();
    setIsMuted(newState);
  };

  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated);
  };

  const handleCoinsPurchased = (amount: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  const handleClaimDaily = () => {
    recordDailyBonusClaim();
    setCanClaimDaily(false);
    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins + 50,
      xp: prev.xp + 20,
    }));
  };

  const handleOpenRoom = (stream: LiveStream) => {
    setSelectedStream(stream);
    setActiveTab('live');
  };

  // Broadcast Creation
  const handleStartLive = ({
    title,
    category,
    tags,
    filter,
    mediaStream,
  }: {
    title: string;
    category: LiveStream['category'];
    tags: string[];
    filter: string;
    mediaStream: MediaStream | null;
  }) => {
    const userStreamId = 'stream_user_' + Date.now();
    const newStream: LiveStream = {
      id: userStreamId,
      hostId: currentUser.id,
      hostName: currentUser.displayName || currentUser.username,
      hostAvatar: currentUser.avatar,
      title,
      category,
      viewerCount: 1,
      likesCount: 5,
      tags,
      isLive: true,
      isUserBroadcasting: true,
      bgGradient: 'from-pink-600 via-purple-700 to-indigo-950',
      filter,
      startedAt: Date.now(),
    };

    setActiveMediaStream(mediaStream);
    setStreams((prev) => [newStream, ...prev]);
    setSelectedStream(newStream);
    setIsBroadcastModalOpen(false);
    setActiveTab('live');
  };

  const handleEndBroadcast = (streamId: string) => {
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach((track) => track.stop());
      setActiveMediaStream(null);
    }
    setStreams((prev) => prev.filter((s) => s.id !== streamId));
    setSelectedStream(null);
    setActiveTab('discover');
  };

  const handleToggleFollow = (hostId: string) => {
    setFollowedHostIds((prev) => {
      const exists = prev.includes(hostId);
      const next = exists ? prev.filter((id) => id !== hostId) : [...prev, hostId];
      setCurrentUser((u) => ({
        ...u,
        followingCount: Math.max(0, u.followingCount + (exists ? -1 : 1)),
      }));
      return next;
    });
  };

  const handleReportStream = (
    streamId: string,
    streamTitle: string,
    hostName: string,
    reason: string
  ) => {
    const newReport: ReportItem = {
      id: 'rep_' + Date.now(),
      streamId,
      streamTitle,
      reportedUser: hostName,
      reason,
      status: 'pending',
      timestamp: Date.now(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleResolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action } : r))
    );
  };

  const handleSendAdminAnnouncement = (msg: string) => {
    setGlobalAnnouncement(msg);
    setTimeout(() => {
      setGlobalAnnouncement(null);
    }, 7000);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'live') {
      if (!selectedStream && streams.length > 0) {
        setSelectedStream(streams[0]);
      }
      setActiveTab('live');
    } else {
      setActiveTab(tab as 'discover' | 'live' | 'profile' | 'admin');
    }
  };

  // Login / Registration / Admin login successful handler
  const handleLoginSuccess = (userPartial: Partial<User>) => {
    const isSuperAdmin =
      userPartial.role === 'admin' ||
      userPartial.email === 'admin@yakinlive.com' ||
      userPartial.username === 'admin';

    setCurrentUser((prev) => ({
      ...prev,
      ...userPartial,
      role: isSuperAdmin ? 'admin' : (userPartial.role || prev.role || 'user'),
      isVerified: isSuperAdmin ? true : prev.isVerified,
      isModerator: isSuperAdmin ? true : prev.isModerator,
    }));
    setIsAuthModalOpen(false);

    if (isSuperAdmin) {
      setActiveTab('admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a18] text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Global Admin Announcement Banner */}
      {globalAnnouncement && (
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white px-4 py-2 text-xs font-black text-center sticky top-0 z-50 shadow-lg flex items-center justify-center gap-2 animate-pulse">
          <span>📢 SİSTEM DUYURUSU:</span>
          <span>{globalAnnouncement}</span>
          <button
            onClick={() => setGlobalAnnouncement(null)}
            className="ml-3 text-white/80 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Instant Notification Banner when a Favorite Host goes Live */}
      {activeLiveBanner && (
        <div className="fixed top-14 left-4 right-4 max-w-md mx-auto z-50 p-3 rounded-2xl bg-[#1d1430]/95 border border-pink-500/60 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-md">
              {activeLiveBanner.hostAvatar}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white truncate">
                  {activeLiveBanner.hostName}
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                  CANLI
                </span>
              </div>
              <p className="text-[11px] text-purple-200 truncate">{activeLiveBanner.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                handleOpenRoom(activeLiveBanner);
                setActiveLiveBanner(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              İzle
            </button>
            <button
              onClick={() => setActiveLiveBanner(null)}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onOpenStore={() => setIsStoreOpen(true)}
        onStartBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Body Routing */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {activeTab === 'discover' && (
          <DiscoverView
            streams={streams}
            onOpenRoom={handleOpenRoom}
            onStartBroadcast={() => setIsBroadcastModalOpen(true)}
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'login');
              setIsAuthModalOpen(true);
            }}
            currentUserRole={currentUser.role}
          />
        )}

        {activeTab === 'live' && (
          selectedStream ? (
            <LiveRoom
              stream={selectedStream}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onBack={() => setActiveTab('discover')}
              onOpenStore={() => setIsStoreOpen(true)}
              onTriggerGiftAnimation={(gift, senderName) =>
                setActiveAnimatedGift({ gift, senderName })
              }
              onReportStream={handleReportStream}
              onEndBroadcast={handleEndBroadcast}
              isFollowing={followedHostIds.includes(selectedStream.hostId)}
              onToggleFollow={handleToggleFollow}
              activeMediaStream={activeMediaStream}
            />
          ) : (
            <div className="text-center py-20 px-4">
              <p className="text-sm text-purple-200">Aktif bir canlı yayın seçilmedi.</p>
              <button
                onClick={() => {
                  if (streams.length > 0) setSelectedStream(streams[0]);
                  else setActiveTab('discover');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold"
              >
                Yayınları Gör
              </button>
            </div>
          )
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onOpenStore={() => setIsStoreOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenAuth={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            streams={streams}
            reports={reports}
            onEndStream={(streamId) => {
              setStreams((prev) => prev.filter((s) => s.id !== streamId));
              if (selectedStream?.id === streamId) setSelectedStream(null);
            }}
            onResolveReport={handleResolveReport}
            onSendAnnouncement={handleSendAdminAnnouncement}
            onUpdateCurrentUser={handleUpdateUser}
            onOpenAuthModal={() => {
              setAuthModalMode('admin');
              setIsAuthModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onStartBroadcast={() => setIsBroadcastModalOpen(true)}
        hasActiveBroadcast={!!streams.find((s) => s.isUserBroadcasting)}
      />

      {/* Broadcast Creator Modal */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onStartLive={handleStartLive}
        userAvatar={currentUser.avatar}
        userName={currentUser.displayName || currentUser.username}
      />

      {/* Coin Top Up / Store Modal */}
      <CoinStoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        currentCoins={currentUser.coins}
        onCoinsPurchased={handleCoinsPurchased}
        canClaimDaily={canClaimDaily}
        onClaimDaily={handleClaimDaily}
      />

      {/* Floating Gift Animation Overlay */}
      <GiftAnimationOverlay
        gift={activeAnimatedGift?.gift || null}
        senderName={activeAnimatedGift?.senderName || ''}
        onAnimationEnd={() => setActiveAnimatedGift(null)}
      />

      {/* Download ZIP, GitHub & APK Modal */}
      <ExportDownloadModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* User Auth Modal with Member Login, Yeni Üyelik & Admin Girişi */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Browser Live Broadcast Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        followedHostIds={followedHostIds}
        streams={streams}
        onSelectStream={handleOpenRoom}
        onToggleFollow={handleToggleFollow}
      />
    </div>
  );
}

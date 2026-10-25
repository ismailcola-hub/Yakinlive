import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevel,
  canAffordGift,
  processGiftTransaction,
  formatViewerCount,
  filterStreams,
} from './logic.ts';
import { User, Gift, LiveStream } from '../types/index.ts';

test('calculateLevel computes starting level and progress', () => {
  const level0 = calculateLevel(0);
  assert.equal(level0.level, 1);
  assert.equal(level0.currentXp, 0);
  assert.equal(level0.progressPercent, 0);

  const levelMid = calculateLevel(50);
  assert.equal(levelMid.level, 1);
  assert.equal(levelMid.currentXp, 50);
  assert.equal(levelMid.progressPercent, 50);

  const levelUp = calculateLevel(120);
  assert.equal(levelUp.level, 2);
  assert.ok(levelUp.currentXp > 0);
});

test('canAffordGift returns true only when user has enough balance', () => {
  assert.equal(canAffordGift(100, 50), true);
  assert.equal(canAffordGift(50, 50), true);
  assert.equal(canAffordGift(49, 50), false);
  assert.equal(canAffordGift(0, 10), false);
});

test('processGiftTransaction deducts coins and awards diamonds and XP', () => {
  const initialUser: User = {
    id: 'user_1',
    username: 'test_user',
    displayName: 'Test',
    avatar: '🌸',
    coins: 500,
    diamonds: 0,
    level: 1,
    xp: 0,
    bio: 'Test bio',
    followersCount: 10,
    followingCount: 5,
  };

  const gift: Gift = {
    id: 'gift_rose',
    name: 'Gül',
    icon: '🌹',
    cost: 20,
    diamondsReward: 10,
    tier: 'common',
    animation: 'float',
  };

  const result = processGiftTransaction(initialUser, gift);
  assert.equal(result.success, true);
  assert.equal(result.updatedUser.coins, 480);
  assert.equal(result.updatedUser.diamonds, 10);
  assert.ok(result.updatedUser.xp > 0);

  // Insufficient balance test
  const poorUser: User = { ...initialUser, coins: 5 };
  const failResult = processGiftTransaction(poorUser, gift);
  assert.equal(failResult.success, false);
  assert.equal(failResult.updatedUser.coins, 5);
});

test('formatViewerCount formats counts to readable strings', () => {
  assert.equal(formatViewerCount(0), '0');
  assert.equal(formatViewerCount(98), '98');
  assert.equal(formatViewerCount(1200), '1.2K');
  assert.equal(formatViewerCount(15000), '15K');
  assert.equal(formatViewerCount(1200000), '1.2M');
});

test('filterStreams correctly filters by category and search term', () => {
  const streams: LiveStream[] = [
    {
      id: 's1',
      hostId: 'h1',
      hostName: 'MaviKedi',
      hostAvatar: '🎀',
      title: 'Müzik ve Gece Sohbeti',
      category: 'popular',
      viewerCount: 1200,
      likesCount: 2500,
      tags: ['müzik', 'akustik'],
      isLive: true,
      bgGradient: 'from-pink-500 to-purple-600',
      startedAt: Date.now(),
    },
    {
      id: 's2',
      hostId: 'h2',
      hostName: 'Deniz35',
      hostAvatar: '🌊',
      title: 'İzmir Sohbetleri',
      category: 'new',
      viewerCount: 120,
      likesCount: 300,
      tags: ['sohbet'],
      isLive: true,
      bgGradient: 'from-blue-500 to-indigo-600',
      startedAt: Date.now(),
    },
  ];

  // All filter
  const all = filterStreams(streams, 'all');
  assert.equal(all.length, 2);

  // Popular filter (>= 500)
  const pop = filterStreams(streams, 'popular');
  assert.equal(pop.length, 1);
  assert.equal(pop[0].hostName, 'MaviKedi');

  // New filter (< 500)
  const newOnes = filterStreams(streams, 'new');
  assert.equal(newOnes.length, 1);
  assert.equal(newOnes[0].hostName, 'Deniz35');

  // Search filter
  const searched = filterStreams(streams, 'all', 'izmir');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].hostName, 'Deniz35');
});

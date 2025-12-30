import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheSyncService } from './cacheSync';
import { apolloClient } from './apollo';
import { storageService } from './storage';

// Mock dependencies
vi.mock('./apollo', () => ({
  apolloClient: {
    cache: {
      extract: vi.fn(() => ({
        'Restroom:1': { id: '1', name: 'Test Restroom 1' },
        'Restroom:2': { id: '2', name: 'Test Restroom 2' },
      })),
    },
    clearStore: vi.fn(),
    resetStore: vi.fn(),
  },
  invalidateRestroomQueries: vi.fn(),
}));

vi.mock('./storage', () => ({
  storageService: {
    getOfflineRestrooms: vi.fn(() => [
      { id: '3', name: 'Offline Restroom 1' },
    ]),
    setOfflineRestrooms: vi.fn(() => true),
    getSearchHistory: vi.fn(() => [
      { query: 'test', timestamp: Date.now() - 1000 },
    ]),
    clearSearchHistory: vi.fn(() => true),
    addSearchHistoryItem: vi.fn(() => true),
    getFormDrafts: vi.fn(() => [
      { id: 'draft1', type: 'restroom', data: {}, timestamp: Date.now() - 1000 },
    ]),
    clearFormDrafts: vi.fn(() => true),
    saveFormDraft: vi.fn(() => true),
    clearAllData: vi.fn(() => true),
    getStorageUsage: vi.fn(() => ({ used: 1024, available: true })),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('CacheSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncRestrooms', () => {
    it('should sync restrooms successfully', async () => {
      const result = await cacheSyncService.syncRestrooms({ forceRefresh: true });

      expect(result.success).toBe(true);
      expect(result.syncedItems).toBeGreaterThan(0);
      expect(storageService.setOfflineRestrooms).toHaveBeenCalled();
    });

    it('should skip sync when data is fresh', async () => {
      // First sync
      await cacheSyncService.syncRestrooms({ forceRefresh: true });
      
      // Second sync without force refresh should skip
      const result = await cacheSyncService.syncRestrooms({ maxAge: 60000 });

      expect(result.errors).toContain('Sync not needed - data is fresh');
    });

    it('should handle sync errors gracefully', async () => {
      vi.mocked(storageService.setOfflineRestrooms).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await cacheSyncService.syncRestrooms({ forceRefresh: true });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('syncUserData', () => {
    it('should clean up old search history', async () => {
      // Mock old search history
      vi.mocked(storageService.getSearchHistory).mockReturnValue([
        { query: 'old', timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) }, // 31 days old
        { query: 'recent', timestamp: Date.now() - 1000 }, // 1 second old
      ]);

      const result = await cacheSyncService.syncUserData();

      expect(result.success).toBe(true);
      expect(storageService.clearSearchHistory).toHaveBeenCalled();
    });

    it('should clean up old form drafts', async () => {
      // Mock old form drafts
      vi.mocked(storageService.getFormDrafts).mockReturnValue([
        { 
          id: 'old-draft', 
          type: 'restroom', 
          data: {}, 
          timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days old
        },
        { 
          id: 'recent-draft', 
          type: 'restroom', 
          data: {}, 
          timestamp: Date.now() - 1000 // 1 second old
        },
      ]);

      const result = await cacheSyncService.syncUserData();

      expect(result.success).toBe(true);
      expect(storageService.clearFormDrafts).toHaveBeenCalled();
    });
  });

  describe('clearAllCache', () => {
    it('should clear both Apollo cache and local storage', async () => {
      await cacheSyncService.clearAllCache();

      expect(apolloClient.clearStore).toHaveBeenCalled();
      expect(storageService.clearAllData).toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = cacheSyncService.getCacheStats();

      expect(stats).toHaveProperty('storage');
      expect(stats).toHaveProperty('apollo');
      expect(stats).toHaveProperty('offlineData');
      expect(stats.storage.used).toBe(1024);
      expect(stats.apollo.entities).toBe(2); // 2 restrooms in mock cache
    });
  });

  describe('periodic sync', () => {
    it('should start and stop periodic sync', () => {
      const stopSync = cacheSyncService.startPeriodicSync(100);

      expect(typeof stopSync).toBe('function');
      
      // Stop the sync
      stopSync();
    });
  });
});
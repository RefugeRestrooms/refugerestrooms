/**
 * Cache Synchronization Service
 * Handles data synchronization between Apollo cache, local storage, and server
 */

import { apolloClient, invalidateRestroomQueries } from './apollo';
import { storageService } from './storage';
import type { OfflineRestroom } from './storage';

export interface SyncOptions {
  forceRefresh?: boolean;
  maxAge?: number; // in milliseconds
  includeOfflineData?: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
  timestamp: number;
}

class CacheSyncService {
  private syncInProgress = false;
  private lastSyncTimestamp = 0;

  /**
   * Sync restroom data between cache and storage
   */
  async syncRestrooms(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        syncedItems: 0,
        errors: ['Sync already in progress'],
        timestamp: Date.now(),
      };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let syncedItems = 0;

    try {
      const { forceRefresh = false, maxAge = 5 * 60 * 1000 } = options;
      const now = Date.now();

      // Check if sync is needed
      if (!forceRefresh && (now - this.lastSyncTimestamp) < maxAge) {
        return {
          success: true,
          syncedItems: 0,
          errors: ['Sync not needed - data is fresh'],
          timestamp: now,
        };
      }

      // Get cached restrooms from Apollo
      const cacheData = apolloClient.cache.extract();
      const cachedRestrooms = this.extractRestroomsFromCache(cacheData as Record<string, unknown>);

      // Get offline restrooms from storage
      const offlineRestrooms = storageService.getOfflineRestrooms();

      // Merge and deduplicate
      const mergedRestrooms = this.mergeRestroomData(cachedRestrooms, offlineRestrooms);

      // Update offline storage with merged data
      if (mergedRestrooms.length > 0) {
        storageService.setOfflineRestrooms(mergedRestrooms);
        syncedItems = mergedRestrooms.length;
      }

      // If online, refresh cache from server
      if (navigator.onLine) {
        try {
          await invalidateRestroomQueries();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          errors.push(`Failed to refresh from server: ${errorMessage}`);
        }
      }

      this.lastSyncTimestamp = now;

      return {
        success: errors.length === 0,
        syncedItems,
        errors,
        timestamp: now,
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      errors.push(`Sync failed: ${errorMessage}`);
      return {
        success: false,
        syncedItems,
        errors,
        timestamp: Date.now(),
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync search history and preferences
   */
  async syncUserData(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedItems = 0;

    try {
      // Clean up old search history (older than 30 days)
      const history = storageService.getSearchHistory();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const cleanHistory = history.filter(item => item.timestamp > thirtyDaysAgo);
      
      if (cleanHistory.length !== history.length) {
        storageService.clearSearchHistory();
        cleanHistory.forEach(item => {
          storageService.addSearchHistoryItem({
            query: item.query,
            location: item.location,
          });
        });
        syncedItems += cleanHistory.length;
      }

      // Clean up old form drafts (older than 7 days)
      const drafts = storageService.getFormDrafts();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const validDrafts = drafts.filter(draft => draft.timestamp > sevenDaysAgo);
      
      if (validDrafts.length !== drafts.length) {
        storageService.clearFormDrafts();
        validDrafts.forEach(draft => {
          storageService.saveFormDraft({
            id: draft.id,
            type: draft.type,
            data: draft.data,
          });
        });
      }

      return {
        success: true,
        syncedItems,
        errors,
        timestamp: Date.now(),
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      errors.push(`User data sync failed: ${errorMessage}`);
      return {
        success: false,
        syncedItems,
        errors,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    try {
      // Clear Apollo cache
      await apolloClient.clearStore();
      
      // Clear local storage
      storageService.clearAllData();
      
      this.lastSyncTimestamp = 0;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const storage = storageService.getStorageUsage();
    const apolloCache = apolloClient.cache.extract();
    
    return {
      storage: {
        used: storage.used,
        available: storage.available,
      },
      apollo: {
        entities: apolloCache && typeof apolloCache === 'object' ? Object.keys(apolloCache).length : 0,
      },
      lastSync: this.lastSyncTimestamp,
      syncInProgress: this.syncInProgress,
      offlineData: {
        restrooms: storageService.getOfflineRestrooms().length,
        searchHistory: storageService.getSearchHistory().length,
        formDrafts: storageService.getFormDrafts().length,
      },
    };
  }

  /**
   * Extract restroom data from Apollo cache
   */
  private extractRestroomsFromCache(cacheData: Record<string, unknown>): OfflineRestroom[] {
    const restrooms: OfflineRestroom[] = [];
    
    Object.keys(cacheData).forEach(key => {
      if (key.startsWith('Restroom:')) {
        const restroom = cacheData[key] as Record<string, unknown>;
        if (restroom && restroom.id && typeof restroom.id === 'string') {
          restrooms.push(restroom as OfflineRestroom);
        }
      }
    });

    return restrooms;
  }

  /**
   * Merge restroom data from different sources
   */
  private mergeRestroomData(cachedRestrooms: OfflineRestroom[], offlineRestrooms: OfflineRestroom[]): OfflineRestroom[] {
    const merged = new Map();

    // Add cached restrooms
    cachedRestrooms.forEach(restroom => {
      merged.set(restroom.id, restroom);
    });

    // Add offline restrooms (don't overwrite newer cached data)
    offlineRestrooms.forEach(restroom => {
      if (!merged.has(restroom.id)) {
        merged.set(restroom.id, restroom);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Schedule periodic sync
   */
  startPeriodicSync(intervalMs: number = 5 * 60 * 1000): () => void {
    const interval = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncRestrooms({ maxAge: intervalMs });
        await this.syncUserData();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const cacheSyncService = new CacheSyncService();
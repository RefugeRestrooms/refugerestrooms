/**
 * Local Storage Service for offline data persistence
 * Provides type-safe storage operations with error handling
 */

// Storage keys
const STORAGE_KEYS = {
  SEARCH_HISTORY: 'refuge_search_history',
  USER_LOCATION: 'refuge_user_location',
  OFFLINE_RESTROOMS: 'refuge_offline_restrooms',
  FORM_DRAFTS: 'refuge_form_drafts',
  UI_PREFERENCES: 'refuge_ui_preferences',
} as const;

// Type definitions
export interface SearchHistoryItem {
  query: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export interface FormDraft {
  id: string;
  type: 'restroom' | 'feedback';
  data: Record<string, unknown>;
  timestamp: number;
}

export interface OfflineRestroom {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  [key: string]: unknown;
}

export interface UIPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  searchRadius?: number;
  defaultFilters?: {
    accessible?: boolean;
    unisex?: boolean;
    changingTable?: boolean;
  };
}

// Generic storage operations
class StorageService {
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private get<T>(key: string): T | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to parse stored data for key: ${key}`, error);
      return null;
    }
  }

  private set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to store data for key: ${key}`, error);
      return false;
    }
  }

  private remove(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove data for key: ${key}`, error);
      return false;
    }
  }

  // Search history operations
  getSearchHistory(): SearchHistoryItem[] {
    return this.get<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
  }

  addSearchHistoryItem(item: Omit<SearchHistoryItem, 'timestamp'>): boolean {
    const history = this.getSearchHistory();
    const newItem: SearchHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };

    // Remove duplicates and limit to 50 items
    const filteredHistory = history
      .filter(h => h.query !== item.query)
      .slice(0, 49);

    return this.set(STORAGE_KEYS.SEARCH_HISTORY, [newItem, ...filteredHistory]);
  }

  clearSearchHistory(): boolean {
    return this.remove(STORAGE_KEYS.SEARCH_HISTORY);
  }

  // User location operations
  getUserLocation(): UserLocation | null {
    const location = this.get<UserLocation>(STORAGE_KEYS.USER_LOCATION);
    
    // Check if location is stale (older than 1 hour)
    if (location && Date.now() - location.timestamp > 60 * 60 * 1000) {
      this.remove(STORAGE_KEYS.USER_LOCATION);
      return null;
    }
    
    return location;
  }

  setUserLocation(location: Omit<UserLocation, 'timestamp'>): boolean {
    const locationWithTimestamp: UserLocation = {
      ...location,
      timestamp: Date.now(),
    };
    return this.set(STORAGE_KEYS.USER_LOCATION, locationWithTimestamp);
  }

  clearUserLocation(): boolean {
    return this.remove(STORAGE_KEYS.USER_LOCATION);
  }

  // Offline restrooms cache
  getOfflineRestrooms(): OfflineRestroom[] {
    return this.get<OfflineRestroom[]>(STORAGE_KEYS.OFFLINE_RESTROOMS) || [];
  }

  setOfflineRestrooms(restrooms: OfflineRestroom[]): boolean {
    // Limit to 100 restrooms to prevent storage bloat
    const limitedRestrooms = restrooms.slice(0, 100);
    return this.set(STORAGE_KEYS.OFFLINE_RESTROOMS, limitedRestrooms);
  }

  addOfflineRestroom(restroom: OfflineRestroom): boolean {
    const restrooms = this.getOfflineRestrooms();
    const existingIndex = restrooms.findIndex(r => r.id === restroom.id);
    
    if (existingIndex >= 0) {
      restrooms[existingIndex] = restroom;
    } else {
      restrooms.unshift(restroom);
    }
    
    return this.setOfflineRestrooms(restrooms);
  }

  clearOfflineRestrooms(): boolean {
    return this.remove(STORAGE_KEYS.OFFLINE_RESTROOMS);
  }

  // Form drafts operations
  getFormDrafts(): FormDraft[] {
    return this.get<FormDraft[]>(STORAGE_KEYS.FORM_DRAFTS) || [];
  }

  saveFormDraft(draft: Omit<FormDraft, 'timestamp'>): boolean {
    const drafts = this.getFormDrafts();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    const newDraft: FormDraft = {
      ...draft,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      drafts[existingIndex] = newDraft;
    } else {
      drafts.unshift(newDraft);
    }

    // Limit to 10 drafts
    return this.set(STORAGE_KEYS.FORM_DRAFTS, drafts.slice(0, 10));
  }

  getFormDraft(id: string): FormDraft | null {
    const drafts = this.getFormDrafts();
    return drafts.find(d => d.id === id) || null;
  }

  removeFormDraft(id: string): boolean {
    const drafts = this.getFormDrafts();
    const filteredDrafts = drafts.filter(d => d.id !== id);
    return this.set(STORAGE_KEYS.FORM_DRAFTS, filteredDrafts);
  }

  clearFormDrafts(): boolean {
    return this.remove(STORAGE_KEYS.FORM_DRAFTS);
  }

  // UI preferences operations
  getUIPreferences(): UIPreferences {
    return this.get<UIPreferences>(STORAGE_KEYS.UI_PREFERENCES) || {};
  }

  setUIPreferences(preferences: UIPreferences): boolean {
    const current = this.getUIPreferences();
    const updated = { ...current, ...preferences };
    return this.set(STORAGE_KEYS.UI_PREFERENCES, updated);
  }

  clearUIPreferences(): boolean {
    return this.remove(STORAGE_KEYS.UI_PREFERENCES);
  }

  // Utility methods
  clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        this.remove(key);
      });
      return true;
    } catch {
      return false;
    }
  }

  getStorageUsage(): { used: number; available: boolean } {
    if (!this.isAvailable()) {
      return { used: 0, available: false };
    }

    let used = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch {
      // Ignore errors
    }

    return { used, available: true };
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export storage keys for testing
export { STORAGE_KEYS };
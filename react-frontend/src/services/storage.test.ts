import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService, STORAGE_KEYS } from './storage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('search history', () => {
    it('should add search history item', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      localStorageMock.setItem.mockReturnValue(undefined);

      const result = storageService.addSearchHistoryItem({
        query: 'test search',
        location: { latitude: 40.7128, longitude: -74.0060 },
      });

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SEARCH_HISTORY,
        expect.stringContaining('test search')
      );
    });

    it('should get search history', () => {
      const mockHistory = [
        { query: 'test', timestamp: Date.now() },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const history = storageService.getSearchHistory();

      expect(history).toEqual(mockHistory);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SEARCH_HISTORY);
    });
  });

  describe('user location', () => {
    it('should set and get user location', () => {
      const location = { latitude: 40.7128, longitude: -74.0060 };
      localStorageMock.setItem.mockReturnValue(undefined);

      const result = storageService.setUserLocation(location);
      expect(result).toBe(true);

      const mockStoredLocation = { ...location, timestamp: Date.now() };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStoredLocation));

      const retrievedLocation = storageService.getUserLocation();
      expect(retrievedLocation).toEqual(mockStoredLocation);
    });

    it('should return null for stale location', () => {
      const staleLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(staleLocation));

      const location = storageService.getUserLocation();
      expect(location).toBeNull();
    });
  });

  describe('form drafts', () => {
    it('should save and retrieve form draft', () => {
      localStorageMock.getItem.mockReturnValue('[]');
      localStorageMock.setItem.mockReturnValue(undefined);

      const draft = {
        id: 'test-draft',
        type: 'restroom' as const,
        data: { name: 'Test Restroom' },
      };

      const result = storageService.saveFormDraft(draft);
      expect(result).toBe(true);

      const mockDrafts = [{ ...draft, timestamp: Date.now() }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDrafts));

      const retrievedDraft = storageService.getFormDraft('test-draft');
      expect(retrievedDraft).toEqual(mockDrafts[0]);
    });
  });

  describe('UI preferences', () => {
    it('should set and get UI preferences', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      localStorageMock.setItem.mockReturnValue(undefined);

      const preferences = {
        theme: 'dark' as const,
        searchRadius: 10,
      };

      const result = storageService.setUIPreferences(preferences);
      expect(result).toBe(true);

      localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));
      const retrieved = storageService.getUIPreferences();
      expect(retrieved).toEqual(preferences);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage unavailable', () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = storageService.setUserLocation({
        latitude: 40.7128,
        longitude: -74.0060,
      });

      expect(result).toBe(false);
    });

    it('should handle JSON parse errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const history = storageService.getSearchHistory();
      expect(history).toEqual([]);
    });
  });
});
/**
 * Unit tests for location services
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  isGeolocationSupported,
  checkGeolocationPermission
} from './location';

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

const mockPermissions = {
  query: vi.fn()
};

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: mockGeolocation,
    permissions: mockPermissions
  },
  writable: true
});

describe('Location Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGeolocationSupported', () => {
    it('should return true when geolocation is supported', () => {
      expect(isGeolocationSupported()).toBe(true);
    });

    it('should return false when geolocation is not supported', () => {
      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      // @ts-expect-error - Testing unsupported scenario
      delete global.navigator.geolocation;
      
      expect(isGeolocationSupported()).toBe(false);
      
      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('getCurrentLocation', () => {
    it('should resolve with location data on success', async () => {
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        },
        timestamp: expect.any(Number)
      });
    });

    it('should reject with PERMISSION_DENIED error', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(getCurrentLocation()).rejects.toEqual({
        code: 'PERMISSION_DENIED',
        message: 'Location access denied by user'
      });
    });

    it('should reject with POSITION_UNAVAILABLE error', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(getCurrentLocation()).rejects.toEqual({
        code: 'POSITION_UNAVAILABLE',
        message: 'Location information is unavailable'
      });
    });

    it('should reject with TIMEOUT error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(getCurrentLocation()).rejects.toEqual({
        code: 'TIMEOUT',
        message: 'Location request timed out'
      });
    });

    it('should reject with NOT_SUPPORTED when geolocation is unavailable', async () => {
      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      // @ts-expect-error - Testing unsupported scenario
      delete global.navigator.geolocation;

      await expect(getCurrentLocation()).rejects.toEqual({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      });

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('watchLocation', () => {
    it('should start watching location and call success callback', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const mockWatchId = 123;

      mockGeolocation.watchPosition.mockReturnValue(mockWatchId);

      const watchId = watchLocation(onSuccess, onError);

      expect(watchId).toBe(mockWatchId);
      expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        })
      );

      // Simulate successful position update
      const mockPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        }
      };

      const successCallback = mockGeolocation.watchPosition.mock.calls[0][0];
      successCallback(mockPosition);

      expect(onSuccess).toHaveBeenCalledWith({
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        },
        timestamp: expect.any(Number)
      });
    });

    it('should call error callback on geolocation error', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      mockGeolocation.watchPosition.mockReturnValue(123);

      watchLocation(onSuccess, onError);

      // Simulate error
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      const errorCallback = mockGeolocation.watchPosition.mock.calls[0][1];
      errorCallback(mockError);

      expect(onError).toHaveBeenCalledWith({
        code: 'PERMISSION_DENIED',
        message: 'Location access denied by user'
      });
    });

    it('should return null when geolocation is not supported', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      // @ts-expect-error - Testing unsupported scenario
      delete global.navigator.geolocation;

      const watchId = watchLocation(onSuccess, onError);

      expect(watchId).toBeNull();
      expect(onError).toHaveBeenCalledWith({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      });

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('clearLocationWatch', () => {
    it('should call clearWatch with the provided watch ID', () => {
      const watchId = 123;
      clearLocationWatch(watchId);

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(watchId);
    });

    it('should handle missing geolocation gracefully', () => {
      // Temporarily remove geolocation
      const originalGeolocation = global.navigator.geolocation;
      // @ts-expect-error - Testing unsupported scenario
      delete global.navigator.geolocation;

      expect(() => clearLocationWatch(123)).not.toThrow();

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('checkGeolocationPermission', () => {
    it('should return permission state when permissions API is available', async () => {
      const mockPermission = { state: 'granted' as PermissionState };
      mockPermissions.query.mockResolvedValue(mockPermission);

      const result = await checkGeolocationPermission();

      expect(result).toBe('granted');
      expect(mockPermissions.query).toHaveBeenCalledWith({ name: 'geolocation' });
    });

    it('should return prompt when permissions API is not available', async () => {
      // Temporarily remove permissions
      const originalPermissions = global.navigator.permissions;
      // @ts-expect-error - Testing unsupported scenario
      delete global.navigator.permissions;

      const result = await checkGeolocationPermission();

      expect(result).toBe('prompt');

      // Restore permissions
      global.navigator.permissions = originalPermissions;
    });

    it('should return prompt when permission query fails', async () => {
      mockPermissions.query.mockRejectedValue(new Error('Permission query failed'));

      const result = await checkGeolocationPermission();

      expect(result).toBe('prompt');
    });
  });
});
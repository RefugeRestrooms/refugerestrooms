/**
 * Integration tests for location services
 * Tests the interaction between location and geocoding services
 */

import { describe, it, expect, vi } from 'vitest';
import { getCurrentLocation } from './location';
import { reverseGeocode, parseCoordinates, isValidCoordinates } from './geocoding';
import { calculateDistance } from '../utils';

describe('Location Services Integration', () => {
  it('should integrate location and geocoding services', async () => {
    // Mock successful geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10
          }
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn()
    };

    Object.defineProperty(globalThis, 'navigator', {
      value: { geolocation: mockGeolocation },
      writable: true
    });

    // Get current location
    const location = await getCurrentLocation();
    expect(location.coordinates).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10
    });

    // Validate coordinates
    expect(isValidCoordinates(location.coordinates)).toBe(true);

    // Reverse geocode the location
    const geocodingResult = await reverseGeocode(location.coordinates);
    expect(geocodingResult.coordinates).toEqual(location.coordinates);
    expect(geocodingResult.formattedAddress).toBeDefined();

    // Test coordinate parsing
    const parsedCoords = parseCoordinates('37.7749, -122.4194');
    expect(parsedCoords).toEqual({
      latitude: 37.7749,
      longitude: -122.4194
    });

    // Test distance calculation
    const distance = calculateDistance(
      location.coordinates.latitude,
      location.coordinates.longitude,
      37.7849, // Slightly different coordinates
      -122.4094
    );
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(2); // Should be less than 2km
  });

  it('should handle coordinate validation in the workflow', () => {
    // Test valid coordinates
    expect(isValidCoordinates({ latitude: 37.7749, longitude: -122.4194 })).toBe(true);
    expect(isValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
    expect(isValidCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
    expect(isValidCoordinates({ latitude: -90, longitude: -180 })).toBe(true);

    // Test invalid coordinates
    expect(isValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
    expect(isValidCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
    expect(isValidCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
  });

  it('should parse various coordinate formats', () => {
    // Test different coordinate formats
    expect(parseCoordinates('37.7749, -122.4194')).toEqual({
      latitude: 37.7749,
      longitude: -122.4194
    });

    expect(parseCoordinates('37.7749 -122.4194')).toEqual({
      latitude: 37.7749,
      longitude: -122.4194
    });

    expect(parseCoordinates('  37.7749  ,  -122.4194  ')).toEqual({
      latitude: 37.7749,
      longitude: -122.4194
    });

    // Test invalid formats
    expect(parseCoordinates('invalid')).toBeNull();
    expect(parseCoordinates('37.7749')).toBeNull();
    expect(parseCoordinates('')).toBeNull();
  });

  it('should calculate distances correctly', () => {
    // Test distance between San Francisco and New York (approximately 4135 km)
    const sfToNy = calculateDistance(37.7749, -122.4194, 40.7128, -74.0060);
    expect(sfToNy).toBeGreaterThan(4000);
    expect(sfToNy).toBeLessThan(5000);

    // Test distance between same coordinates (should be 0)
    const sameLocation = calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);
    expect(sameLocation).toBe(0);

    // Test distance between nearby coordinates (should be small)
    const nearby = calculateDistance(37.7749, -122.4194, 37.7750, -122.4195);
    expect(nearby).toBeGreaterThan(0);
    expect(nearby).toBeLessThan(0.1); // Less than 100 meters
  });
});
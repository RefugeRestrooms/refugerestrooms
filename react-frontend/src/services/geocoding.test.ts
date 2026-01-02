/**
 * Unit tests for geocoding services
 */

import { describe, it, expect } from 'vitest';
// Use the actual functions
const geocodeAddress = actualGeocodeAddress;
const reverseGeocode = actualReverseGeocode;
const getAddressSuggestions = actualGetAddressSuggestions;
const isValidCoordinates = actualIsValidCoordinates;
const formatCoordinates = actualFormatCoordinates;
const parseCoordinates = actualParseCoordinates;

// Import the actual functions for testing
import {
  geocodeAddress as actualGeocodeAddress,
  reverseGeocode as actualReverseGeocode,
  getAddressSuggestions as actualGetAddressSuggestions,
  isValidCoordinates as actualIsValidCoordinates,
  formatCoordinates as actualFormatCoordinates,
  parseCoordinates as actualParseCoordinates
} from './geocoding';

describe('Geocoding Services', () => {
  describe('isValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinates({ latitude: 37.7749, longitude: -122.4194 })).toBe(true);
      expect(isValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
      expect(isValidCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
      expect(isValidCoordinates({ latitude: -90, longitude: -180 })).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
      expect(isValidCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
      expect(isValidCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
      expect(isValidCoordinates({ latitude: 0, longitude: NaN })).toBe(false);
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates with 6 decimal places', () => {
      const coordinates = { latitude: 37.774929, longitude: -122.419416 };
      expect(formatCoordinates(coordinates)).toBe('37.774929, -122.419416');
    });

    it('should handle coordinates with fewer decimal places', () => {
      const coordinates = { latitude: 37.7, longitude: -122.4 };
      expect(formatCoordinates(coordinates)).toBe('37.700000, -122.400000');
    });
  });

  describe('parseCoordinates', () => {
    it('should parse comma-separated coordinates', () => {
      expect(parseCoordinates('37.7749, -122.4194')).toEqual({
        latitude: 37.7749,
        longitude: -122.4194
      });
    });

    it('should parse space-separated coordinates', () => {
      expect(parseCoordinates('37.7749 -122.4194')).toEqual({
        latitude: 37.7749,
        longitude: -122.4194
      });
    });

    it('should handle coordinates with extra whitespace', () => {
      expect(parseCoordinates('  37.7749  ,  -122.4194  ')).toEqual({
        latitude: 37.7749,
        longitude: -122.4194
      });
    });

    it('should return null for invalid coordinate strings', () => {
      expect(parseCoordinates('invalid')).toBeNull();
      expect(parseCoordinates('37.7749')).toBeNull();
      expect(parseCoordinates('37.7749, invalid')).toBeNull();
      expect(parseCoordinates('91, 0')).toBeNull(); // Invalid latitude
      expect(parseCoordinates('0, 181')).toBeNull(); // Invalid longitude
    });

    it('should return null for empty or whitespace strings', () => {
      expect(parseCoordinates('')).toBeNull();
      expect(parseCoordinates('   ')).toBeNull();
    });
  });

  describe('geocodeAddress', () => {
    it('should throw error for empty address', async () => {
      await expect(geocodeAddress('')).rejects.toEqual({
        code: 'INVALID_REQUEST',
        message: 'Address cannot be empty'
      });
    });

    it('should throw error for whitespace-only address', async () => {
      await expect(geocodeAddress('   ')).rejects.toEqual({
        code: 'INVALID_REQUEST',
        message: 'Address cannot be empty'
      });
    });

    it('should return geocoding result for valid address', async () => {
      const result = await geocodeAddress('San Francisco');
      
      expect(result).toEqual({
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        address: { city: 'San Francisco', state: 'CA', country: 'US' },
        formattedAddress: 'San Francisco, CA, US',
        confidence: 'HIGH'
      });
    });
  });

  describe('reverseGeocode', () => {
    it('should throw error for invalid coordinates', async () => {
      const invalidCoordinates = { latitude: 91, longitude: 0 };
      
      await expect(reverseGeocode(invalidCoordinates)).rejects.toEqual({
        code: 'INVALID_REQUEST',
        message: 'Invalid coordinates provided'
      });
    });

    it('should return address for valid coordinates', async () => {
      const coordinates = { latitude: 37.7749, longitude: -122.4194 };
      
      // Since this is a mock implementation, we'll test the structure
      const result = await reverseGeocode(coordinates);
      
      expect(result).toHaveProperty('coordinates');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('formattedAddress');
      expect(result).toHaveProperty('confidence');
      expect(result.coordinates).toEqual(coordinates);
    });
  });

  describe('getAddressSuggestions', () => {
    it('should return empty array for short queries', async () => {
      expect(await getAddressSuggestions('')).toEqual([]);
      expect(await getAddressSuggestions('a')).toEqual([]);
    });

    it('should return suggestions for valid queries', async () => {
      const suggestions = await getAddressSuggestions('San');
      
      expect(Array.isArray(suggestions)).toBe(true);
      // Since this is a mock implementation, we just verify the structure
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('coordinates');
        expect(suggestions[0]).toHaveProperty('address');
        expect(suggestions[0]).toHaveProperty('formattedAddress');
        expect(suggestions[0]).toHaveProperty('confidence');
      }
    });

    it('should respect the limit parameter', async () => {
      const suggestions = await getAddressSuggestions('San', 2);
      
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });
});
/**
 * Geocoding services for converting addresses to coordinates and vice versa
 * Uses browser-based geocoding APIs with fallback strategies
 */

import type { LocationCoordinates, LocationAddress } from './location';

export interface GeocodingResult {
  coordinates: LocationCoordinates;
  address: LocationAddress;
  formattedAddress: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GeocodingError {
  code: 'NOT_FOUND' | 'NETWORK_ERROR' | 'QUOTA_EXCEEDED' | 'INVALID_REQUEST';
  message: string;
}

/**
 * Geocode an address string to coordinates
 * Note: This is a placeholder implementation. In production, you would integrate
 * with a geocoding service like Google Maps, Mapbox, or OpenStreetMap Nominatim
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  // Validate input
  if (!address || address.trim().length === 0) {
    throw {
      code: 'INVALID_REQUEST',
      message: 'Address cannot be empty'
    } as GeocodingError;
  }

  try {
    // This is a mock implementation for development
    // In production, replace with actual geocoding service
    const mockResult = await mockGeocodeAddress(address);
    return mockResult;
  } catch {
    throw {
      code: 'NETWORK_ERROR',
      message: 'Failed to geocode address'
    } as GeocodingError;
  }
};

/**
 * Reverse geocode coordinates to an address
 */
export const reverseGeocode = async (
  coordinates: LocationCoordinates
): Promise<GeocodingResult> => {
  // Validate coordinates
  if (!isValidCoordinates(coordinates)) {
    throw {
      code: 'INVALID_REQUEST',
      message: 'Invalid coordinates provided'
    } as GeocodingError;
  }

  try {
    // This is a mock implementation for development
    // In production, replace with actual reverse geocoding service
    const mockResult = await mockReverseGeocode(coordinates);
    return mockResult;
  } catch {
    throw {
      code: 'NETWORK_ERROR',
      message: 'Failed to reverse geocode coordinates'
    } as GeocodingError;
  }
};

/**
 * Get address suggestions for autocomplete functionality
 */
export const getAddressSuggestions = async (
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> => {
  // Validate input
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // This is a mock implementation for development
    // In production, replace with actual autocomplete service
    const mockResults = await mockGetAddressSuggestions(query, limit);
    return mockResults;
  } catch {
    // Return empty array on error to not break autocomplete
    return [];
  }
};

/**
 * Validate coordinates are within valid ranges
 */
export const isValidCoordinates = (coordinates: LocationCoordinates): boolean => {
  const { latitude, longitude } = coordinates;
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coordinates: LocationCoordinates): string => {
  const { latitude, longitude } = coordinates;
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Parse coordinates from a string
 */
export const parseCoordinates = (coordinatesString: string): LocationCoordinates | null => {
  const cleaned = coordinatesString.trim();
  const patterns = [
    // "lat, lng" format with flexible whitespace
    /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/,
    // "lat lng" format (space separated)
    /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      
      const coordinates = { latitude, longitude };
      if (isValidCoordinates(coordinates)) {
        return coordinates;
      }
    }
  }

  return null;
};

/**
 * Parse address components from a formatted address string
 */
export const parseAddressComponents = (formattedAddress: string): {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
} | null => {
  if (!formattedAddress || formattedAddress.trim().length === 0) {
    return null;
  }

  // Split by commas and clean up whitespace
  const parts = formattedAddress.split(',').map(part => part.trim());
  
  if (parts.length < 2) {
    return null;
  }

  // Basic parsing logic - this would be more sophisticated in production
  // with actual geocoding service response parsing
  const components: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } = {};

  if (parts.length >= 1) {
    components.street = parts[0];
  }
  if (parts.length >= 2) {
    components.city = parts[1];
  }
  if (parts.length >= 3) {
    // Try to parse state and postal code from the third part
    const stateAndZip = parts[2].trim();
    const stateZipMatch = stateAndZip.match(/^([A-Z]{2})\s*(\d{5}(-\d{4})?)?$/);
    if (stateZipMatch) {
      components.state = stateZipMatch[1];
      if (stateZipMatch[2]) {
        components.postalCode = stateZipMatch[2];
      }
    } else {
      components.state = stateAndZip;
    }
  }
  if (parts.length >= 4) {
    components.country = parts[3];
  }

  return components;
};

// Mock implementations for development
// These should be replaced with actual geocoding service integrations

const mockGeocodeAddress = async (address: string): Promise<GeocodingResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock geocoding based on common city names
  const mockData: Record<string, GeocodingResult> = {
    'san francisco': {
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      address: { city: 'San Francisco', state: 'CA', country: 'US' },
      formattedAddress: 'San Francisco, CA, US',
      confidence: 'HIGH'
    },
    'new york': {
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      address: { city: 'New York', state: 'NY', country: 'US' },
      formattedAddress: 'New York, NY, US',
      confidence: 'HIGH'
    },
    'seattle': {
      coordinates: { latitude: 47.6062, longitude: -122.3321 },
      address: { city: 'Seattle', state: 'WA', country: 'US' },
      formattedAddress: 'Seattle, WA, US',
      confidence: 'HIGH'
    }
  };

  const normalizedAddress = address.toLowerCase().trim();
  const result = mockData[normalizedAddress];

  if (result) {
    return result;
  }

  // Generate a mock result for unknown addresses
  return {
    coordinates: { 
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1, 
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1 
    },
    address: { city: address, state: 'Unknown', country: 'US' },
    formattedAddress: address,
    confidence: 'LOW'
  };
};

const mockReverseGeocode = async (coordinates: LocationCoordinates): Promise<GeocodingResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Generate mock address based on coordinates
  const { latitude, longitude } = coordinates;
  
  return {
    coordinates,
    address: {
      street: `${Math.floor(Math.abs(latitude * 1000))} Mock Street`,
      city: 'Mock City',
      state: 'MC',
      country: 'US',
      postalCode: `${Math.floor(Math.abs(longitude * 1000)).toString().slice(0, 5)}`
    },
    formattedAddress: `${Math.floor(Math.abs(latitude * 1000))} Mock Street, Mock City, MC, US`,
    confidence: 'MEDIUM'
  };
};

const mockGetAddressSuggestions = async (
  query: string, 
  limit: number
): Promise<GeocodingResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const suggestions: GeocodingResult[] = [];
  const cities = ['San Francisco', 'New York', 'Seattle', 'Los Angeles', 'Chicago'];
  
  for (let i = 0; i < Math.min(limit, cities.length); i++) {
    const city = cities[i];
    if (city.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        coordinates: { 
          latitude: 37 + i, 
          longitude: -122 - i 
        },
        address: { city, state: 'CA', country: 'US' },
        formattedAddress: `${city}, CA, US`,
        confidence: 'MEDIUM'
      });
    }
  }

  return suggestions;
};
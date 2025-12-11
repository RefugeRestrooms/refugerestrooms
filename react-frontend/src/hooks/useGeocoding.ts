/**
 * React hook for geocoding services
 * Provides address geocoding and autocomplete functionality
 */

import { useState, useCallback, useRef } from 'react';
import { 
  geocodeAddress, 
  reverseGeocode, 
  getAddressSuggestions,
  parseCoordinates,
  GeocodingResult,
  GeocodingError 
} from '../services/geocoding';
import { LocationCoordinates } from '../services/location';
import { debounce } from '../utils';

export interface UseGeocodingState {
  results: GeocodingResult[];
  suggestions: GeocodingResult[];
  loading: boolean;
  error: GeocodingError | null;
}

export interface UseGeocodingActions {
  geocode: (address: string) => Promise<GeocodingResult | null>;
  reverseGeocode: (coordinates: LocationCoordinates) => Promise<GeocodingResult | null>;
  getSuggestions: (query: string) => Promise<void>;
  parseCoordinatesInput: (input: string) => LocationCoordinates | null;
  clearResults: () => void;
  clearSuggestions: () => void;
  clearError: () => void;
}

export interface UseGeocodingReturn extends UseGeocodingState, UseGeocodingActions {}

/**
 * Hook for geocoding and address autocomplete functionality
 */
export const useGeocoding = (): UseGeocodingReturn => {
  const [state, setState] = useState<UseGeocodingState>({
    results: [],
    suggestions: [],
    loading: false,
    error: null
  });

  // Debounced function for suggestions to avoid too many API calls
  const debouncedGetSuggestions = useRef(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setState(prev => ({ ...prev, suggestions: [] }));
        return;
      }

      try {
        const suggestions = await getAddressSuggestions(query, 5);
        setState(prev => ({ 
          ...prev, 
          suggestions, 
          loading: false,
          error: null 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          suggestions: [],
          loading: false,
          error: error as GeocodingError 
        }));
      }
    }, 300)
  ).current;

  const geocode = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    if (!address.trim()) {
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await geocodeAddress(address);
      setState(prev => ({
        ...prev,
        results: [result],
        loading: false,
        error: null
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as GeocodingError
      }));
      return null;
    }
  }, []);

  const reverseGeocodeAction = useCallback(async (
    coordinates: LocationCoordinates
  ): Promise<GeocodingResult | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await reverseGeocode(coordinates);
      setState(prev => ({
        ...prev,
        results: [result],
        loading: false,
        error: null
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as GeocodingError
      }));
      return null;
    }
  }, []);

  const getSuggestions = useCallback(async (query: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    await debouncedGetSuggestions(query);
  }, [debouncedGetSuggestions]);

  const parseCoordinatesInput = useCallback((input: string): LocationCoordinates | null => {
    return parseCoordinates(input);
  }, []);

  const clearResults = useCallback((): void => {
    setState(prev => ({ ...prev, results: [] }));
  }, []);

  const clearSuggestions = useCallback((): void => {
    setState(prev => ({ ...prev, suggestions: [] }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    geocode,
    reverseGeocode: reverseGeocodeAction,
    getSuggestions,
    parseCoordinatesInput,
    clearResults,
    clearSuggestions,
    clearError
  };
};
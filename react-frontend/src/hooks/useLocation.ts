/**
 * React hook for location services
 * Provides geolocation functionality with error handling and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getCurrentLocation, 
  watchLocation, 
  clearLocationWatch,
  isGeolocationSupported,
  checkGeolocationPermission,
  LocationResult,
  GeolocationError 
} from '../services/location';

export interface UseLocationState {
  location: LocationResult | null;
  loading: boolean;
  error: GeolocationError | null;
  supported: boolean;
  permission: PermissionState | null;
}

export interface UseLocationActions {
  requestLocation: () => Promise<void>;
  startWatching: () => void;
  stopWatching: () => void;
  clearError: () => void;
  checkPermission: () => Promise<void>;
}

export interface UseLocationReturn extends UseLocationState, UseLocationActions {}

/**
 * Hook for managing user location with geolocation API
 */
export const useLocation = (): UseLocationReturn => {
  const [state, setState] = useState<UseLocationState>({
    location: null,
    loading: false,
    error: null,
    supported: isGeolocationSupported(),
    permission: null
  });

  const watchIdRef = useRef<number | null>(null);

  // Check permission status on mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        const permission = await checkGeolocationPermission();
        setState(prev => ({ ...prev, permission }));
      } catch (error) {
        // Permission check failed, but this is not critical
        console.warn('Failed to check geolocation permission:', error);
      }
    };

    if (state.supported) {
      checkInitialPermission();
    }
  }, [state.supported]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        clearLocationWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by this browser'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const location = await getCurrentLocation();
      setState(prev => ({
        ...prev,
        location,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as GeolocationError
      }));
    }
  }, [state.supported]);

  const startWatching = useCallback((): void => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by this browser'
        }
      }));
      return;
    }

    // Stop existing watch if any
    if (watchIdRef.current !== null) {
      clearLocationWatch(watchIdRef.current);
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const watchId = watchLocation(
      (location) => {
        setState(prev => ({
          ...prev,
          location,
          loading: false,
          error: null
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      }
    );

    watchIdRef.current = watchId;
  }, [state.supported]);

  const stopWatching = useCallback((): void => {
    if (watchIdRef.current !== null) {
      clearLocationWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const checkPermission = useCallback(async (): Promise<void> => {
    try {
      const permission = await checkGeolocationPermission();
      setState(prev => ({ ...prev, permission }));
    } catch (error) {
      console.warn('Failed to check geolocation permission:', error);
    }
  }, []);

  return {
    ...state,
    requestLocation,
    startWatching,
    stopWatching,
    clearError,
    checkPermission
  };
};
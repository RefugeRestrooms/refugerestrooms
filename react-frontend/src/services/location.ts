/**
 * Location services for geolocation and geocoding functionality
 * Handles browser geolocation API with error handling and fallback scenarios
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationAddress {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  address?: LocationAddress;
  timestamp: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}

/**
 * Get current user location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      } as GeolocationError);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result: LocationResult = {
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: Date.now()
        };
        resolve(result);
      },
      (error) => {
        let errorCode: GeolocationError['code'];
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED';
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorCode = 'TIMEOUT';
            errorMessage = 'Location request timed out';
            break;
          default:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'An unknown error occurred while retrieving location';
        }

        reject({
          code: errorCode,
          message: errorMessage
        } as GeolocationError);
      },
      options
    );
  });
};

/**
 * Watch user location for continuous updates
 */
export const watchLocation = (
  onSuccess: (location: LocationResult) => void,
  onError: (error: GeolocationError) => void
): number | null => {
  if (!navigator.geolocation) {
    onError({
      code: 'NOT_SUPPORTED',
      message: 'Geolocation is not supported by this browser'
    });
    return null;
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000 // 1 minute
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      const result: LocationResult = {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        },
        timestamp: Date.now()
      };
      onSuccess(result);
    },
    (error) => {
      let errorCode: GeolocationError['code'];
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorCode = 'PERMISSION_DENIED';
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorCode = 'POSITION_UNAVAILABLE';
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorCode = 'TIMEOUT';
          errorMessage = 'Location request timed out';
          break;
        default:
          errorCode = 'POSITION_UNAVAILABLE';
          errorMessage = 'An unknown error occurred while retrieving location';
      }

      onError({
        code: errorCode,
        message: errorMessage
      });
    },
    options
  );
};

/**
 * Stop watching location updates
 */
export const clearLocationWatch = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Check if geolocation is supported and available
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Check geolocation permission status
 */
export const checkGeolocationPermission = async (): Promise<PermissionState> => {
  if (!navigator.permissions) {
    // Fallback for browsers that don't support permissions API
    return 'prompt';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    // Fallback if permission query fails
    return 'prompt';
  }
};
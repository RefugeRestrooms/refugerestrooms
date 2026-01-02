/**
 * Demo component showcasing location services functionality
 */

import React, { useState } from 'react';
import { LocationInput } from '../search/LocationInput';
import { Button } from '../ui/Button';
import { useLocation } from '../../hooks/useLocation';
import type { LocationCoordinates } from '../../services/location';
import { formatCoordinates } from '../../services/geocoding';
import { formatDistance, calculateDistance } from '../../utils';
import styles from './LocationDemo.module.css';

export const LocationDemo: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const location = useLocation();

  const handleLocationSelect = (coordinates: LocationCoordinates, address?: string) => {
    setSelectedLocation(coordinates);
    setSelectedAddress(address || '');
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setSelectedAddress('');
    setError('');
  };

  const distance = selectedLocation && location.location
    ? calculateDistance(
        location.location.coordinates.latitude,
        location.location.coordinates.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      )
    : null;

  return (
    <div className={styles.locationDemo}>
      <h2>Location Services Demo</h2>
      
      <div className={styles.section}>
        <h3>Location Input with Autocomplete</h3>
        <LocationInput
          placeholder="Enter an address or coordinates"
          onLocationSelect={handleLocationSelect}
          onError={handleError}
        />
        
        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>Current Location</h3>
        <div className={styles.locationInfo}>
          <Button
            onClick={location.requestLocation}
            disabled={!location.supported || location.loading}
            variant="primary"
          >
            {location.loading ? 'Getting Location...' : 'Get Current Location'}
          </Button>
          
          {location.error && (
            <div className={styles.error}>
              <strong>Location Error:</strong> {location.error.message}
            </div>
          )}
          
          {location.location && (
            <div className={styles.locationDetails}>
              <p><strong>Coordinates:</strong> {formatCoordinates(location.location.coordinates)}</p>
              <p><strong>Accuracy:</strong> {location.location.coordinates.accuracy ? `${Math.round(location.location.coordinates.accuracy)}m` : 'Unknown'}</p>
              <p><strong>Timestamp:</strong> {new Date(location.location.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Selected Location</h3>
        {selectedLocation ? (
          <div className={styles.locationDetails}>
            <p><strong>Coordinates:</strong> {formatCoordinates(selectedLocation)}</p>
            {selectedAddress && <p><strong>Address:</strong> {selectedAddress}</p>}
            {distance !== null && (
              <p><strong>Distance from current location:</strong> {formatDistance(distance)}</p>
            )}
            <Button onClick={clearSelection} variant="secondary" size="small">
              Clear Selection
            </Button>
          </div>
        ) : (
          <p className={styles.placeholder}>No location selected</p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Geolocation Support</h3>
        <div className={styles.supportInfo}>
          <p><strong>Geolocation Supported:</strong> {location.supported ? 'Yes' : 'No'}</p>
          <p><strong>Permission Status:</strong> {location.permission || 'Unknown'}</p>
          <Button onClick={location.checkPermission} variant="secondary" size="small">
            Check Permission
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Usage Examples</h3>
        <div className={styles.examples}>
          <p><strong>Try these inputs:</strong></p>
          <ul>
            <li>Address: "San Francisco, CA"</li>
            <li>Coordinates: "37.7749, -122.4194"</li>
            <li>Coordinates: "37.7749 -122.4194"</li>
            <li>City: "Seattle"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
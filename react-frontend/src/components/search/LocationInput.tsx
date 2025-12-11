/**
 * LocationInput component with geolocation and autocomplete functionality
 * Supports both GPS location and manual address entry
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Icon } from '../ui/Icon';
import { useLocation } from '../../hooks/useLocation';
import { useGeocoding } from '../../hooks/useGeocoding';
import { LocationCoordinates } from '../../services/location';
import { GeocodingResult } from '../../services/geocoding';
import styles from './LocationInput.module.css';

export interface LocationInputProps {
  value?: string;
  placeholder?: string;
  onLocationSelect?: (location: LocationCoordinates, address?: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value = '',
  placeholder = 'Enter address or use current location',
  onLocationSelect,
  onError,
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const geocoding = useGeocoding();

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle location service errors
  useEffect(() => {
    if (location.error && onError) {
      onError(location.error.message);
    }
  }, [location.error, onError]);

  // Handle geocoding errors
  useEffect(() => {
    if (geocoding.error && onError) {
      onError(geocoding.error.message);
    }
  }, [geocoding.error, onError]);

  // Handle successful geolocation
  useEffect(() => {
    if (location.location && onLocationSelect) {
      onLocationSelect(location.location.coordinates);
      // Optionally reverse geocode to get address
      if (location.location.coordinates) {
        geocoding.reverseGeocode(location.location.coordinates);
      }
    }
  }, [location.location, onLocationSelect, geocoding]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Get suggestions for autocomplete
    if (newValue.trim().length >= 2) {
      geocoding.getSuggestions(newValue);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      geocoding.clearSuggestions();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || geocoding.suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleManualGeocode();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < geocoding.suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(geocoding.suggestions[selectedIndex]);
        } else {
          handleManualGeocode();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: GeocodingResult) => {
    setInputValue(suggestion.formattedAddress);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    if (onLocationSelect) {
      onLocationSelect(suggestion.coordinates, suggestion.formattedAddress);
    }
  };

  const handleManualGeocode = async () => {
    if (!inputValue.trim()) return;

    // First try to parse as coordinates
    const coordinates = geocoding.parseCoordinatesInput(inputValue);
    if (coordinates) {
      if (onLocationSelect) {
        onLocationSelect(coordinates, inputValue);
      }
      return;
    }

    // Otherwise geocode as address
    const result = await geocoding.geocode(inputValue);
    if (result && onLocationSelect) {
      onLocationSelect(result.coordinates, result.formattedAddress);
      setInputValue(result.formattedAddress);
    }
  };

  const handleCurrentLocationClick = () => {
    location.requestLocation();
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (geocoding.suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`${styles.locationInput} ${className}`}>
      <div className={styles.inputContainer}>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled || location.loading || geocoding.loading}
          className={styles.input}
          aria-label="Location input"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        
        <Button
          onClick={handleCurrentLocationClick}
          disabled={disabled || !location.supported || location.loading}
          variant="secondary"
          size="small"
          className={styles.locationButton}
          aria-label="Use current location"
          title="Use current location"
        >
          {location.loading ? (
            <Icon name="loading" className={styles.loadingIcon} />
          ) : (
            <Icon name="location" />
          )}
        </Button>
      </div>

      {showSuggestions && geocoding.suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={styles.suggestions}
          role="listbox"
          aria-label="Address suggestions"
        >
          {geocoding.suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.coordinates.latitude}-${suggestion.coordinates.longitude}`}
              className={`${styles.suggestion} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className={styles.suggestionText}>
                {suggestion.formattedAddress}
              </div>
              <div className={styles.suggestionMeta}>
                <Icon name="location" className={styles.suggestionIcon} />
                <span className={styles.confidence}>
                  {suggestion.confidence.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {geocoding.loading && (
        <div className={styles.loadingIndicator}>
          <Icon name="loading" className={styles.loadingIcon} />
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
};
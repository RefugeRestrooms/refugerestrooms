/**
 * Unit tests for LocationInput component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationInput } from './LocationInput';

// Mock the hooks
vi.mock('../../hooks/useLocation', () => ({
  useLocation: vi.fn(() => ({
    location: null,
    loading: false,
    error: null,
    supported: true,
    permission: 'prompt',
    requestLocation: vi.fn(),
    startWatching: vi.fn(),
    stopWatching: vi.fn(),
    clearError: vi.fn(),
    checkPermission: vi.fn()
  }))
}));

vi.mock('../../hooks/useGeocoding', () => ({
  useGeocoding: vi.fn(() => ({
    results: [],
    suggestions: [],
    loading: false,
    error: null,
    geocode: vi.fn(),
    reverseGeocode: vi.fn(),
    getSuggestions: vi.fn(),
    parseCoordinatesInput: vi.fn(),
    clearResults: vi.fn(),
    clearSuggestions: vi.fn(),
    clearError: vi.fn()
  }))
}));

import { useLocation } from '../../hooks/useLocation';
import { useGeocoding } from '../../hooks/useGeocoding';

const mockUseLocation = useLocation as ReturnType<typeof vi.fn>;
const mockUseGeocoding = useGeocoding as ReturnType<typeof vi.fn>;

describe('LocationInput', () => {
  const mockOnLocationSelect = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockUseLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      supported: true,
      permission: 'prompt',
      requestLocation: vi.fn(),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      clearError: vi.fn(),
      checkPermission: vi.fn()
    });

    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: [],
      loading: false,
      error: null,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: vi.fn(),
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });
  });

  it('should render with default props', () => {
    render(<LocationInput />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText('Use current location')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    const placeholder = 'Custom placeholder';
    render(<LocationInput placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('should call onLocationSelect when current location button is clicked', async () => {
    const mockRequestLocation = vi.fn();
    mockUseLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      supported: true,
      permission: 'granted',
      requestLocation: mockRequestLocation,
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      clearError: vi.fn(),
      checkPermission: vi.fn()
    });

    render(<LocationInput onLocationSelect={mockOnLocationSelect} />);
    
    const locationButton = screen.getByLabelText('Use current location');
    await userEvent.click(locationButton);
    
    expect(mockRequestLocation).toHaveBeenCalled();
  });

  it('should show loading state when location is being fetched', () => {
    mockUseLocation.mockReturnValue({
      location: null,
      loading: true,
      error: null,
      supported: true,
      permission: 'granted',
      requestLocation: vi.fn(),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      clearError: vi.fn(),
      checkPermission: vi.fn()
    });

    render(<LocationInput />);
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('should disable location button when geolocation is not supported', () => {
    mockUseLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      supported: false,
      permission: 'denied',
      requestLocation: vi.fn(),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      clearError: vi.fn(),
      checkPermission: vi.fn()
    });

    render(<LocationInput />);
    
    expect(screen.getByLabelText('Use current location')).toBeDisabled();
  });

  it('should call getSuggestions when typing in input', async () => {
    const mockGetSuggestions = vi.fn();
    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: [],
      loading: false,
      error: null,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: mockGetSuggestions,
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });

    render(<LocationInput />);
    
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'San Francisco');
    
    expect(mockGetSuggestions).toHaveBeenCalledWith('San Francisco');
  });

  it('should show suggestions when available', () => {
    const mockSuggestions = [
      {
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        address: { city: 'San Francisco', state: 'CA', country: 'US' },
        formattedAddress: 'San Francisco, CA, US',
        confidence: 'HIGH' as const
      }
    ];

    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: vi.fn(),
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });

    render(<LocationInput />);
    
    // Trigger showing suggestions by focusing and typing
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'San' } });
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA, US')).toBeInTheDocument();
  });

  it('should call onLocationSelect when suggestion is clicked', async () => {
    const mockSuggestions = [
      {
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        address: { city: 'San Francisco', state: 'CA', country: 'US' },
        formattedAddress: 'San Francisco, CA, US',
        confidence: 'HIGH' as const
      }
    ];

    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: vi.fn(),
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });

    render(<LocationInput onLocationSelect={mockOnLocationSelect} />);
    
    // Trigger showing suggestions
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'San' } });
    
    // Click on suggestion
    const suggestion = screen.getByText('San Francisco, CA, US');
    await userEvent.click(suggestion);
    
    expect(mockOnLocationSelect).toHaveBeenCalledWith(
      { latitude: 37.7749, longitude: -122.4194 },
      'San Francisco, CA, US'
    );
  });

  it('should handle keyboard navigation in suggestions', async () => {
    const mockSuggestions = [
      {
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        address: { city: 'San Francisco', state: 'CA', country: 'US' },
        formattedAddress: 'San Francisco, CA, US',
        confidence: 'HIGH' as const
      },
      {
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        address: { city: 'New York', state: 'NY', country: 'US' },
        formattedAddress: 'New York, NY, US',
        confidence: 'HIGH' as const
      }
    ];

    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: mockSuggestions,
      loading: false,
      error: null,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: vi.fn(),
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });

    render(<LocationInput onLocationSelect={mockOnLocationSelect} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'San' } });
    
    // Navigate down to first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnLocationSelect).toHaveBeenCalledWith(
      { latitude: 37.7749, longitude: -122.4194 },
      'San Francisco, CA, US'
    );
  });

  it('should call onError when location error occurs', () => {
    const locationError = {
      code: 'PERMISSION_DENIED' as const,
      message: 'Location access denied'
    };

    mockUseLocation.mockReturnValue({
      location: null,
      loading: false,
      error: locationError,
      supported: true,
      permission: 'denied',
      requestLocation: vi.fn(),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      clearError: vi.fn(),
      checkPermission: vi.fn()
    });

    render(<LocationInput onError={mockOnError} />);
    
    expect(mockOnError).toHaveBeenCalledWith('Location access denied');
  });

  it('should call onError when geocoding error occurs', () => {
    const geocodingError = {
      code: 'NETWORK_ERROR' as const,
      message: 'Failed to geocode address'
    };

    mockUseGeocoding.mockReturnValue({
      results: [],
      suggestions: [],
      loading: false,
      error: geocodingError,
      geocode: vi.fn(),
      reverseGeocode: vi.fn(),
      getSuggestions: vi.fn(),
      parseCoordinatesInput: vi.fn(),
      clearResults: vi.fn(),
      clearSuggestions: vi.fn(),
      clearError: vi.fn()
    });

    render(<LocationInput onError={mockOnError} />);
    
    expect(mockOnError).toHaveBeenCalledWith('Failed to geocode address');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<LocationInput disabled />);
    
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Use current location')).toBeDisabled();
  });
});
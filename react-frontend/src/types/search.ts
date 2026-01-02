/**
 * Search-related types and interfaces
 */

import type { LocationCoordinates } from '../services/location';

export interface SearchFilters {
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  radius: number;
}

export interface SearchSort {
  field: 'distance' | 'rating' | 'name';
  direction: 'asc' | 'desc';
}

export interface SearchLocation {
  coordinates?: LocationCoordinates;
  address?: string;
}

export interface SearchState {
  query: string;
  location?: SearchLocation;
  filters: SearchFilters;
  sorting: SearchSort;
  pagination: {
    limit: number;
    nextToken?: string;
  };
}

export interface SearchParams {
  query?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  limit?: number;
  nextToken?: string;
}

export const DEFAULT_SEARCH_STATE: SearchState = {
  query: '',
  filters: {
    radius: 5000, // 5km default radius
  },
  sorting: {
    field: 'distance',
    direction: 'asc',
  },
  pagination: {
    limit: 20,
  },
};

export const RADIUS_OPTIONS = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
];

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'rating', label: 'Rating' },
  { value: 'name', label: 'Name' },
] as const;
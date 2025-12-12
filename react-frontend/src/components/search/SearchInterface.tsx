/**
 * SearchInterface component - main search interface with location input and filters
 * Integrates LocationInput, FilterPanel, SortControls, and SearchResults
 */

import React, { useState, useCallback, useEffect } from 'react';
import { LocationInput } from './LocationInput';
import { FilterPanel } from './FilterPanel';
import { SortControls } from './SortControls';
import { SearchResults } from './SearchResults';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { useListRestroomsQuery } from '../../hooks/useRestroomQueries';
import { useLoadingState } from '../../utils/loadingStates';
import { parseApolloError } from '../../utils/errorHandling';
import { LocationCoordinates } from '../../services/location';
import { Restroom } from '../../types/generated';
import { SearchState, SearchParams, DEFAULT_SEARCH_STATE } from '../../types/search';
import styles from './SearchInterface.module.css';

export interface SearchInterfaceProps {
  onRestroomSelect?: (restroom: Restroom) => void;
  onRestroomFeedback?: (restroom: Restroom) => void;
  initialLocation?: LocationCoordinates;
  className?: string;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onRestroomSelect,
  onRestroomFeedback,
  initialLocation,
  className = ''
}) => {
  const [searchState, setSearchState] = useState<SearchState>({
    ...DEFAULT_SEARCH_STATE,
    location: initialLocation ? { coordinates: initialLocation } : undefined
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // Build GraphQL query parameters from search state
  const buildSearchParams = useCallback((state: SearchState): SearchParams => {
    const params: SearchParams = {
      limit: state.pagination.limit,
      nextToken: state.pagination.nextToken,
    };

    // Add location parameters
    if (state.location?.coordinates) {
      params.lat = state.location.coordinates.latitude;
      params.lng = state.location.coordinates.longitude;
      params.radius = state.filters.radius;
    }

    // Add filter parameters
    if (state.filters.accessible !== undefined) {
      params.accessible = state.filters.accessible;
    }
    if (state.filters.unisex !== undefined) {
      params.unisex = state.filters.unisex;
    }
    if (state.filters.changingTable !== undefined) {
      params.changingTable = state.filters.changingTable;
    }

    // Add text query
    if (state.query.trim()) {
      params.query = state.query.trim();
    }

    return params;
  }, []);

  // Execute search when search state changes
  useEffect(() => {
    const params = buildSearchParams(searchState);
    setSearchParams(params);
  }, [searchState, buildSearchParams]);

  // GraphQL query
  const {
    data,
    loading,
    error,
    networkStatus,
    refetch,
    fetchMore
  } = useListRestroomsQuery(
    searchParams,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network'
    }
  );

  const loadingState = useLoadingState(loading, networkStatus, true, error);

  // Handle location selection
  const handleLocationSelect = useCallback((coordinates: LocationCoordinates, address?: string) => {
    setSearchState(prev => ({
      ...prev,
      location: { coordinates, address },
      pagination: { ...prev.pagination, nextToken: undefined } // Reset pagination
    }));
  }, []);

  // Handle location error
  const handleLocationError = useCallback((error: string) => {
    console.error('Location error:', error);
    // Could show toast notification here
  }, []);

  // Handle filters change
  const handleFiltersChange = useCallback((filters: SearchState['filters']) => {
    setSearchState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, nextToken: undefined } // Reset pagination
    }));
  }, []);

  // Handle sorting change
  const handleSortingChange = useCallback((sorting: SearchState['sorting']) => {
    setSearchState(prev => ({
      ...prev,
      sorting,
      pagination: { ...prev.pagination, nextToken: undefined } // Reset pagination
    }));
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (!data?.listRestrooms?.nextToken || loading) return;

    try {
      await fetchMore({
        variables: {
          ...searchParams,
          nextToken: data.listRestrooms.nextToken
        }
      });
    } catch (error) {
      console.error('Failed to load more results:', error);
    }
  }, [data?.listRestrooms?.nextToken, loading, fetchMore, searchParams]);

  // Handle search refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchState(DEFAULT_SEARCH_STATE);
  }, []);

  const results = data?.listRestrooms?.items || [];
  const hasMore = !!data?.listRestrooms?.nextToken;
  const totalCount = data?.listRestrooms?.count;
  const errorMessage = error ? parseApolloError(error).message : undefined;

  return (
    <div className={`${styles.searchInterface} ${className}`}>
      {/* Search Header */}
      <div className={styles.searchHeader}>
        <div className={styles.locationSection}>
          <LocationInput
            value={searchState.location?.address || ''}
            onLocationSelect={handleLocationSelect}
            onError={handleLocationError}
            placeholder="Enter address or use current location"
            className={styles.locationInput}
          />
        </div>

        <div className={styles.controlsSection}>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'secondary'}
            size="medium"
            className={styles.filtersToggle}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <Icon name="filter" />
            Filters
            {(searchState.filters.accessible !== undefined || 
              searchState.filters.unisex !== undefined || 
              searchState.filters.changingTable !== undefined) && (
              <span className={styles.filterIndicator} />
            )}
          </Button>

          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="medium"
            disabled={loading}
            className={styles.refreshButton}
            aria-label="Refresh search results"
          >
            <Icon name={loading ? 'loading' : 'refresh'} />
            Refresh
          </Button>

          {(searchState.location || searchState.query || 
            searchState.filters.accessible !== undefined ||
            searchState.filters.unisex !== undefined ||
            searchState.filters.changingTable !== undefined) && (
            <Button
              onClick={handleClearSearch}
              variant="text"
              size="medium"
              className={styles.clearButton}
              aria-label="Clear search"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <FilterPanel
            filters={searchState.filters}
            onFiltersChange={handleFiltersChange}
            disabled={loading}
          />
        </div>
      )}

      {/* Sort Controls */}
      {results.length > 0 && (
        <div className={styles.sortSection}>
          <SortControls
            sorting={searchState.sorting}
            onSortingChange={handleSortingChange}
            disabled={loading}
          />
        </div>
      )}

      {/* Search Results */}
      <div className={styles.resultsSection}>
        <SearchResults
          results={results}
          loading={loadingState.loading}
          error={errorMessage}
          hasMore={hasMore}
          totalCount={totalCount}
          onLoadMore={handleLoadMore}
          onRestroomSelect={onRestroomSelect}
          onRestroomFeedback={onRestroomFeedback}
        />
      </div>
    </div>
  );
};
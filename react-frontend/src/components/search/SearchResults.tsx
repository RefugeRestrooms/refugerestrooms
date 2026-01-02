/**
 * SearchResults component with paginated restroom cards
 * Displays search results with loading states and pagination
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { RestroomCard } from '../restroom/RestroomCard';
import type { Restroom } from '../../types/generated';
import styles from './SearchResults.module.css';

export interface SearchResultsProps {
  results: Restroom[];
  loading: boolean;
  error?: string;
  hasMore: boolean;
  totalCount?: number;
  onLoadMore?: () => void;
  onRestroomSelect?: (restroom: Restroom) => void;
  onRestroomFeedback?: (restroom: Restroom) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  hasMore,
  totalCount,
  onLoadMore,
  onRestroomSelect,
  onRestroomFeedback,
  className = ''
}) => {
  const handleLoadMore = () => {
    if (onLoadMore && !loading) {
      onLoadMore();
    }
  };

  // Show loading state for initial load
  if (loading && results.length === 0) {
    return (
      <div className={`${styles.searchResults} ${className}`}>
        <div className={styles.loadingState}>
          <Icon name="loading" className={styles.loadingIcon} />
          <p className={styles.loadingText}>Searching for restrooms...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && results.length === 0) {
    return (
      <div className={`${styles.searchResults} ${className}`}>
        <div className={styles.errorState}>
          <Icon name="error" className={styles.errorIcon} />
          <h3 className={styles.errorTitle}>Search Error</h3>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && results.length === 0) {
    return (
      <div className={`${styles.searchResults} ${className}`}>
        <div className={styles.emptyState}>
          <Icon name="search" className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No restrooms found</h3>
          <p className={styles.emptyMessage}>
            Try adjusting your search location or filters to find more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.searchResults} ${className}`}>
      <div className={styles.header}>
        <div className={styles.resultCount}>
          {totalCount !== undefined ? (
            <span>
              Showing {results.length} of {totalCount} restrooms
            </span>
          ) : (
            <span>
              {results.length} restroom{results.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      <div className={styles.resultsList}>
        {results.map((restroom) => (
          <RestroomCard
            key={restroom.id}
            restroom={restroom}
            onSelect={onRestroomSelect}
            onFeedback={onRestroomFeedback}
            showDistance={true}
            className={styles.resultCard}
          />
        ))}
      </div>

      {/* Load more section */}
      {(hasMore || loading) && (
        <div className={styles.loadMoreSection}>
          {loading ? (
            <div className={styles.loadingMore}>
              <Icon name="loading" className={styles.loadingIcon} />
              <span>Loading more results...</span>
            </div>
          ) : (
            <Button
              onClick={handleLoadMore}
              variant="secondary"
              size="medium"
              className={styles.loadMoreButton}
              disabled={loading}
            >
              Load More Results
            </Button>
          )}
        </div>
      )}

      {/* Error during pagination */}
      {error && results.length > 0 && (
        <div className={styles.paginationError}>
          <Icon name="error" className={styles.errorIcon} />
          <span>Failed to load more results: {error}</span>
          <Button
            onClick={handleLoadMore}
            variant="ghost"
            size="small"
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
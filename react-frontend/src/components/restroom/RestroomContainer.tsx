/**
 * RestroomContainer component that demonstrates navigation between search results and detail views
 * Handles restroom data loading and error states with proper navigation flow
 */

import React from 'react';
import { RestroomCard } from './RestroomCard';
import { RestroomDetail } from './RestroomDetail';
import { useRestroomNavigation } from '../../hooks/useRestroomNavigation';
import type { Restroom } from '../../types/generated';
import styles from './RestroomContainer.module.css';

export interface RestroomContainerProps {
  restrooms?: Restroom[];
  loading?: boolean;
  error?: string;
  onFeedback?: (restroom: Restroom) => void;
  onEdit?: (restroom: Restroom) => void;
  className?: string;
}

export const RestroomContainer: React.FC<RestroomContainerProps> = ({
  restrooms = [],
  loading = false,
  error,
  onFeedback,
  onEdit,
  className = ''
}) => {
  const {
    navigationState,
    navigateToDetail,
    navigateToEdit,
    goBack,
    canGoBack
  } = useRestroomNavigation();

  const handleRestroomSelect = (restroom: Restroom) => {
    navigateToDetail(restroom, {
      query: 'search context', // This would come from actual search state
      location: { lat: 0, lng: 0 }, // This would come from actual location
      filters: {} // This would come from actual filters
    });
  };

  const handleEdit = (restroom: Restroom) => {
    if (onEdit) {
      onEdit(restroom);
    } else {
      navigateToEdit(restroom);
    }
  };

  const handleFeedback = (restroom: Restroom) => {
    if (onFeedback) {
      onFeedback(restroom);
    }
  };

  // Render based on current navigation state
  switch (navigationState.currentView) {
    case 'detail':
      if (!navigationState.selectedRestroom) {
        return (
          <div className={`${styles.container} ${className}`}>
            <div className={styles.error}>
              <p>No restroom selected for detail view</p>
              <button onClick={goBack}>Go Back</button>
            </div>
          </div>
        );
      }

      return (
        <div className={`${styles.container} ${className}`}>
          <RestroomDetail
            restroomId={navigationState.selectedRestroom.id}
            onBack={canGoBack ? goBack : undefined}
            onEdit={handleEdit}
          />
        </div>
      );

    case 'search':
    default:
      return (
        <div className={`${styles.container} ${className}`}>
          {loading && (
            <div className={styles.loading}>
              <p>Loading restrooms...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>Error loading restrooms: {error}</p>
            </div>
          )}

          {!loading && !error && restrooms.length === 0 && (
            <div className={styles.empty}>
              <p>No restrooms found</p>
            </div>
          )}

          {!loading && !error && restrooms.length > 0 && (
            <div className={styles.restroomList}>
              {restrooms.map((restroom) => (
                <RestroomCard
                  key={restroom.id}
                  restroom={restroom}
                  onSelect={handleRestroomSelect}
                  onFeedback={handleFeedback}
                  showDistance={true}
                />
              ))}
            </div>
          )}
        </div>
      );
  }
};
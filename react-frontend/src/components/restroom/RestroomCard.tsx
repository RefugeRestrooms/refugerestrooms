/**
 * RestroomCard component for displaying restroom information in search results
 * Shows key details with accessibility badges and distance information
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { AccessibilityBadges } from './AccessibilityBadges';
import { Restroom } from '../../types/generated';
import styles from './RestroomCard.module.css';

export interface RestroomCardProps {
  restroom: Restroom;
  onSelect?: (restroom: Restroom) => void;
  onFeedback?: (restroom: Restroom) => void;
  showDistance?: boolean;
  className?: string;
}

export const RestroomCard: React.FC<RestroomCardProps> = ({
  restroom,
  onSelect,
  onFeedback,
  showDistance = true,
  className = ''
}) => {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(restroom);
    }
  };

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedback) {
      onFeedback(restroom);
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const getConfidenceColor = (confidence?: string): string => {
    switch (confidence) {
      case 'HIGH': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getRatingDisplay = () => {
    if (restroom.overallScore !== undefined) {
      return {
        score: Math.round(restroom.overallScore * 100),
        total: restroom.totalFeedback || 0
      };
    }
    
    // Fallback to upvote/downvote
    const total = restroom.upvote + restroom.downvote;
    if (total === 0) return null;
    
    const score = Math.round((restroom.upvote / total) * 100);
    return { score, total };
  };

  const rating = getRatingDisplay();

  return (
    <div 
      className={`${styles.restroomCard} ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Restroom: ${restroom.name} at ${restroom.street}, ${restroom.city}`}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.name}>{restroom.name}</h3>
          {showDistance && restroom.distance && (
            <span className={styles.distance}>
              {formatDistance(restroom.distance)}
            </span>
          )}
        </div>
        
        {rating && (
          <div className={styles.rating}>
            <span className={styles.score}>{rating.score}%</span>
            <span className={styles.ratingCount}>({rating.total})</span>
          </div>
        )}
      </div>

      <div className={styles.address}>
        <Icon name="location" className={styles.locationIcon} />
        <span>{restroom.street}, {restroom.city}, {restroom.state}</span>
      </div>

      <div className={styles.features}>
        <AccessibilityBadges
          accessible={restroom.accessible}
          unisex={restroom.unisex}
          changingTable={restroom.changingTable}
          size="small"
          showLabels={false}
        />
      </div>

      {restroom.comment && (
        <div className={styles.comment}>
          <Icon name="info" className={styles.commentIcon} />
          <span className={styles.commentText}>{restroom.comment}</span>
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.metadata}>
          {restroom.confidence && (
            <span 
              className={styles.confidence}
              style={{ color: getConfidenceColor(restroom.confidence) }}
            >
              {restroom.confidence.toLowerCase()} confidence
            </span>
          )}
        </div>
        
        <div className={styles.actions}>
          <Button
            onClick={handleFeedbackClick}
            variant="text"
            size="small"
            className={styles.feedbackButton}
            aria-label={`Provide feedback for ${restroom.name}`}
          >
            <Icon name="feedback" />
            Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};


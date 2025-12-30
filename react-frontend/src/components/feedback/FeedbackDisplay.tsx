/**
 * FeedbackDisplay component for showing aggregated restroom feedback
 * Displays ratings, confidence levels, and recent comments
 */

import React from 'react';
import { Icon } from '../ui/Icon';
import type { Restroom } from '../../types/generated';
import styles from './FeedbackDisplay.module.css';

export interface FeedbackDisplayProps {
  restroom: Restroom;
  className?: string;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  restroom,
  className = ''
}) => {
  const getRatingStats = () => {
    if (restroom.overallScore !== undefined) {
      return {
        overall: Math.round(restroom.overallScore * 100),
        safety: restroom.safetyScore ? Math.round(restroom.safetyScore * 100) : null,
        total: restroom.totalFeedback || 0
      };
    }
    
    // Fallback to upvote/downvote
    const total = restroom.upvote + restroom.downvote;
    if (total === 0) return null;
    
    const overall = Math.round((restroom.upvote / total) * 100);
    return { overall, safety: null, total };
  };

  const getConfidenceColor = (confidence?: string): string => {
    switch (confidence) {
      case 'HIGH': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getConfidenceDescription = (confidence?: string): string => {
    switch (confidence) {
      case 'HIGH': return 'High confidence - Multiple recent reviews confirm this information';
      case 'MEDIUM': return 'Medium confidence - Some reviews available but may need updates';
      case 'LOW': return 'Low confidence - Limited or outdated information available';
      default: return 'Confidence level not available';
    }
  };

  const stats = getRatingStats();

  if (!stats || stats.total === 0) {
    return (
      <div className={`${styles.feedbackDisplay} ${className}`}>
        <div className={styles.noFeedback}>
          <Icon name="feedback" className={styles.noFeedbackIcon} />
          <h3>No feedback yet</h3>
          <p>Be the first to share your experience with this restroom!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.feedbackDisplay} ${className}`}>
      {/* Rating overview */}
      <div className={styles.ratingOverview}>
        <div className={styles.mainRating}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreNumber}>{stats.overall}%</span>
            <span className={styles.scoreLabel}>positive</span>
          </div>
          
          <div className={styles.ratingDetails}>
            <div className={styles.totalReviews}>
              Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
            </div>
            
            {stats.safety !== null && (
              <div className={styles.safetyScore}>
                <Icon name="shield" className={styles.safetyIcon} />
                <span>Safety: {stats.safety}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Confidence indicator */}
        {restroom.confidence && (
          <div className={styles.confidenceIndicator}>
            <div 
              className={styles.confidenceBadge}
              style={{ backgroundColor: getConfidenceColor(restroom.confidence) }}
              title={getConfidenceDescription(restroom.confidence)}
            >
              <Icon name="info" className={styles.confidenceIcon} />
              <span className={styles.confidenceText}>
                {restroom.confidence.toLowerCase()} confidence
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rating breakdown */}
      <div className={styles.ratingBreakdown}>
        <div className={styles.breakdownItem}>
          <div className={styles.breakdownLabel}>
            <Icon name="thumbs-up" className={styles.positiveIcon} />
            Positive
          </div>
          <div className={styles.breakdownBar}>
            <div 
              className={styles.breakdownFill}
              style={{ 
                width: `${stats.overall}%`,
                backgroundColor: '#4caf50'
              }}
            />
          </div>
          <div className={styles.breakdownValue}>{restroom.upvote}</div>
        </div>
        
        <div className={styles.breakdownItem}>
          <div className={styles.breakdownLabel}>
            <Icon name="thumbs-down" className={styles.negativeIcon} />
            Negative
          </div>
          <div className={styles.breakdownBar}>
            <div 
              className={styles.breakdownFill}
              style={{ 
                width: `${100 - stats.overall}%`,
                backgroundColor: '#f44336'
              }}
            />
          </div>
          <div className={styles.breakdownValue}>{restroom.downvote}</div>
        </div>
      </div>

      {/* Recent feedback summary */}
      <div className={styles.feedbackSummary}>
        <h4 className={styles.summaryTitle}>Recent Feedback Highlights</h4>
        <div className={styles.summaryItems}>
          {stats.overall >= 80 && (
            <div className={styles.summaryItem}>
              <Icon name="check" className={styles.positiveIcon} />
              <span>Highly rated by the community</span>
            </div>
          )}
          
          {restroom.accessible && (
            <div className={styles.summaryItem}>
              <Icon name="wheelchair" className={styles.accessibleIcon} />
              <span>Confirmed wheelchair accessible</span>
            </div>
          )}
          
          {restroom.unisex && (
            <div className={styles.summaryItem}>
              <Icon name="unisex" className={styles.unisexIcon} />
              <span>Gender-neutral facility</span>
            </div>
          )}
          
          {restroom.changingTable && (
            <div className={styles.summaryItem}>
              <Icon name="baby" className={styles.babyIcon} />
              <span>Baby changing table available</span>
            </div>
          )}
          
          {stats.total >= 10 && (
            <div className={styles.summaryItem}>
              <Icon name="users" className={styles.communityIcon} />
              <span>Well-reviewed by community</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
/**
 * FeedbackSummary component for overall scores and confidence indicators
 * Provides a compact view of restroom feedback metrics
 */

import React from 'react';
import { Icon } from '../ui/Icon';
import type { Restroom } from '../../types/generated';
import styles from './FeedbackSummary.module.css';

export interface FeedbackSummaryProps {
  restroom: Restroom;
  showDetails?: boolean;
  className?: string;
}

export const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  restroom,
  showDetails = false,
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

  const getConfidenceIcon = (confidence?: string): 'check-circle' | 'info' | 'warning' | 'help' => {
    switch (confidence) {
      case 'HIGH': return 'check-circle';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'warning';
      default: return 'help';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const stats = getRatingStats();

  if (!stats || stats.total === 0) {
    return (
      <div className={`${styles.feedbackSummary} ${styles.noData} ${className}`}>
        <div className={styles.noDataContent}>
          <Icon name="feedback" className={styles.noDataIcon} />
          <span className={styles.noDataText}>No reviews yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.feedbackSummary} ${className}`}>
      {/* Main score */}
      <div className={styles.mainScore}>
        <div 
          className={styles.scoreCircle}
          style={{ backgroundColor: getScoreColor(stats.overall) }}
        >
          <span className={styles.scoreValue}>{stats.overall}%</span>
        </div>
        <div className={styles.scoreInfo}>
          <div className={styles.scoreLabel}>positive</div>
          <div className={styles.reviewCount}>
            {stats.total} review{stats.total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Additional metrics */}
      {showDetails && (
        <div className={styles.metrics}>
          {stats.safety !== null && (
            <div className={styles.metric}>
              <Icon name="shield" className={styles.metricIcon} />
              <span className={styles.metricLabel}>Safety:</span>
              <span 
                className={styles.metricValue}
                style={{ color: getScoreColor(stats.safety) }}
              >
                {stats.safety}%
              </span>
            </div>
          )}
          
          <div className={styles.metric}>
            <Icon name="thumbs-up" className={styles.metricIcon} />
            <span className={styles.metricLabel}>Positive:</span>
            <span className={styles.metricValue}>{restroom.upvote}</span>
          </div>
          
          <div className={styles.metric}>
            <Icon name="thumbs-down" className={styles.metricIcon} />
            <span className={styles.metricLabel}>Negative:</span>
            <span className={styles.metricValue}>{restroom.downvote}</span>
          </div>
        </div>
      )}

      {/* Confidence indicator */}
      {restroom.confidence && (
        <div className={styles.confidence}>
          <div 
            className={styles.confidenceBadge}
            style={{ backgroundColor: getConfidenceColor(restroom.confidence) }}
            title={`Data confidence: ${restroom.confidence.toLowerCase()}`}
          >
            <Icon 
              name={getConfidenceIcon(restroom.confidence)} 
              className={styles.confidenceIcon} 
            />
            <span className={styles.confidenceText}>
              {restroom.confidence.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      {/* Quick indicators */}
      {showDetails && (
        <div className={styles.indicators}>
          {stats.overall >= 90 && (
            <div className={styles.indicator}>
              <Icon name="star" className={styles.indicatorIcon} />
              <span>Highly rated</span>
            </div>
          )}
          
          {restroom.accessible && (
            <div className={styles.indicator}>
              <Icon name="wheelchair" className={styles.indicatorIcon} />
              <span>Accessible</span>
            </div>
          )}
          
          {restroom.unisex && (
            <div className={styles.indicator}>
              <Icon name="unisex" className={styles.indicatorIcon} />
              <span>Gender-neutral</span>
            </div>
          )}
          
          {stats.total >= 10 && (
            <div className={styles.indicator}>
              <Icon name="users" className={styles.indicatorIcon} />
              <span>Well-reviewed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
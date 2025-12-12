/**
 * RestroomDetail component for displaying full restroom information
 * Shows comprehensive details with feedback system and navigation
 */

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { AccessibilityBadges } from './AccessibilityBadges';
import { FeedbackDisplay } from '../feedback/FeedbackDisplay';
import { FeedbackForm } from '../feedback/FeedbackForm';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';
import { Restroom, GET_RESTROOM } from '../../types/generated';
import styles from './RestroomDetail.module.css';

export interface RestroomDetailProps {
  restroomId: string;
  onBack?: () => void;
  onEdit?: (restroom: Restroom) => void;
  className?: string;
}

export const RestroomDetail: React.FC<RestroomDetailProps> = ({
  restroomId,
  onBack,
  onEdit,
  className = ''
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_RESTROOM, {
    variables: { id: restroomId },
    errorPolicy: 'all'
  });

  const restroom = data?.getRestroom;

  const handleFeedbackSubmit = async () => {
    setShowFeedbackForm(false);
    setNotification({
      type: 'success',
      message: 'Thank you for your feedback!'
    });
    // Refetch to get updated ratings
    await refetch();
  };

  const handleGetDirections = () => {
    if (restroom?.latitude && restroom?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}`;
      window.open(url, '_blank');
    } else {
      const address = `${restroom?.street}, ${restroom?.city}, ${restroom?.state}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingDisplay = () => {
    if (restroom?.overallScore !== undefined) {
      return {
        score: Math.round(restroom.overallScore * 100),
        total: restroom.totalFeedback || 0
      };
    }
    
    // Fallback to upvote/downvote
    if (!restroom) return null;
    const total = restroom.upvote + restroom.downvote;
    if (total === 0) return null;
    
    const score = Math.round((restroom.upvote / total) * 100);
    return { score, total };
  };

  if (loading) {
    return (
      <div className={`${styles.restroomDetail} ${className}`}>
        <div className={styles.loading}>
          <Icon name="loading" className={styles.loadingIcon} />
          <p>Loading restroom details...</p>
        </div>
      </div>
    );
  }

  if (error || !restroom) {
    return (
      <div className={`${styles.restroomDetail} ${className}`}>
        <div className={styles.error}>
          <Icon name="error" className={styles.errorIcon} />
          <h2>Unable to load restroom details</h2>
          <p>{error?.message || 'The restroom information could not be found.'}</p>
          <div className={styles.errorActions}>
            <Button onClick={() => refetch()} variant="primary">
              Try Again
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="secondary">
                Go Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const rating = getRatingDisplay();

  return (
    <div className={`${styles.restroomDetail} ${className}`}>
      {/* Header with navigation */}
      <header className={styles.header}>
        {onBack && (
          <Button
            onClick={onBack}
            variant="text"
            className={styles.backButton}
            aria-label="Go back to search results"
          >
            <Icon name="arrow-left" />
            Back
          </Button>
        )}
        
        <div className={styles.headerActions}>
          {onEdit && (
            <Button
              onClick={() => onEdit(restroom)}
              variant="secondary"
              size="small"
            >
              <Icon name="edit" />
              Edit
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className={styles.content}>
        {/* Title and rating */}
        <div className={styles.titleSection}>
          <h1 className={styles.name}>{restroom.name}</h1>
          {rating && (
            <div className={styles.rating}>
              <span className={styles.score}>{rating.score}%</span>
              <span className={styles.ratingText}>positive</span>
              <span className={styles.ratingCount}>({rating.total} reviews)</span>
            </div>
          )}
        </div>

        {/* Address and location */}
        <div className={styles.locationSection}>
          <div className={styles.address}>
            <Icon name="location" className={styles.locationIcon} />
            <div className={styles.addressText}>
              <div className={styles.street}>{restroom.street}</div>
              <div className={styles.cityState}>
                {restroom.city}, {restroom.state} {restroom.country !== 'US' && restroom.country}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleGetDirections}
            variant="primary"
            className={styles.directionsButton}
          >
            <Icon name="directions" />
            Get Directions
          </Button>
        </div>

        {/* Accessibility features */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Accessibility Features</h2>
          <AccessibilityBadges
            accessible={restroom.accessible}
            unisex={restroom.unisex}
            changingTable={restroom.changingTable}
            size="large"
          />
        </div>

        {/* Comments and directions */}
        {(restroom.comment || restroom.directions) && (
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Additional Information</h2>
            
            {restroom.comment && (
              <div className={styles.infoItem}>
                <h3 className={styles.infoTitle}>
                  <Icon name="info" />
                  Comments
                </h3>
                <p className={styles.infoText}>{restroom.comment}</p>
              </div>
            )}
            
            {restroom.directions && (
              <div className={styles.infoItem}>
                <h3 className={styles.infoTitle}>
                  <Icon name="directions" />
                  Directions
                </h3>
                <p className={styles.infoText}>{restroom.directions}</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback section */}
        <div className={styles.feedbackSection}>
          <div className={styles.feedbackHeader}>
            <h2 className={styles.sectionTitle}>Community Feedback</h2>
            <Button
              onClick={() => setShowFeedbackForm(true)}
              variant="primary"
              size="small"
            >
              <Icon name="feedback" />
              Leave Feedback
            </Button>
          </div>
          
          <FeedbackDisplay restroom={restroom} />
        </div>

        {/* Metadata */}
        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.metadataLabel}>Added:</span>
            <span className={styles.metadataValue}>{formatDate(restroom.createdAt)}</span>
          </div>
          {restroom.updatedAt !== restroom.createdAt && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Updated:</span>
              <span className={styles.metadataValue}>{formatDate(restroom.updatedAt)}</span>
            </div>
          )}
          {restroom.confidence && (
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Data confidence:</span>
              <span 
                className={`${styles.metadataValue} ${styles.confidence} ${styles[restroom.confidence.toLowerCase()]}`}
              >
                {restroom.confidence.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback form modal */}
      {showFeedbackForm && (
        <Modal
          isOpen={showFeedbackForm}
          onClose={() => setShowFeedbackForm(false)}
          title="Leave Feedback"
        >
          <FeedbackForm
            restroom={restroom}
            onSubmit={handleFeedbackSubmit}
            onCancel={() => setShowFeedbackForm(false)}
          />
        </Modal>
      )}

      {/* Notification toast */}
      {notification && (
        <Toast
          id="restroom-detail-notification"
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </div>
  );
};
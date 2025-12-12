/**
 * SearchDemo component to test the search interface functionality
 * Demonstrates the complete search workflow with all components
 */

import React, { useState } from 'react';
import { SearchInterface } from '../search/SearchInterface';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Restroom } from '../../types/generated';
import styles from './SearchDemo.module.css';

export const SearchDemo: React.FC = () => {
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [feedbackRestroom, setFeedbackRestroom] = useState<Restroom | null>(null);

  const handleRestroomSelect = (restroom: Restroom) => {
    setSelectedRestroom(restroom);
  };

  const handleRestroomFeedback = (restroom: Restroom) => {
    setFeedbackRestroom(restroom);
  };

  const handleCloseDetail = () => {
    setSelectedRestroom(null);
  };

  const handleCloseFeedback = () => {
    setFeedbackRestroom(null);
  };

  return (
    <div className={styles.searchDemo}>
      <div className={styles.header}>
        <h2>Search Interface Demo</h2>
        <p>Test the complete search functionality with location, filters, and results</p>
      </div>

      <SearchInterface
        onRestroomSelect={handleRestroomSelect}
        onRestroomFeedback={handleRestroomFeedback}
        className={styles.searchInterface}
      />

      {/* Restroom Detail Modal */}
      {selectedRestroom && (
        <Modal
          isOpen={true}
          onClose={handleCloseDetail}
          title={selectedRestroom.name}
          className={styles.detailModal}
        >
          <div className={styles.restroomDetail}>
            <div className={styles.address}>
              <strong>Address:</strong>
              <p>{selectedRestroom.street}</p>
              <p>{selectedRestroom.city}, {selectedRestroom.state} {selectedRestroom.country}</p>
            </div>

            <div className={styles.features}>
              <strong>Features:</strong>
              <ul>
                <li>Wheelchair Accessible: {selectedRestroom.accessible ? 'Yes' : 'No'}</li>
                <li>Gender Neutral: {selectedRestroom.unisex ? 'Yes' : 'No'}</li>
                <li>Changing Table: {selectedRestroom.changingTable ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            {selectedRestroom.comment && (
              <div className={styles.comment}>
                <strong>Comment:</strong>
                <p>{selectedRestroom.comment}</p>
              </div>
            )}

            {selectedRestroom.directions && (
              <div className={styles.directions}>
                <strong>Directions:</strong>
                <p>{selectedRestroom.directions}</p>
              </div>
            )}

            <div className={styles.stats}>
              <strong>Community Feedback:</strong>
              <p>Upvotes: {selectedRestroom.upvote}</p>
              <p>Downvotes: {selectedRestroom.downvote}</p>
              {selectedRestroom.overallScore && (
                <p>Overall Score: {Math.round(selectedRestroom.overallScore * 100)}%</p>
              )}
            </div>

            <div className={styles.actions}>
              <Button onClick={handleCloseDetail} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {feedbackRestroom && (
        <Modal
          isOpen={true}
          onClose={handleCloseFeedback}
          title={`Feedback for ${feedbackRestroom.name}`}
          className={styles.feedbackModal}
        >
          <div className={styles.feedbackForm}>
            <p>Feedback functionality will be implemented in a future task.</p>
            <p>This modal demonstrates the integration point for the feedback system.</p>
            
            <div className={styles.actions}>
              <Button onClick={handleCloseFeedback} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
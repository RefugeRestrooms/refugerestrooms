/**
 * FeedbackForm component for submitting restroom feedback
 * Allows users to rate restrooms and provide detailed feedback
 */

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { SUBMIT_FEEDBACK } from '../../types/generated';
import type { Restroom, FeedbackReason } from '../../types/generated';
import styles from './FeedbackForm.module.css';

export interface FeedbackFormProps {
  restroom: Restroom;
  onSubmit: () => void;
  onCancel: () => void;
  className?: string;
}

interface FeedbackFormData {
  positive: boolean;
  reasons: FeedbackReason[];
  comment: string;
}

const POSITIVE_REASONS: { value: FeedbackReason; label: string; description: string }[] = [
  { value: 'SAFE', label: 'Safe', description: 'Felt safe and secure using this restroom' },
  { value: 'CLEAN', label: 'Clean', description: 'Restroom was clean and well-maintained' },
  { value: 'ACCESSIBLE', label: 'Accessible', description: 'Easy to access and use' },
  { value: 'ACCURATE', label: 'Accurate Info', description: 'Information provided was accurate' },
  { value: 'PRIVATE', label: 'Private', description: 'Good privacy and comfort level' }
];

const NEGATIVE_REASONS: { value: FeedbackReason; label: string; description: string }[] = [
  { value: 'UNSAFE', label: 'Unsafe', description: 'Did not feel safe using this restroom' },
  { value: 'DIRTY', label: 'Dirty', description: 'Restroom was not clean or well-maintained' },
  { value: 'INACCESSIBLE', label: 'Inaccessible', description: 'Difficult to access or use' },
  { value: 'OUTDATED', label: 'Outdated Info', description: 'Information provided was incorrect' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate', description: 'Not suitable for intended use' }
];

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  restroom,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    positive: true,
    reasons: [],
    comment: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitFeedback, { loading }] = useMutation(SUBMIT_FEEDBACK, {
    onCompleted: () => {
      onSubmit();
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    }
  });

  const handleRatingChange = (positive: boolean) => {
    setFormData(prev => ({
      ...prev,
      positive,
      reasons: [] // Clear reasons when switching rating type
    }));
    setErrors({});
  };

  const handleReasonToggle = (reason: FeedbackReason) => {
    setFormData(prev => ({
      ...prev,
      reasons: prev.reasons.includes(reason)
        ? prev.reasons.filter(r => r !== reason)
        : [...prev.reasons, reason]
    }));
  };

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }));
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.reasons.length === 0) {
      newErrors.reasons = 'Please select at least one reason for your rating';
    }

    if (formData.comment.trim().length > 500) {
      newErrors.comment = 'Comment must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await submitFeedback({
        variables: {
          restroomId: restroom.id,
          positive: formData.positive,
          reasons: formData.reasons,
          comment: formData.comment.trim() || undefined
        }
      });
    } catch {
      // Error handled by onError callback
    }
  };

  const availableReasons = formData.positive ? POSITIVE_REASONS : NEGATIVE_REASONS;

  return (
    <form 
      className={`${styles.feedbackForm} ${className}`}
      onSubmit={handleSubmit}
    >
      {/* Restroom info header */}
      <div className={styles.restroomInfo}>
        <h3 className={styles.restroomName}>{restroom.name}</h3>
        <p className={styles.restroomAddress}>
          {restroom.street}, {restroom.city}, {restroom.state}
        </p>
      </div>

      {/* Rating selection */}
      <div className={styles.ratingSection}>
        <h4 className={styles.sectionTitle}>How was your experience?</h4>
        <div className={styles.ratingButtons}>
          <button
            type="button"
            className={`${styles.ratingButton} ${formData.positive ? styles.active : ''}`}
            onClick={() => handleRatingChange(true)}
            aria-pressed={formData.positive}
          >
            <Icon name="thumbs-up" className={styles.ratingIcon} />
            <span>Positive</span>
          </button>
          <button
            type="button"
            className={`${styles.ratingButton} ${!formData.positive ? styles.active : ''}`}
            onClick={() => handleRatingChange(false)}
            aria-pressed={!formData.positive}
          >
            <Icon name="thumbs-down" className={styles.ratingIcon} />
            <span>Negative</span>
          </button>
        </div>
      </div>

      {/* Reason selection */}
      <div className={styles.reasonsSection}>
        <h4 className={styles.sectionTitle}>
          What made your experience {formData.positive ? 'positive' : 'negative'}?
        </h4>
        <div className={styles.reasonsList}>
          {availableReasons.map((reason) => (
            <label
              key={reason.value}
              className={`${styles.reasonItem} ${
                formData.reasons.includes(reason.value) ? styles.selected : ''
              }`}
            >
              <input
                type="checkbox"
                checked={formData.reasons.includes(reason.value)}
                onChange={() => handleReasonToggle(reason.value)}
                className={styles.reasonCheckbox}
              />
              <div className={styles.reasonContent}>
                <span className={styles.reasonLabel}>{reason.label}</span>
                <span className={styles.reasonDescription}>{reason.description}</span>
              </div>
            </label>
          ))}
        </div>
        {errors.reasons && (
          <div className={styles.error} role="alert">
            <Icon name="error" className={styles.errorIcon} />
            {errors.reasons}
          </div>
        )}
      </div>

      {/* Comment section */}
      <div className={styles.commentSection}>
        <label htmlFor="feedback-comment" className={styles.sectionTitle}>
          Additional comments (optional)
        </label>
        <textarea
          id="feedback-comment"
          value={formData.comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          placeholder="Share more details about your experience..."
          className={styles.commentTextarea}
          rows={4}
          maxLength={500}
        />
        <div className={styles.commentMeta}>
          <span className={styles.characterCount}>
            {formData.comment.length}/500 characters
          </span>
        </div>
        {errors.comment && (
          <div className={styles.error} role="alert">
            <Icon name="error" className={styles.errorIcon} />
            {errors.comment}
          </div>
        )}
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className={styles.error} role="alert">
          <Icon name="error" className={styles.errorIcon} />
          {errors.submit}
        </div>
      )}

      {/* Form actions */}
      <div className={styles.actions}>
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </form>
  );
};
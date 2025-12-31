import React from 'react';
import { Icon } from './Icon';
import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  overlay?: boolean;
  testID?: string; // React Native compatibility
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className,
  overlay = false,
  testID,
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    overlay && styles.overlay,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={spinnerClasses} 
      data-testid={testID}
      role="status"
      aria-label="Loading"
    >
      <Icon 
        name="loading" 
        size={size} 
        className={styles.icon}
        accessibilityLabel="Loading"
      />
      {message && (
        <p className={styles.message} aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
};
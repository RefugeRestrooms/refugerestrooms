import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { retryWithBackoff } from '../../utils/errorHandling';
import styles from './RetryButton.module.css';

export interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  maxRetries?: number;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
  testID?: string; // React Native compatibility
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  maxRetries = 3,
  disabled = false,
  variant = 'secondary',
  size = 'medium',
  className,
  children = 'Retry',
  testID,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleRetry = useCallback(async () => {
    if (isRetrying || disabled) return;

    setIsRetrying(true);
    setLastError(null);

    try {
      // If onRetry returns a promise, use retry with backoff
      const result = onRetry();
      
      if (result instanceof Promise) {
        await retryWithBackoff(async () => {
          await result;
        }, maxRetries);
      }
      // For synchronous operations, no additional handling needed

      // Reset retry count on success
      setRetryCount(0);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setLastError(errorMessage);
      
      // If we've exceeded max retries, keep the error visible
      if (newRetryCount >= maxRetries) {
        console.error('Max retries exceeded:', error);
      }
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, maxRetries, isRetrying, disabled, retryCount]);

  const isMaxRetriesReached = retryCount >= maxRetries;
  const buttonDisabled = disabled || isRetrying || isMaxRetriesReached;

  const getButtonText = () => {
    if (isRetrying) {
      return 'Retrying...';
    }
    
    if (isMaxRetriesReached) {
      return 'Max retries reached';
    }
    
    if (retryCount > 0) {
      return `Retry (${retryCount}/${maxRetries})`;
    }
    
    return children;
  };

  const buttonClasses = [
    styles.retryButton,
    lastError && styles.hasError,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={buttonClasses} data-testid={testID}>
      <Button
        onClick={handleRetry}
        disabled={buttonDisabled}
        variant={variant}
        size={size}
        loading={isRetrying}
        className={styles.button}
      >
        {!isRetrying && (
          <Icon 
            name="refresh" 
            size="small" 
            className={styles.icon}
            accessibilityLabel="Retry"
          />
        )}
        {getButtonText()}
      </Button>
      
      {lastError && (
        <div className={styles.errorMessage} role="alert">
          <Icon name="error" size="small" className={styles.errorIcon} />
          <span>{lastError}</span>
        </div>
      )}
      
      {isMaxRetriesReached && (
        <div className={styles.maxRetriesMessage} role="status">
          <Icon name="warning" size="small" className={styles.warningIcon} />
          <span>Please check your connection and try again later</span>
        </div>
      )}
    </div>
  );
};
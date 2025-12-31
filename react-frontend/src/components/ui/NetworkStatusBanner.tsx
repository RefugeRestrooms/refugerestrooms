import React, { useState, useEffect } from 'react';
import { useNetworkStatus, useNotifications } from '../../contexts/UIContext';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './NetworkStatusBanner.module.css';

export interface NetworkStatusBannerProps {
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
  showRetryButton?: boolean;
  onRetry?: () => void;
  testID?: string; // React Native compatibility
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  className,
  autoHide = true,
  autoHideDelay = 5000,
  showRetryButton = true,
  onRetry,
  testID,
}) => {
  const { networkStatus } = useNetworkStatus();
  const { addNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!networkStatus.isOnline) {
      // Show banner when going offline
      setIsVisible(true);
      setWasOffline(true);
    } else if (wasOffline && networkStatus.isOnline) {
      // Show reconnection message
      setIsVisible(true);
      
      // Add success notification
      addNotification({
        type: 'success',
        message: 'Connection restored',
        duration: 3000,
      });

      // Auto-hide after delay if enabled
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setWasOffline(false);
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [networkStatus.isOnline, wasOffline, autoHide, autoHideDelay, addNotification]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (networkStatus.isOnline) {
      setWasOffline(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  if (!isVisible) {
    return null;
  }

  const bannerClasses = [
    styles.banner,
    networkStatus.isOnline ? styles.online : styles.offline,
    className
  ].filter(Boolean).join(' ');

  const getMessage = () => {
    if (networkStatus.isOnline && wasOffline) {
      return 'Connection restored! You\'re back online.';
    } else if (!networkStatus.isOnline) {
      return 'You\'re currently offline. Some features may not be available.';
    }
    return '';
  };

  const getIcon = () => {
    if (networkStatus.isOnline && wasOffline) {
      return 'check-circle';
    } else if (!networkStatus.isOnline) {
      return 'warning';
    }
    return 'info';
  };

  return (
    <div 
      className={bannerClasses}
      role="alert"
      aria-live="polite"
      data-testid={testID}
    >
      <div className={styles.content}>
        <Icon 
          name={getIcon()} 
          size="small"
          className={styles.icon}
          accessibilityLabel={networkStatus.isOnline ? 'Online' : 'Offline'}
        />
        
        <div className={styles.message}>
          {getMessage()}
        </div>
      </div>

      <div className={styles.actions}>
        {!networkStatus.isOnline && showRetryButton && (
          <Button
            onClick={handleRetry}
            variant="ghost"
            size="small"
            className={styles.retryButton}
          >
            <Icon name="refresh" size="small" />
            Retry
          </Button>
        )}
        
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="small"
          className={styles.dismissButton}
          aria-label="Dismiss notification"
        >
          <Icon name="close" size="small" />
        </Button>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../contexts/UIContextHooks';
import { Icon } from './Icon';
import styles from './OfflineIndicator.module.css';

export interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
  testID?: string; // React Native compatibility
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showWhenOnline = false,
  testID,
}) => {
  const { networkStatus } = useNetworkStatus();
  const [lastOnlineText, setLastOnlineText] = useState('');

  useEffect(() => {
    const updateLastOnlineText = () => {
      if (!networkStatus.lastOnline) {
        setLastOnlineText('');
        return;
      }
      
      const now = Date.now();
      const diff = now - networkStatus.lastOnline;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setLastOnlineText(`Last online ${days} day${days > 1 ? 's' : ''} ago`);
      } else if (hours > 0) {
        setLastOnlineText(`Last online ${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else if (minutes > 0) {
        setLastOnlineText(`Last online ${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else {
        setLastOnlineText('Just went offline');
      }
    };

    updateLastOnlineText();
    
    // Update every minute when offline
    if (!networkStatus.isOnline && networkStatus.lastOnline) {
      const interval = setInterval(updateLastOnlineText, 60000);
      return () => clearInterval(interval);
    }
  }, [networkStatus.isOnline, networkStatus.lastOnline]);

  // Don't show anything if online and showWhenOnline is false
  if (networkStatus.isOnline && !showWhenOnline) {
    return null;
  }

  const indicatorClasses = [
    styles.indicator,
    networkStatus.isOnline ? styles.online : styles.offline,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={indicatorClasses}
      role="status"
      aria-live="polite"
      data-testid={testID}
    >
      <Icon 
        name={networkStatus.isOnline ? 'check-circle' : 'warning'} 
        size="small"
        className={styles.icon}
        accessibilityLabel={networkStatus.isOnline ? 'Online' : 'Offline'}
      />
      
      <div className={styles.content}>
        <span className={styles.status}>
          {networkStatus.isOnline ? 'Online' : 'Offline'}
        </span>
        
        {!networkStatus.isOnline && networkStatus.lastOnline && (
          <span className={styles.lastOnline}>
            {lastOnlineText}
          </span>
        )}
      </div>
    </div>
  );
};
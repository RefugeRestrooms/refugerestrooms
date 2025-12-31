import React from 'react';
import { useNetworkStatus } from '../../contexts/UIContext';
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

  // Don't show anything if online and showWhenOnline is false
  if (networkStatus.isOnline && !showWhenOnline) {
    return null;
  }

  const indicatorClasses = [
    styles.indicator,
    networkStatus.isOnline ? styles.online : styles.offline,
    className
  ].filter(Boolean).join(' ');

  const getLastOnlineText = () => {
    if (!networkStatus.lastOnline) return '';
    
    const now = Date.now();
    const diff = now - networkStatus.lastOnline;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Last online ${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `Last online ${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `Last online ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just went offline';
    }
  };

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
            {getLastOnlineText()}
          </span>
        )}
      </div>
    </div>
  );
};
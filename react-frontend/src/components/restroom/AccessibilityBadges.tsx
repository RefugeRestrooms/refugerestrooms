/**
 * AccessibilityBadges component for displaying restroom accessibility features
 * Shows visual indicators for wheelchair access, gender neutral, and changing table
 */

import React from 'react';
import { Icon, type IconName } from '../ui/Icon';
import styles from './AccessibilityBadges.module.css';

export interface AccessibilityBadgesProps {
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

export const AccessibilityBadges: React.FC<AccessibilityBadgesProps> = ({
  accessible,
  unisex,
  changingTable,
  size = 'medium',
  layout = 'horizontal',
  showLabels = true,
  className = ''
}) => {
  const badges = [
    {
      key: 'accessible',
      icon: 'wheelchair' as IconName,
      label: 'Wheelchair Accessible',
      shortLabel: 'Accessible',
      active: accessible,
      description: accessible 
        ? 'This restroom is wheelchair accessible' 
        : 'This restroom is not wheelchair accessible'
    },
    {
      key: 'unisex',
      icon: 'unisex' as IconName,
      label: 'Gender Neutral',
      shortLabel: 'Unisex',
      active: unisex,
      description: unisex 
        ? 'This is a gender-neutral restroom' 
        : 'This is not a gender-neutral restroom'
    },
    {
      key: 'changingTable',
      icon: 'baby' as IconName,
      label: 'Changing Table',
      shortLabel: 'Baby Change',
      active: changingTable,
      description: changingTable 
        ? 'This restroom has a baby changing table' 
        : 'This restroom does not have a baby changing table'
    }
  ];

  return (
    <div 
      className={`
        ${styles.accessibilityBadges} 
        ${styles[size]} 
        ${styles[layout]} 
        ${className}
      `}
      role="list"
      aria-label="Accessibility features"
    >
      {badges.map((badge) => (
        <AccessibilityBadge
          key={badge.key}
          icon={badge.icon}
          label={showLabels ? badge.shortLabel : ''}
          active={badge.active}
          description={badge.description}
          size={size}
        />
      ))}
    </div>
  );
};

interface AccessibilityBadgeProps {
  icon: IconName;
  label: string;
  active: boolean;
  description: string;
  size: 'small' | 'medium' | 'large';
}

const AccessibilityBadge: React.FC<AccessibilityBadgeProps> = ({
  icon,
  label,
  active,
  description,
  size
}) => {
  return (
    <div 
      className={`${styles.badge} ${active ? styles.active : styles.inactive} ${styles[size]}`}
      title={description}
      role="listitem"
      aria-label={description}
    >
      <Icon name={icon} className={styles.badgeIcon} aria-hidden="true" />
      {label && (
        <span className={styles.badgeLabel}>{label}</span>
      )}
    </div>
  );
};

// Export individual badge for use in other components
export { AccessibilityBadge };
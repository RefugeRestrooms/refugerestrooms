import React from 'react';
import styles from './Icon.module.css';

export type IconName = 
  | 'search'
  | 'location'
  | 'filter'
  | 'sort'
  | 'sort-up'
  | 'sort-down'
  | 'close'
  | 'check'
  | 'warning'
  | 'error'
  | 'info'
  | 'loading'
  | 'refresh'
  | 'feedback'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'plus'
  | 'minus'
  | 'heart'
  | 'star'
  | 'user'
  | 'menu'
  | 'home'
  | 'settings'
  | 'accessibility'
  | 'wheelchair'
  | 'baby'
  | 'unisex';

export interface IconProps {
  name: IconName;
  size?: 'small' | 'medium' | 'large' | number;
  color?: string;
  className?: string;
  testID?: string; // React Native compatibility
  accessibilityLabel?: string; // React Native compatibility
  style?: React.CSSProperties;
}

const iconPaths: Record<IconName, string | React.ReactElement> = {
  search: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  location: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
  filter: <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />,
  sort: <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />,
  'sort-up': <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />,
  'sort-down': <path d="M3 20h13M3 16h9m-9-4h6m4 0l4 4m0 0l4-4m-4 4V8" />,
  close: <path d="M6 18L18 6M6 6l12 12" />,
  check: <path d="M5 13l4 4L19 7" />,
  warning: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />,
  error: <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  loading: (
    <g>
      <path d="M12 2v4" opacity="1">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 12;360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M12 18v4" opacity="0.8" />
      <path d="M4.93 4.93l2.83 2.83" opacity="0.7" />
      <path d="M16.24 16.24l2.83 2.83" opacity="0.6" />
      <path d="M2 12h4" opacity="0.5" />
      <path d="M18 12h4" opacity="0.4" />
      <path d="M4.93 19.07l2.83-2.83" opacity="0.3" />
      <path d="M16.24 7.76l2.83-2.83" opacity="0.2" />
    </g>
  ),
  refresh: <path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />,
  feedback: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  'arrow-left': <path d="M19 12H5m7-7l-7 7 7 7" />,
  'arrow-right': <path d="M5 12h14m-7-7l7 7-7 7" />,
  'arrow-up': <path d="M12 19V5m-7 7l7-7 7 7" />,
  'arrow-down': <path d="M12 5v14m7-7l-7 7-7-7" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  minus: <path d="M5 12h14" />,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  settings: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  accessibility: <path d="M16 4a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14l-4 6h2l2-4 2 4h2l-4-6zM8 10h8l-1 2H9l-1-2z" />,
  wheelchair: <path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM21 9h-6l-2-5a1 1 0 0 0-1-.8c-.4-.1-.8.1-1 .4L8 8.3V6a1 1 0 0 0-2 0v4.7c0 .3.1.6.3.8L9 14.1V21a1 1 0 0 0 2 0v-7.5l-2.2-2.3L12 8l1.2 3H21a1 1 0 0 0 0-2z M7.5 12a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />,
  baby: <path d="M12 2a3 3 0 0 1 3 3c0 1.5-1 2.7-2.4 2.9L14 9.5c.6.8 1 1.8 1 2.9v1.6c0 2.2-1.8 4-4 4s-4-1.8-4-4V12.4c0-1.1.4-2.1 1-2.9l1.4-1.6C8 7.7 7 6.5 7 5a3 3 0 0 1 3-3h2zm-1 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M6 16h12v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-2z" />,
  unisex: <path d="M12 1a3 3 0 0 1 3 3c0 1.7-1.3 3-3 3s-3-1.3-3-3a3 3 0 0 1 3-3zM8 8h8c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-2v6h-4v-6H8c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z" />
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color,
  className,
  testID,
  accessibilityLabel,
  style,
  ...props
}) => {
  const getSizeValue = () => {
    if (typeof size === 'number') return size;
    
    switch (size) {
      case 'small': return 16;
      case 'medium': return 24;
      case 'large': return 32;
      default: return 24;
    }
  };

  const sizeValue = getSizeValue();
  const iconPath = iconPaths[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const iconClasses = [
    styles.icon,
    typeof size === 'string' && styles[size],
    className
  ].filter(Boolean).join(' ');

  const iconStyle: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    color,
    ...style
  };

  return (
    <svg
      className={iconClasses}
      style={iconStyle}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={accessibilityLabel || `${name} icon`}
      data-testid={testID}
      {...props}
    >
      {iconPath}
    </svg>
  );
};
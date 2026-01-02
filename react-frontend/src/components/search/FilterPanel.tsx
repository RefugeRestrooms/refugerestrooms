/**
 * FilterPanel component for accessibility features and search radius
 * Provides filters for wheelchair access, unisex facilities, and changing tables
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import type { SearchFilters } from '../../types/search';
import { RADIUS_OPTIONS } from '../../types/search';
import styles from './FilterPanel.module.css';

export interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  disabled?: boolean;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  disabled = false,
  className = ''
}) => {
  const handleFilterToggle = (filterKey: keyof Omit<SearchFilters, 'radius'>) => {
    const currentValue = filters[filterKey];
    onFiltersChange({
      ...filters,
      [filterKey]: currentValue === undefined ? true : !currentValue
    });
  };

  const handleRadiusChange = (radius: number) => {
    onFiltersChange({
      ...filters,
      radius
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      radius: filters.radius, // Keep radius, clear other filters
    });
  };

  const hasActiveFilters = filters.accessible !== undefined || 
                          filters.unisex !== undefined || 
                          filters.changingTable !== undefined;

  return (
    <div className={`${styles.filterPanel} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            size="small"
            disabled={disabled}
            className={styles.clearButton}
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Accessibility Features</h4>
        <div className={styles.filterGroup}>
          <FilterToggle
            id="accessible"
            label="Wheelchair Accessible"
            icon="wheelchair"
            active={filters.accessible === true}
            disabled={disabled}
            onClick={() => handleFilterToggle('accessible')}
          />
          <FilterToggle
            id="unisex"
            label="Gender Neutral"
            icon="unisex"
            active={filters.unisex === true}
            disabled={disabled}
            onClick={() => handleFilterToggle('unisex')}
          />
          <FilterToggle
            id="changingTable"
            label="Changing Table"
            icon="baby"
            active={filters.changingTable === true}
            disabled={disabled}
            onClick={() => handleFilterToggle('changingTable')}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Search Radius</h4>
        <div className={styles.radiusGroup}>
          {RADIUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleRadiusChange(option.value)}
              variant={filters.radius === option.value ? 'primary' : 'secondary'}
              size="small"
              disabled={disabled}
              className={styles.radiusButton}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface FilterToggleProps {
  id: string;
  label: string;
  icon: IconName;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  id,
  label,
  icon,
  active,
  disabled,
  onClick
}) => {
  return (
    <button
      id={id}
      className={`${styles.filterToggle} ${active ? styles.active : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`Filter by ${label}`}
    >
      <Icon name={icon} className={styles.filterIcon} />
      <span className={styles.filterLabel}>{label}</span>
      {active && (
        <Icon name="check" className={styles.checkIcon} />
      )}
    </button>
  );
};
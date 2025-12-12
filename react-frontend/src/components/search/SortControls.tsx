/**
 * SortControls component for distance, rating, and alphabetical sorting
 * Provides sorting options with direction toggle
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { SearchSort, SORT_OPTIONS } from '../../types/search';
import styles from './SortControls.module.css';

export interface SortControlsProps {
  sorting: SearchSort;
  onSortingChange: (sorting: SearchSort) => void;
  disabled?: boolean;
  className?: string;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sorting,
  onSortingChange,
  disabled = false,
  className = ''
}) => {
  const handleSortFieldChange = (field: SearchSort['field']) => {
    // If clicking the same field, toggle direction
    if (sorting.field === field) {
      onSortingChange({
        ...sorting,
        direction: sorting.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // If clicking a different field, use default direction
      const defaultDirection = field === 'distance' ? 'asc' : 'desc';
      onSortingChange({
        field,
        direction: defaultDirection
      });
    }
  };

  const getSortIcon = (field: SearchSort['field']) => {
    if (sorting.field !== field) {
      return 'sort';
    }
    return sorting.direction === 'asc' ? 'sort-up' : 'sort-down';
  };

  const getSortLabel = (field: SearchSort['field']) => {
    const option = SORT_OPTIONS.find(opt => opt.value === field);
    return option?.label || field;
  };

  return (
    <div className={`${styles.sortControls} ${className}`}>
      <div className={styles.header}>
        <span className={styles.label}>Sort by:</span>
      </div>
      
      <div className={styles.sortButtons}>
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleSortFieldChange(option.value)}
            variant={sorting.field === option.value ? 'primary' : 'secondary'}
            size="small"
            disabled={disabled}
            className={styles.sortButton}
            aria-label={`Sort by ${option.label} ${
              sorting.field === option.value 
                ? (sorting.direction === 'asc' ? 'ascending' : 'descending')
                : ''
            }`}
          >
            <span className={styles.sortText}>{option.label}</span>
            <Icon 
              name={getSortIcon(option.value)} 
              className={styles.sortIcon}
            />
          </Button>
        ))}
      </div>
    </div>
  );
};
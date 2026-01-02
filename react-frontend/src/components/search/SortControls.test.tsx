/**
 * SortControls component tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortControls } from './SortControls';
import { DEFAULT_SEARCH_STATE } from '../../types/search';

describe('SortControls', () => {
  const mockOnSortingChange = vi.fn();

  beforeEach(() => {
    mockOnSortingChange.mockClear();
  });

  it('renders sort options', () => {
    render(
      <SortControls
        sorting={DEFAULT_SEARCH_STATE.sorting}
        onSortingChange={mockOnSortingChange}
      />
    );

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('changes sort field', () => {
    render(
      <SortControls
        sorting={DEFAULT_SEARCH_STATE.sorting}
        onSortingChange={mockOnSortingChange}
      />
    );

    const ratingButton = screen.getByText('Rating');
    fireEvent.click(ratingButton);

    expect(mockOnSortingChange).toHaveBeenCalledWith({
      field: 'rating',
      direction: 'desc' // Default for rating
    });
  });

  it('toggles sort direction when clicking same field', () => {
    render(
      <SortControls
        sorting={{ field: 'distance', direction: 'asc' }}
        onSortingChange={mockOnSortingChange}
      />
    );

    const distanceButton = screen.getByText('Distance');
    fireEvent.click(distanceButton);

    expect(mockOnSortingChange).toHaveBeenCalledWith({
      field: 'distance',
      direction: 'desc'
    });
  });

  it('shows correct button states', () => {
    render(
      <SortControls
        sorting={{ field: 'rating', direction: 'desc' }}
        onSortingChange={mockOnSortingChange}
      />
    );

    const ratingButton = screen.getByText('Rating');
    const buttonElement = ratingButton.closest('button');
    expect(buttonElement?.className).toContain('primary');
  });

  it('disables controls when disabled prop is true', () => {
    render(
      <SortControls
        sorting={DEFAULT_SEARCH_STATE.sorting}
        onSortingChange={mockOnSortingChange}
        disabled={true}
      />
    );

    const distanceButton = screen.getByText('Distance');
    expect(distanceButton.closest('button')).toBeDisabled();
  });
});
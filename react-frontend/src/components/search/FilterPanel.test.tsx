/**
 * FilterPanel component tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';
import { DEFAULT_SEARCH_STATE } from '../../types/search';

describe('FilterPanel', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders filter options', () => {
    render(
      <FilterPanel
        filters={DEFAULT_SEARCH_STATE.filters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Features')).toBeInTheDocument();
    expect(screen.getByText('Search Radius')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Wheelchair Accessible')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Gender Neutral')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Changing Table')).toBeInTheDocument();
  });

  it('toggles accessibility filters', () => {
    render(
      <FilterPanel
        filters={DEFAULT_SEARCH_STATE.filters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const accessibleFilter = screen.getByLabelText('Filter by Wheelchair Accessible');
    fireEvent.click(accessibleFilter);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...DEFAULT_SEARCH_STATE.filters,
      accessible: true
    });
  });

  it('changes radius selection', () => {
    render(
      <FilterPanel
        filters={DEFAULT_SEARCH_STATE.filters}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const radius2km = screen.getByText('2 km');
    fireEvent.click(radius2km);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...DEFAULT_SEARCH_STATE.filters,
      radius: 2000
    });
  });

  it('shows clear button when filters are active', () => {
    const filtersWithActive = {
      ...DEFAULT_SEARCH_STATE.filters,
      accessible: true
    };

    render(
      <FilterPanel
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const clearButton = screen.getByLabelText('Clear all filters');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      radius: DEFAULT_SEARCH_STATE.filters.radius
    });
  });

  it('disables controls when disabled prop is true', () => {
    render(
      <FilterPanel
        filters={DEFAULT_SEARCH_STATE.filters}
        onFiltersChange={mockOnFiltersChange}
        disabled={true}
      />
    );

    const accessibleFilter = screen.getByLabelText('Filter by Wheelchair Accessible');
    expect(accessibleFilter).toBeDisabled();
  });
});
/**
 * RestroomCard component tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestroomCard } from './RestroomCard';
import { Restroom } from '../../types/generated';

const mockRestroom: Restroom = {
  id: '1',
  name: 'Test Restroom',
  street: '123 Main St',
  city: 'Test City',
  state: 'TS',
  country: 'Test Country',
  accessible: true,
  unisex: false,
  changingTable: true,
  comment: 'Test comment',
  directions: 'Test directions',
  upvote: 5,
  downvote: 1,
  approved: true,
  overallScore: 0.85,
  totalFeedback: 6,
  confidence: 'HIGH',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  distance: 1500
};

describe('RestroomCard', () => {
  const mockOnSelect = vi.fn();
  const mockOnFeedback = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnFeedback.mockClear();
  });

  it('renders restroom information', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    expect(screen.getByText('Test Restroom')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Test City, TS')).toBeInTheDocument();
    expect(screen.getByText('1.5km')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('(6)')).toBeInTheDocument();
    expect(screen.getByText('Test comment')).toBeInTheDocument();
  });

  it('shows accessibility badges correctly', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    const accessibleBadge = screen.getByTitle('This restroom is wheelchair accessible');
    const unisexBadge = screen.getByTitle('This is not a gender-neutral restroom');
    const changingTableBadge = screen.getByTitle('This restroom has a baby changing table');

    expect(accessibleBadge.className).toContain('active');
    expect(unisexBadge.className).toContain('inactive');
    expect(changingTableBadge.className).toContain('active');
  });

  it('calls onSelect when card is clicked', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    const card = screen.getByRole('button', { name: /Restroom: Test Restroom/ });
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledWith(mockRestroom);
  });

  it('calls onFeedback when feedback button is clicked', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    const feedbackButton = screen.getByLabelText('Provide feedback for Test Restroom');
    fireEvent.click(feedbackButton);

    expect(mockOnFeedback).toHaveBeenCalledWith(mockRestroom);
    expect(mockOnSelect).not.toHaveBeenCalled(); // Should not trigger card selection
  });

  it('handles keyboard navigation', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    const card = screen.getByRole('button', { name: /Restroom: Test Restroom/ });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(mockRestroom);
  });

  it('formats distance correctly', () => {
    const restroomWithShortDistance = { ...mockRestroom, distance: 500 };
    render(
      <RestroomCard
        restroom={restroomWithShortDistance}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
      />
    );

    expect(screen.getByText('500m')).toBeInTheDocument();
  });

  it('hides distance when showDistance is false', () => {
    render(
      <RestroomCard
        restroom={mockRestroom}
        onSelect={mockOnSelect}
        onFeedback={mockOnFeedback}
        showDistance={false}
      />
    );

    expect(screen.queryByText('1.5km')).not.toBeInTheDocument();
  });
});
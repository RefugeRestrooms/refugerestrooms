import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedbackSummary } from './FeedbackSummary';

// Mock CSS modules
vi.mock('./FeedbackSummary.module.css', () => ({
  default: {}
}));

vi.mock('../ui/Icon.module.css', () => ({
  default: {}
}));

const mockRestroomWithFeedback = {
  id: '1',
  name: 'Test Restroom',
  street: '123 Main St',
  city: 'Test City',
  state: 'TS',
  country: 'US',
  latitude: 40.7128,
  longitude: -74.0060,
  accessible: true,
  unisex: false,
  changingTable: true,
  comment: 'Test comment',
  directions: 'Test directions',
  upvote: 9,
  downvote: 1,
  approved: true,
  overallScore: 0.9,
  safetyScore: 0.85,
  totalFeedback: 10,
  confidence: 'HIGH' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const mockRestroomNoFeedback = {
  id: '2',
  name: 'Empty Restroom',
  street: '456 Empty St',
  city: 'Empty City',
  state: 'ES',
  country: 'US',
  latitude: 40.7128,
  longitude: -74.0060,
  accessible: false,
  unisex: true,
  changingTable: false,
  upvote: 0,
  downvote: 0,
  approved: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

describe('FeedbackSummary', () => {
  it('displays main score and review count', () => {
    render(<FeedbackSummary restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByText('10 reviews')).toBeInTheDocument();
  });

  it('displays confidence indicator', () => {
    render(<FeedbackSummary restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows detailed metrics when showDetails is true', () => {
    render(<FeedbackSummary restroom={mockRestroomWithFeedback} showDetails />);

    expect(screen.getByText('Safety:')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Positive:')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Negative:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows indicators when showDetails is true', () => {
    render(<FeedbackSummary restroom={mockRestroomWithFeedback} showDetails />);

    expect(screen.getByText('Highly rated')).toBeInTheDocument();
    expect(screen.getByText('Accessible')).toBeInTheDocument();
    expect(screen.getByText('Well-reviewed')).toBeInTheDocument();
  });

  it('shows no data message when no reviews', () => {
    render(<FeedbackSummary restroom={mockRestroomNoFeedback} />);

    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('handles single review correctly', () => {
    const singleReviewRestroom = {
      ...mockRestroomNoFeedback,
      upvote: 1,
      downvote: 0
    };

    render(<FeedbackSummary restroom={singleReviewRestroom} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('1 review')).toBeInTheDocument(); // singular form
  });

  it('shows gender-neutral indicator for unisex restrooms', () => {
    const unisexRestroom = {
      ...mockRestroomWithFeedback,
      unisex: true
    };

    render(<FeedbackSummary restroom={unisexRestroom} showDetails />);

    expect(screen.getByText('Gender-neutral')).toBeInTheDocument();
  });
});
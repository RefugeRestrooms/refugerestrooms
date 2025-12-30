import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedbackDisplay } from './FeedbackDisplay';

// Mock CSS modules
vi.mock('./FeedbackDisplay.module.css', () => ({
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
  upvote: 8,
  downvote: 2,
  approved: true,
  overallScore: 0.8,
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

describe('FeedbackDisplay', () => {
  it('displays feedback statistics when available', () => {
    render(<FeedbackDisplay restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByText('Based on 10 reviews')).toBeInTheDocument();
    expect(screen.getByText('Safety: 85%')).toBeInTheDocument();
  });

  it('displays confidence indicator', () => {
    render(<FeedbackDisplay restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('high confidence')).toBeInTheDocument();
  });

  it('shows rating breakdown', () => {
    render(<FeedbackDisplay restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Negative')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // upvote count
    expect(screen.getByText('2')).toBeInTheDocument(); // downvote count
  });

  it('displays accessibility features in summary', () => {
    render(<FeedbackDisplay restroom={mockRestroomWithFeedback} />);

    expect(screen.getByText('Confirmed wheelchair accessible')).toBeInTheDocument();
    expect(screen.getByText('Baby changing table available')).toBeInTheDocument();
  });

  it('shows no feedback message when no reviews', () => {
    render(<FeedbackDisplay restroom={mockRestroomNoFeedback} />);

    expect(screen.getByText('No feedback yet')).toBeInTheDocument();
    expect(screen.getByText('Be the first to share your experience with this restroom!')).toBeInTheDocument();
  });

  it('handles fallback to upvote/downvote when no overall score', () => {
    const restroomWithVotes = {
      ...mockRestroomNoFeedback,
      upvote: 7,
      downvote: 3
    };

    render(<FeedbackDisplay restroom={restroomWithVotes} />);

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Based on 10 reviews')).toBeInTheDocument();
  });
});
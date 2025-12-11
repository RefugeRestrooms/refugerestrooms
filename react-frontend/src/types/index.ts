// Core data types for the application

export interface Restroom {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  features: {
    accessible: boolean;
    unisex: boolean;
    changingTable: boolean;
  };
  metadata: {
    comment?: string;
    directions?: string;
    upvote: number;
    downvote: number;
    approved: boolean;
  };
  analytics?: {
    distance?: number;
    overallScore?: number;
    safetyScore?: number;
    totalFeedback?: number;
    confidence?: FeedbackConfidence;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export type FeedbackConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SearchState {
  query: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  filters: {
    accessible?: boolean;
    unisex?: boolean;
    changingTable?: boolean;
    radius: number;
  };
  sorting: {
    field: 'distance' | 'rating' | 'name';
    direction: 'asc' | 'desc';
  };
  pagination: {
    limit: number;
    nextToken?: string;
  };
}

export interface UIState {
  loading: {
    search: boolean;
    submit: boolean;
    feedback: boolean;
  };
  errors: {
    network?: string;
    validation?: Record<string, string>;
    location?: string;
  };
  modals: {
    feedback: boolean;
    confirmation: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>;
}

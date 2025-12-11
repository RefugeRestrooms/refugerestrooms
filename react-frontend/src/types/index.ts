// Core data types for the application
export * from './graphql';

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

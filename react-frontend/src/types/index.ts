// Core data types for the application
export * from './graphql';

// Explicit re-exports to resolve naming conflicts
export type {
  SearchSort,
  SearchParams,
} from './search';

export {
  DEFAULT_SEARCH_STATE,
  RADIUS_OPTIONS,
  SORT_OPTIONS,
} from './search';

// Use aliases for conflicting types
export type {
  SearchFilters as UISearchFilters,
  SearchLocation as UISearchLocation,
  SearchState as UISearchState,
} from './search';

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

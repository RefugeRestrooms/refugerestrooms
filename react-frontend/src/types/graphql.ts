// Re-export all generated types and hooks
export * from './generated';

// Additional type definitions for the application
export interface SearchFilters {
  accessible?: boolean;
  unisex?: boolean;
  changingTable?: boolean;
  radius: number;
}

export interface SearchLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface SearchState {
  query: string;
  location?: SearchLocation;
  filters: SearchFilters;
  sorting: {
    field: 'distance' | 'rating' | 'name';
    direction: 'asc' | 'desc';
  };
  pagination: {
    limit: number;
    nextToken?: string;
  };
}

export interface RestroomFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  accessible: boolean;
  unisex: boolean;
  changingTable: boolean;
  comment?: string;
  directions?: string;
}

// Error types for better error handling
export interface GraphQLFormattedError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    exception?: {
      stacktrace?: string[];
    };
  };
}

export interface NetworkError {
  name: string;
  message: string;
  statusCode?: number;
  result?: unknown;
}

// Apollo Client error types
export interface ApolloErrorInfo {
  graphQLErrors: GraphQLFormattedError[];
  networkError: NetworkError | null;
  message: string;
}
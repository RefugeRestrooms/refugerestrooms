import type { NetworkError } from '../types/graphql';

/**
 * Application error types for consistent error handling
 */
export interface AppError {
  type: 'network' | 'graphql' | 'validation' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  retryable: boolean;
}

/**
 * Parse Apollo Client errors into a standardized format
 */
export const parseApolloError = (error: any): AppError => {
  // Handle network errors
  if (error.networkError) {
    const networkError = error.networkError as NetworkError;
    
    if (networkError.statusCode) {
      switch (networkError.statusCode) {
        case 401:
          return {
            type: 'network',
            message: 'Authentication failed. Please check your API key.',
            code: 'UNAUTHORIZED',
            retryable: false,
          };
        case 403:
          return {
            type: 'network',
            message: 'Access denied. Insufficient permissions.',
            code: 'FORBIDDEN',
            retryable: false,
          };
        case 429:
          return {
            type: 'network',
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMITED',
            retryable: true,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'network',
            message: 'Server error. Please try again.',
            code: 'SERVER_ERROR',
            retryable: true,
          };
        default:
          return {
            type: 'network',
            message: `Network error: ${networkError.message}`,
            code: 'NETWORK_ERROR',
            retryable: true,
          };
      }
    }
    
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection.',
      code: 'CONNECTION_ERROR',
      retryable: true,
    };
  }

  // Handle GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const graphQLError = error.graphQLErrors[0];
    
    return {
      type: 'graphql',
      message: graphQLError.message,
      code: graphQLError.extensions?.code as string,
      details: graphQLError,
      retryable: false,
    };
  }

  // Handle unknown errors
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.',
    retryable: false,
  };
};

/**
 * Get a user-friendly error message from an Apollo error
 */
export const getErrorMessage = (error: any): string => {
  const appError = parseApolloError(error);
  return appError.message;
};

/**
 * Check if an error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  const appError = parseApolloError(error);
  return appError.retryable;
};

/**
 * Get retry delay with exponential backoff
 */
export const getRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error is retryable (for Apollo errors)
      if (error instanceof Error && 'networkError' in error && !isRetryableError(error as any)) {
        break;
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed');
};
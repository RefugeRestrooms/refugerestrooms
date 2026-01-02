import { useCallback } from 'react';
import { parseApolloError, retryWithBackoff } from '../utils/errorHandling';
import type { AppError } from '../utils/errorHandling';
import type { NetworkError } from '../types/graphql';

/**
 * Custom hook for GraphQL operations with error handling and retry logic
 */
export const useGraphQL = () => {
  /**
   * Execute a GraphQL operation with error handling
   */
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      retries?: number;
      onError?: (error: AppError) => void;
      onSuccess?: (data: T) => void;
    }
  ): Promise<T | null> => {
    try {
      const result = await retryWithBackoff(operation, options?.retries);
      
      if (result && options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const appError = parseApolloError(error as Error & { networkError?: NetworkError; graphQLErrors?: Array<{ message: string; extensions?: { code?: string } }> });
      
      if (options?.onError) {
        options.onError(appError);
      } else {
        console.error('GraphQL operation failed:', appError);
      }
      
      return null;
    }
  }, []);

  /**
   * Handle Apollo query errors consistently
   */
  const handleQueryError = useCallback((error: Error & { networkError?: NetworkError; graphQLErrors?: Array<{ message: string; extensions?: { code?: string } }> }): AppError => {
    return parseApolloError(error);
  }, []);

  /**
   * Handle Apollo mutation errors consistently
   */
  const handleMutationError = useCallback((error: Error & { networkError?: NetworkError; graphQLErrors?: Array<{ message: string; extensions?: { code?: string } }> }): AppError => {
    return parseApolloError(error);
  }, []);

  return {
    executeOperation,
    handleQueryError,
    handleMutationError,
  };
};
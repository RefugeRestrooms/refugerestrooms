import { NetworkStatus } from '@apollo/client';

/**
 * Loading state interface for consistent loading state management
 */
export interface LoadingState {
  loading: boolean;
  networkStatus: NetworkStatus;
  called: boolean;
  error?: Error;
}

/**
 * Get loading state information from Apollo query result
 */
export const getLoadingState = (
  loading: boolean,
  networkStatus: NetworkStatus,
  called: boolean = true,
  error?: Error
): LoadingState => {
  return {
    loading,
    networkStatus,
    called,
    error,
  };
};

/**
 * Check if this is the initial loading state
 */
export const isInitialLoading = (loadingState: LoadingState): boolean => {
  return loadingState.loading && loadingState.networkStatus === NetworkStatus.loading;
};

/**
 * Check if data is being refetched
 */
export const isRefetching = (loadingState: LoadingState): boolean => {
  return loadingState.loading && loadingState.networkStatus === NetworkStatus.refetch;
};

/**
 * Check if more data is being fetched (pagination)
 */
export const isFetchingMore = (loadingState: LoadingState): boolean => {
  return loadingState.loading && loadingState.networkStatus === NetworkStatus.fetchMore;
};

/**
 * Check if data is being polled
 */
export const isPolling = (loadingState: LoadingState): boolean => {
  return loadingState.loading && loadingState.networkStatus === NetworkStatus.poll;
};

/**
 * Check if there's an error
 */
export const hasError = (loadingState: LoadingState): boolean => {
  return !!loadingState.error;
};

/**
 * Check if the query is ready (not loading and has been called)
 */
export const isReady = (loadingState: LoadingState): boolean => {
  return !loadingState.loading && loadingState.called;
};

/**
 * Get a user-friendly loading message based on network status
 */
export const getLoadingMessage = (loadingState: LoadingState): string => {
  if (isInitialLoading(loadingState)) {
    return 'Loading...';
  }
  
  if (isRefetching(loadingState)) {
    return 'Refreshing...';
  }
  
  if (isFetchingMore(loadingState)) {
    return 'Loading more...';
  }
  
  if (isPolling(loadingState)) {
    return 'Updating...';
  }
  
  return '';
};

/**
 * Loading state hook for components
 */
export const useLoadingState = (
  loading: boolean,
  networkStatus: NetworkStatus,
  called: boolean = true,
  error?: Error
) => {
  const loadingState = getLoadingState(loading, networkStatus, called, error);
  
  return {
    ...loadingState,
    isInitialLoading: isInitialLoading(loadingState),
    isRefetching: isRefetching(loadingState),
    isFetchingMore: isFetchingMore(loadingState),
    isPolling: isPolling(loadingState),
    hasError: hasError(loadingState),
    isReady: isReady(loadingState),
    loadingMessage: getLoadingMessage(loadingState),
  };
};
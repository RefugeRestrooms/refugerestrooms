import React, { useEffect } from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient, addNetworkStatusListener } from '../../services/apollo';
import { UIProvider, useUI } from '../../contexts/UIContext';
import { cacheSyncService } from '../../services/cacheSync';

interface ApolloProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced Apollo Provider with UI state integration
 */
const ApolloProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNetworkStatus, setLastSync } = useUI();

  useEffect(() => {
    // Monitor network status and sync cache when coming online
    const removeNetworkListener = addNetworkStatusListener(async (isOnline) => {
      setNetworkStatus(isOnline);
      
      if (isOnline) {
        try {
          const result = await cacheSyncService.syncRestrooms({ forceRefresh: true });
          if (result.success) {
            setLastSync(result.timestamp);
          }
        } catch (error) {
          console.warn('Failed to sync cache on network reconnection:', error);
        }
      }
    });

    // Start periodic sync
    const stopPeriodicSync = cacheSyncService.startPeriodicSync();

    return () => {
      removeNetworkListener();
      stopPeriodicSync();
    };
  }, [setNetworkStatus, setLastSync]);

  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
};

/**
 * Apollo Client Provider component that wraps the application
 * with GraphQL client functionality and UI state management.
 * 
 * This provider makes the Apollo Client instance available to all
 * child components through React context, and integrates with
 * UI state management for loading states, error handling, and
 * offline functionality.
 */
export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <UIProvider>
      <ApolloProviderInner>
        {children}
      </ApolloProviderInner>
    </UIProvider>
  );
};
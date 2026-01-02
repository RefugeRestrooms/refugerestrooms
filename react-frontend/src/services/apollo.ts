import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Environment configuration
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://api.refuge.app/graphql';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// HTTP link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Authentication link for AWS AppSync API key
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    }
  };
});

// Types for error handling
interface GraphQLError {
  message: string;
  locations?: unknown;
  path?: unknown;
}

interface NetworkError {
  message: string;
  statusCode?: number;
}

interface ErrorResponse {
  graphQLErrors?: GraphQLError[];
  networkError?: NetworkError;
}

// Error handling link with retry logic
const errorLink = onError((errorResponse): void => {
  const { graphQLErrors, networkError } = errorResponse as ErrorResponse;
  
  if (graphQLErrors) {
    graphQLErrors.forEach((error: GraphQLError) => {
      console.error(
        `GraphQL error: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError.message}`);
    
    // Handle specific network errors
    if (networkError.statusCode) {
      switch (networkError.statusCode) {
        case 401:
          console.error('Unauthorized: Check API key configuration');
          break;
        case 403:
          console.error('Forbidden: Insufficient permissions');
          break;
        case 429:
          console.error('Rate limited: Too many requests');
          // Note: Retry logic would need to be implemented differently
          // as onError handlers should return void
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error: Request failed');
          break;
        default:
          console.error(`HTTP ${networkError.statusCode}: ${networkError.message}`);
      }
    }
  }
});

// Cache configuration with enhanced policies for optimal performance
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        listRestrooms: {
          // Cache key based on search parameters
          keyArgs: ['accessible', 'unisex', 'changingTable', 'lat', 'lng', 'radius', 'query'],
          merge(existing, incoming, { args }) {
            if (!existing) {
              return incoming;
            }
            
            // Handle pagination by merging items
            const existingItems = existing.items || [];
            const incomingItems = incoming.items || [];
            
            // If this is a new search (no nextToken), replace existing data
            if (!args?.nextToken) {
              return incoming;
            }
            
            // Otherwise, append new items for pagination
            return {
              ...incoming,
              items: [...existingItems, ...incomingItems],
            };
          },
        },
        getRestroom: {
          // Cache individual restroom queries by ID
          keyArgs: ['id'],
        },
      },
    },
    Restroom: {
      keyFields: ['id'],
      fields: {
        // Distance is computed based on user location, don't cache
        distance: {
          merge: false,
        },
        // Feedback data should be merged to handle optimistic updates
        upvote: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        downvote: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        overallScore: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        safetyScore: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        totalFeedback: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Mutation: {
      fields: {
        createRestroom: {
          // Invalidate relevant queries after creating a restroom
          merge: false,
        },
        submitFeedback: {
          // Handle feedback submission optimistically
          merge: false,
        },
      },
    },
  },
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper functions for client management
export const clearCache = async (): Promise<void> => {
  await apolloClient.clearStore();
};

export const resetCache = async (): Promise<void> => {
  await apolloClient.resetStore();
};

// Cache invalidation helpers
export const invalidateRestroomQueries = async (): Promise<void> => {
  await apolloClient.refetchQueries({
    include: ['listRestrooms'],
  });
};

export const invalidateRestroomById = async (id: string): Promise<void> => {
  // Use id parameter to potentially target specific queries in the future
  console.debug('Invalidating restroom queries for ID:', id);
  await apolloClient.refetchQueries({
    include: ['getRestroom'],
  });
};

// Optimistic update helpers
export const updateRestroomInCache = (id: string, updates: Partial<Record<string, unknown>>): void => {
  apolloClient.cache.modify({
    id: apolloClient.cache.identify({ __typename: 'Restroom', id }),
    fields: {
      ...Object.keys(updates).reduce((acc, key) => {
        acc[key] = () => updates[key];
        return acc;
      }, {} as Record<string, () => unknown>),
    },
  });
};

// Network status helpers
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const addNetworkStatusListener = (callback: (online: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
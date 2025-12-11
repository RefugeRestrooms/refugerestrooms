import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from '../../services/apollo';

interface ApolloProviderProps {
  children: React.ReactNode;
}

/**
 * Apollo Client Provider component that wraps the application
 * with GraphQL client functionality.
 * 
 * This provider makes the Apollo Client instance available to all
 * child components through React context.
 */
export const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
};
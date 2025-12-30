import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { mockApolloClient } from '../mocks/apollo';

interface TestApolloProviderProps {
  children: React.ReactNode;
}

/**
 * Test-specific Apollo Client Provider that uses a mock client
 * to avoid network requests during testing.
 */
export const TestApolloProvider: React.FC<TestApolloProviderProps> = ({ children }) => {
  return (
    <BaseApolloProvider client={mockApolloClient}>
      {children}
    </BaseApolloProvider>
  );
};
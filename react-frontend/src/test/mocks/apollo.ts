import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';

// Create a no-op link that doesn't execute any operations
const noOpLink = new ApolloLink(() => {
  // Return an observable that never emits (effectively ignoring all queries)
  return new Promise(() => {});
});

// Create a test Apollo Client with no-op link
export const mockApolloClient = new ApolloClient({
  link: noOpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
      notifyOnNetworkStatusChange: false,
    },
    query: {
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
  },
});
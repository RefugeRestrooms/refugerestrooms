import { describe, it, expect } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AppRouter } from './AppRouter';
import { TestApolloProvider } from '../../test/providers/TestApolloProvider';

const renderWithApollo = async (component: React.ReactElement) => {
  let result: any;
  await act(async () => {
    result = render(
      <TestApolloProvider>
        {component}
      </TestApolloProvider>
    );
  });
  
  // Wait for any async operations to complete
  await waitFor(() => {
    // Just wait a tick for any immediate state updates
  });
  
  return result;
};

describe('AppRouter', () => {
  it('renders the home page by default', async () => {
    await renderWithApollo(<AppRouter />);
    
    // Check for header elements
    expect(screen.getByText('REFUGE Restrooms')).toBeInTheDocument();
    expect(screen.getByText('Safe restroom access for everyone')).toBeInTheDocument();
    
    // Check for home page content
    expect(screen.getByText('Find Safe Restrooms')).toBeInTheDocument();
    expect(screen.getByText('Search for accessible and safe restroom facilities in your area')).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    await renderWithApollo(<AppRouter />);
    
    expect(screen.getByRole('link', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add Restroom' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('renders footer content', async () => {
    await renderWithApollo(<AppRouter />);
    
    expect(screen.getByText(/© 2024 REFUGE Restrooms/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });
});
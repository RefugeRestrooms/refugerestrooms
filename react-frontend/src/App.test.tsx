import { describe, it, expect } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import App from './App';
import { TestApolloProvider } from './test/providers/TestApolloProvider';

const renderWithApollo = async (component: React.ReactElement) => {
  let result: ReturnType<typeof render> | undefined;
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
  
  return result!;
};

describe('App', () => {
  it('renders the main heading', async () => {
    await renderWithApollo(<App />);
    expect(screen.getByText('REFUGE Restrooms')).toBeInTheDocument();
  });

  it('renders the subtitle', async () => {
    await renderWithApollo(<App />);
    expect(
      screen.getByText('Safe restroom access for everyone')
    ).toBeInTheDocument();
  });

  it('renders the home page content', async () => {
    await renderWithApollo(<App />);
    expect(
      screen.getByText('Find Safe Restrooms')
    ).toBeInTheDocument();
  });
});

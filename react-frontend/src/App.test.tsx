import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { ApolloProvider } from './components/providers/ApolloProvider';

const renderWithApollo = (component: React.ReactElement) => {
  return render(
    <ApolloProvider>
      {component}
    </ApolloProvider>
  );
};

describe('App', () => {
  it('renders the main heading', () => {
    renderWithApollo(<App />);
    expect(screen.getByText('REFUGE Restrooms')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithApollo(<App />);
    expect(
      screen.getByText('Safe restroom access for everyone')
    ).toBeInTheDocument();
  });

  it('shows development ready message', () => {
    renderWithApollo(<App />);
    expect(
      screen.getByText(
        'React Frontend Application - Development Environment Ready'
      )
    ).toBeInTheDocument();
  });
});

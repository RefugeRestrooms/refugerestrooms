import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('REFUGE Restrooms')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(
      screen.getByText('Safe restroom access for everyone')
    ).toBeInTheDocument();
  });

  it('shows development ready message', () => {
    render(<App />);
    expect(
      screen.getByText(
        'React Frontend Application - Development Environment Ready'
      )
    ).toBeInTheDocument();
  });
});

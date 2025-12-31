import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';
import styles from './LoadingSpinner.module.css';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status')).toHaveClass(styles.small);

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status')).toHaveClass(styles.large);
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('shows overlay when overlay prop is true', () => {
    render(<LoadingSpinner overlay />);
    
    expect(screen.getByRole('status')).toHaveClass(styles.overlay);
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner message="Loading restrooms..." />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(screen.getByText('Loading restrooms...')).toBeInTheDocument();
  });
});
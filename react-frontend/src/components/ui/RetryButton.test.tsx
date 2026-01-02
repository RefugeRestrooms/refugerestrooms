import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RetryButton } from './RetryButton';

// Mock the Button component
vi.mock('./Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, loading, className }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    variant?: string; 
    size?: string; 
    loading?: boolean; 
    className?: string; 
  }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${variant} ${size} ${className}`}
      aria-busy={loading}
    >
      {children}
    </button>
  ),
}));

// Mock the Icon component
vi.mock('./Icon', () => ({
  Icon: ({ name, accessibilityLabel }: { 
    name: string; 
    accessibilityLabel?: string; 
  }) => (
    <span data-testid={`icon-${name}`} aria-label={accessibilityLabel}>
      {name}
    </span>
  ),
}));

// Mock the error handling utility
vi.mock('../../utils/errorHandling', () => ({
  retryWithBackoff: vi.fn((fn) => fn()),
}));

describe('RetryButton', () => {
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRetry.mockResolvedValue(undefined);
  });

  it('renders with default props', () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();
  });

  it('calls onRetry when clicked', async () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during retry', async () => {
    const slowRetry = vi.fn((): Promise<void> => new Promise(resolve => setTimeout(resolve, 100)));
    render(<RetryButton onRetry={slowRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(<RetryButton onRetry={mockOnRetry}>Try Again</RetryButton>);
    
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('applies different variants', () => {
    const { rerender } = render(<RetryButton onRetry={mockOnRetry} variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('primary');

    rerender(<RetryButton onRetry={mockOnRetry} variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('secondary');

    rerender(<RetryButton onRetry={mockOnRetry} variant="ghost" />);
    expect(screen.getByRole('button')).toHaveClass('ghost');
  });

  it('shows retry count after failed attempts', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Test error'));
    render(<RetryButton onRetry={failingRetry} maxRetries={5} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.getByText('Retry (1/5)')).toBeInTheDocument();
  });

  it('disables button when max retries reached', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Test error'));
    render(<RetryButton onRetry={failingRetry} maxRetries={1} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(button).toBeDisabled();
    expect(screen.getByText('Max retries reached')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    render(<RetryButton onRetry={mockOnRetry} className="custom-class" />);
    
    // The className is applied to the container div, not the button
    const container = screen.getByRole('button').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('shows icon by default', () => {
    render(<RetryButton onRetry={mockOnRetry} />);
    
    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();
  });

  it('hides icon during loading', async () => {
    const slowRetry = vi.fn((): Promise<void> => new Promise(resolve => setTimeout(resolve, 100)));
    render(<RetryButton onRetry={slowRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.queryByTestId('icon-refresh')).not.toBeInTheDocument();
  });

  it('handles async onRetry function', async () => {
    const asyncRetry = vi.fn().mockResolvedValue(undefined);
    render(<RetryButton onRetry={asyncRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(asyncRetry).toHaveBeenCalledTimes(1);
  });

  it('shows error message when retry fails', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<RetryButton onRetry={failingRetry} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();
  });

  it('shows max retries message when limit reached', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Test error'));
    render(<RetryButton onRetry={failingRetry} maxRetries={1} />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      button.click();
    });

    expect(screen.getByText('Please check your connection and try again later')).toBeInTheDocument();
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });
});
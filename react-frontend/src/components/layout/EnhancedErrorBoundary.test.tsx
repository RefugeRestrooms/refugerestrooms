import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Mock the RetryButton component
vi.mock('../ui/RetryButton', () => ({
  RetryButton: ({ children, onRetry, className }: any) => (
    <button onClick={onRetry} className={className}>
      {children}
    </button>
  ),
}));

// Mock the Icon component
vi.mock('../ui/Icon', () => ({
  Icon: ({ name, size, className }: any) => (
    <span className={className} data-testid={`icon-${name}`} data-size={size}>
      {name}
    </span>
  ),
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('EnhancedErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', async () => {
    const customFallback = <div>Custom error message</div>;

    await act(async () => {
      render(
        <EnhancedErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', async () => {
    const onError = vi.fn();

    await act(async () => {
      render(
        <EnhancedErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('shows retry count when retries are attempted', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary maxRetries={3}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    // Click retry button
    const retryButton = screen.getByText('Try Again');
    await act(async () => {
      retryButton.click();
    });

    expect(screen.getByText('Retry attempt 1 of 3')).toBeInTheDocument();
  });

  it('disables retry button after max retries', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary maxRetries={1}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    // Click retry button once
    const retryButton = screen.getByText('Try Again');
    await act(async () => {
      retryButton.click();
    });

    // After max retries, retry button should not be available
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('shows appropriate error severity for different error types', async () => {
    // Test ChunkLoadError
    const ChunkLoadError = () => {
      const error = new Error('Loading chunk 123 failed');
      error.name = 'ChunkLoadError';
      throw error;
    };

    await act(async () => {
      render(
        <EnhancedErrorBoundary>
          <ChunkLoadError />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText(/Failed to load application resources/)).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('shows critical error UI for high severity level', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    expect(screen.getByText(/critical error occurred/)).toBeInTheDocument();
    expect(screen.getByTestId('icon-error')).toBeInTheDocument();
  });

  it('shows support info for critical errors', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.getByText(/contact support with Error ID/)).toBeInTheDocument();
  });

  it('hides retry button when showRetryButton is false', async () => {
    await act(async () => {
      render(
        <EnhancedErrorBoundary showRetryButton={false}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );
    });

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });
});
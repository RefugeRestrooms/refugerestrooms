import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NetworkStatusBanner } from './NetworkStatusBanner';

// Mock the UIContext
const mockNetworkStatus = {
  isOnline: false,
  lastOnline: null,
};

const mockAddNotification = vi.fn();

const mockUseNetworkStatus = vi.fn(() => ({
  networkStatus: mockNetworkStatus,
}));

const mockUseNotifications = vi.fn(() => ({
  addNotification: mockAddNotification,
}));

vi.mock('../../contexts/UIContext', () => ({
  useNetworkStatus: () => mockUseNetworkStatus(),
  useNotifications: () => mockUseNotifications(),
}));

// Mock the Icon component
vi.mock('./Icon', () => ({
  Icon: ({ name, accessibilityLabel }: any) => (
    <span data-testid={`icon-${name}`} aria-label={accessibilityLabel}>
      {name}
    </span>
  ),
}));

// Mock the Button component
vi.mock('./Button', () => ({
  Button: ({ children, onClick, variant, size, className, 'aria-label': ariaLabel }: any) => (
    <button 
      onClick={onClick} 
      className={`${variant} ${size} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

describe('NetworkStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNetworkStatus.isOnline = false;
    mockNetworkStatus.lastOnline = null;
  });

  it('renders offline banner when offline', () => {
    render(<NetworkStatusBanner />);
    
    expect(screen.getByText(/currently offline/)).toBeInTheDocument();
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('shows retry button when offline', () => {
    render(<NetworkStatusBanner />);
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByTestId('icon-refresh')).toBeInTheDocument();
  });

  it('does not render when online initially', () => {
    mockNetworkStatus.isOnline = true;
    const { container } = render(<NetworkStatusBanner />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<NetworkStatusBanner className="custom-class" />);
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('shows dismiss button', async () => {
    render(<NetworkStatusBanner />);
    
    const dismissButton = screen.getByLabelText('Dismiss notification');
    expect(dismissButton).toBeInTheDocument();

    await act(async () => {
      dismissButton.click();
    });

    // Banner should be dismissed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<NetworkStatusBanner />);
    
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<NetworkStatusBanner onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Retry');
    await act(async () => {
      retryButton.click();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetryButton is false', () => {
    render(<NetworkStatusBanner showRetryButton={false} />);
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('shows connection restored message when coming back online', () => {
    // Start offline
    const { rerender } = render(<NetworkStatusBanner />);
    
    // Go online
    mockNetworkStatus.isOnline = true;
    rerender(<NetworkStatusBanner />);
    
    expect(screen.getByText(/Connection restored/)).toBeInTheDocument();
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
  });

  it('adds notification when connection is restored', () => {
    // Start offline
    const { rerender } = render(<NetworkStatusBanner />);
    
    // Go online
    mockNetworkStatus.isOnline = true;
    rerender(<NetworkStatusBanner />);
    
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'success',
      message: 'Connection restored',
      duration: 3000,
    });
  });

  it('auto-hides after delay when back online', async () => {
    vi.useFakeTimers();
    
    // Start offline
    const { rerender } = render(<NetworkStatusBanner autoHideDelay={2000} />);
    
    // Go online
    mockNetworkStatus.isOnline = true;
    rerender(<NetworkStatusBanner autoHideDelay={2000} />);
    
    expect(screen.getByText(/Connection restored/)).toBeInTheDocument();
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });
});
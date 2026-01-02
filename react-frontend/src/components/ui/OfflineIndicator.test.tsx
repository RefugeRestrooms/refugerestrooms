import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OfflineIndicator } from './OfflineIndicator';

// Mock the UIContext
const mockNetworkStatus = {
  isOnline: false,
  lastOnline: null as number | null,
};

const mockUseNetworkStatus = vi.fn(() => ({
  networkStatus: mockNetworkStatus,
}));

vi.mock('../../contexts/UIContextHooks', () => ({
  useNetworkStatus: () => mockUseNetworkStatus(),
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

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNetworkStatus.isOnline = false;
    mockNetworkStatus.lastOnline = null;
  });

  it('renders offline status by default', () => {
    render(<OfflineIndicator />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByTestId('icon-warning')).toBeInTheDocument();
  });

  it('does not render when online and showWhenOnline is false', () => {
    mockNetworkStatus.isOnline = true;
    const { container } = render(<OfflineIndicator showWhenOnline={false} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders online status when online and showWhenOnline is true', () => {
    mockNetworkStatus.isOnline = true;
    render(<OfflineIndicator showWhenOnline />);
    
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<OfflineIndicator className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('shows last online time when offline', () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    mockNetworkStatus.lastOnline = oneHourAgo;
    
    render(<OfflineIndicator />);
    
    expect(screen.getByText('Last online 1 hour ago')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<OfflineIndicator />);
    
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('shows "Just went offline" for recent disconnection', () => {
    const justNow = Date.now() - 1000; // 1 second ago
    mockNetworkStatus.lastOnline = justNow;
    
    render(<OfflineIndicator />);
    
    expect(screen.getByText('Just went offline')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIProvider, useUI, useNotifications } from './UIContext';

// Mock storage service
vi.mock('../services/storage', () => ({
  storageService: {
    getUIPreferences: vi.fn(() => ({})),
    setUIPreferences: vi.fn(() => true),
  },
}));

// Test component that uses UI context
const TestComponent: React.FC = () => {
  const { state, setLoading, setError, addNotification } = useUI();

  return (
    <div>
      <div data-testid="loading-search">{state.loading.search.toString()}</div>
      <div data-testid="error-network">{state.errors.network || 'none'}</div>
      <div data-testid="notifications-count">{state.notifications.length}</div>
      <div data-testid="online-status">{state.networkStatus.isOnline.toString()}</div>
      
      <button onClick={() => setLoading('search', true)}>Set Loading</button>
      <button onClick={() => setError('network', 'Connection failed')}>Set Error</button>
      <button onClick={() => addNotification({ type: 'success', message: 'Test notification' })}>
        Add Notification
      </button>
    </div>
  );
};

const NotificationTestComponent: React.FC = () => {
  const { notifications, addNotification } = useNotifications();

  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <button onClick={() => addNotification({ 
        type: 'info', 
        message: 'Auto-remove test',
        duration: 100 
      })}>
        Add Auto-Remove Notification
      </button>
    </div>
  );
};

describe('UIContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );
    });

    expect(screen.getByTestId('loading-search')).toHaveTextContent('false');
    expect(screen.getByTestId('error-network')).toHaveTextContent('none');
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('online-status')).toHaveTextContent('true');
  });

  it('should update loading state', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );
    });

    const setLoadingButton = screen.getByText('Set Loading');
    
    await act(async () => {
      setLoadingButton.click();
    });

    expect(screen.getByTestId('loading-search')).toHaveTextContent('true');
  });

  it('should update error state', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );
    });

    const setErrorButton = screen.getByText('Set Error');
    
    await act(async () => {
      setErrorButton.click();
    });

    expect(screen.getByTestId('error-network')).toHaveTextContent('Connection failed');
  });

  it('should add notifications', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      );
    });

    const addNotificationButton = screen.getByText('Add Notification');
    
    await act(async () => {
      addNotificationButton.click();
    });

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
  });

  it('should auto-remove notifications with duration', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <NotificationTestComponent />
        </UIProvider>
      );
    });

    const addButton = screen.getByText('Add Auto-Remove Notification');
    
    await act(async () => {
      addButton.click();
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    // Wait for auto-removal
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    }, { timeout: 200 });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUI must be used within a UIProvider');

    consoleSpy.mockRestore();
  });
});
import React, { useReducer, useCallback, useEffect } from 'react';
import { UIContext, uiReducer, initialState } from './UIContext';
import type { UIContextValue, UIState } from './UIContext';
import { storageService } from '../services/storage';
import type { UIPreferences } from '../services/storage';

// Provider component
interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, {
    ...initialState,
    preferences: storageService.getUIPreferences(),
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline: true } });
    const handleOffline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline: false } });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-remove notifications after duration
  useEffect(() => {
    const timers: Record<string, number> = {};

    state.notifications.forEach(notification => {
      if (notification.duration && !timers[notification.id]) {
        timers[notification.id] = setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id: notification.id } });
          delete timers[notification.id];
        }, notification.duration);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  // Action creators
  const setLoading = useCallback((key: keyof UIState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((key: keyof UIState['errors'], value?: string) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setModal = useCallback((key: keyof UIState['modals'], value: boolean) => {
    dispatch({ type: 'SET_MODAL', payload: { key, value } });
  }, []);

  const addNotification = useCallback((notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const setPreferences = useCallback((preferences: Partial<UIPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
  }, []);

  const setNetworkStatus = useCallback((isOnline: boolean) => {
    dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline } });
  }, []);

  const setLastSync = useCallback((timestamp: number) => {
    dispatch({ type: 'SET_LAST_SYNC', payload: { timestamp } });
  }, []);

  const addPendingOperation = useCallback((operation: Omit<UIState['cache']['pendingOperations'][0], 'id' | 'timestamp'>) => {
    const id = `operation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_PENDING_OPERATION', payload: operation });
    return id;
  }, []);

  const removePendingOperation = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PENDING_OPERATION', payload: { id } });
  }, []);

  const clearPendingOperations = useCallback(() => {
    dispatch({ type: 'CLEAR_PENDING_OPERATIONS' });
  }, []);

  const value: UIContextValue = {
    state,
    setLoading,
    setError,
    clearErrors,
    setModal,
    addNotification,
    removeNotification,
    clearNotifications,
    setPreferences,
    setNetworkStatus,
    setLastSync,
    addPendingOperation,
    removePendingOperation,
    clearPendingOperations,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
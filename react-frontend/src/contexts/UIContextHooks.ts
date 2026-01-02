import { useContext } from 'react';
import { UIContext, type UIContextValue } from './UIContext';

// Hook to use UI context
export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Convenience hooks for specific UI state
export const useLoading = () => {
  const { state, setLoading } = useUI();
  return { loading: state.loading, setLoading };
};

export const useErrors = () => {
  const { state, setError, clearErrors } = useUI();
  return { errors: state.errors, setError, clearErrors };
};

export const useModals = () => {
  const { state, setModal } = useUI();
  return { modals: state.modals, setModal };
};

export const useNotifications = () => {
  const { state, addNotification, removeNotification, clearNotifications } = useUI();
  return { 
    notifications: state.notifications, 
    addNotification, 
    removeNotification, 
    clearNotifications 
  };
};

export const useNetworkStatus = () => {
  const { state, setNetworkStatus } = useUI();
  return { networkStatus: state.networkStatus, setNetworkStatus };
};

export const usePreferences = () => {
  const { state, setPreferences } = useUI();
  return { preferences: state.preferences, setPreferences };
};
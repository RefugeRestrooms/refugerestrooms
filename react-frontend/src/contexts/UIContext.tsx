import { createContext } from 'react';
import { storageService } from '../services/storage';
import type { UIPreferences } from '../services/storage';

// UI State types
export interface UIState {
  loading: {
    search: boolean;
    submit: boolean;
    feedback: boolean;
    location: boolean;
  };
  errors: {
    network?: string;
    validation?: Record<string, string>;
    location?: string;
    general?: string;
  };
  modals: {
    feedback: boolean;
    confirmation: boolean;
    settings: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
    duration?: number;
  }>;
  preferences: UIPreferences;
  networkStatus: {
    isOnline: boolean;
    lastOnline?: number;
  };
  cache: {
    lastSync?: number;
    pendingOperations: Array<{
      id: string;
      type: 'create' | 'update' | 'feedback';
      data: Record<string, unknown>;
      timestamp: number;
    }>;
  };
}

// Action types
export type UIAction =
  | { type: 'SET_LOADING'; payload: { key: keyof UIState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof UIState['errors']; value?: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_MODAL'; payload: { key: keyof UIState['modals']; value: boolean } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<UIState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_PREFERENCES'; payload: Partial<UIPreferences> }
  | { type: 'SET_NETWORK_STATUS'; payload: { isOnline: boolean } }
  | { type: 'SET_LAST_SYNC'; payload: { timestamp: number } }
  | { type: 'ADD_PENDING_OPERATION'; payload: Omit<UIState['cache']['pendingOperations'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_PENDING_OPERATION'; payload: { id: string } }
  | { type: 'CLEAR_PENDING_OPERATIONS' };

// Initial state
export const initialState: UIState = {
  loading: {
    search: false,
    submit: false,
    feedback: false,
    location: false,
  },
  errors: {},
  modals: {
    feedback: false,
    confirmation: false,
    settings: false,
  },
  notifications: [],
  preferences: {},
  networkStatus: {
    isOnline: navigator.onLine,
  },
  cache: {
    pendingOperations: [],
  },
};

// Reducer
export const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'SET_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'ADD_NOTIFICATION': {
      const notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [...state.notifications, notification],
      };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_PREFERENCES': {
      const updatedPreferences = {
        ...state.preferences,
        ...action.payload,
      };
      // Persist to storage
      storageService.setUIPreferences(updatedPreferences);
      return {
        ...state,
        preferences: updatedPreferences,
      };
    }

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: {
          ...state.networkStatus,
          isOnline: action.payload.isOnline,
          lastOnline: action.payload.isOnline ? Date.now() : state.networkStatus.lastOnline,
        },
      };

    case 'SET_LAST_SYNC':
      return {
        ...state,
        cache: {
          ...state.cache,
          lastSync: action.payload.timestamp,
        },
      };

    case 'ADD_PENDING_OPERATION': {
      const operation = {
        ...action.payload,
        id: `operation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      return {
        ...state,
        cache: {
          ...state.cache,
          pendingOperations: [...state.cache.pendingOperations, operation],
        },
      };
    }

    case 'REMOVE_PENDING_OPERATION':
      return {
        ...state,
        cache: {
          ...state.cache,
          pendingOperations: state.cache.pendingOperations.filter(op => op.id !== action.payload.id),
        },
      };

    case 'CLEAR_PENDING_OPERATIONS':
      return {
        ...state,
        cache: {
          ...state.cache,
          pendingOperations: [],
        },
      };

    default:
      return state;
  }
};

// Context
export interface UIContextValue {
  state: UIState;
  setLoading: (key: keyof UIState['loading'], value: boolean) => void;
  setError: (key: keyof UIState['errors'], value?: string) => void;
  clearErrors: () => void;
  setModal: (key: keyof UIState['modals'], value: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setPreferences: (preferences: Partial<UIPreferences>) => void;
  setNetworkStatus: (isOnline: boolean) => void;
  setLastSync: (timestamp: number) => void;
  addPendingOperation: (operation: Omit<UIState['cache']['pendingOperations'][0], 'id' | 'timestamp'>) => string;
  removePendingOperation: (id: string) => void;
  clearPendingOperations: () => void;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);
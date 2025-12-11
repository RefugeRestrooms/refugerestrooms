import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/ui/Toast';

export interface UseToastReturn {
  toasts: ToastProps[];
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: hideToast
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, [hideToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts
  };
};
/**
 * Hook for managing navigation between restroom search results and detail views
 * Provides navigation state and handlers for restroom-related routing
 */

import { useState, useCallback } from 'react';
import type { Restroom } from '../types/generated';

export interface RestroomNavigationState {
  currentView: 'search' | 'detail' | 'edit';
  selectedRestroom: Restroom | null;
  searchContext: {
    query?: string;
    location?: { lat: number; lng: number };
    filters?: Record<string, unknown>;
  } | null;
}

export interface UseRestroomNavigationReturn {
  navigationState: RestroomNavigationState;
  navigateToDetail: (restroom: Restroom, searchContext?: Record<string, unknown>) => void;
  navigateToEdit: (restroom: Restroom) => void;
  navigateToSearch: () => void;
  goBack: () => void;
  canGoBack: boolean;
}

export const useRestroomNavigation = (
  initialView: 'search' | 'detail' = 'search'
): UseRestroomNavigationReturn => {
  const [navigationState, setNavigationState] = useState<RestroomNavigationState>({
    currentView: initialView,
    selectedRestroom: null,
    searchContext: null
  });

  const [navigationHistory, setNavigationHistory] = useState<RestroomNavigationState[]>([]);

  const navigateToDetail = useCallback((restroom: Restroom, searchContext?: Record<string, unknown>) => {
    setNavigationHistory(prev => [...prev, navigationState]);
    setNavigationState({
      currentView: 'detail',
      selectedRestroom: restroom,
      searchContext: searchContext || null
    });
  }, [navigationState]);

  const navigateToEdit = useCallback((restroom: Restroom) => {
    setNavigationHistory(prev => [...prev, navigationState]);
    setNavigationState({
      currentView: 'edit',
      selectedRestroom: restroom,
      searchContext: navigationState.searchContext
    });
  }, [navigationState]);

  const navigateToSearch = useCallback(() => {
    setNavigationHistory([]);
    setNavigationState({
      currentView: 'search',
      selectedRestroom: null,
      searchContext: null
    });
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setNavigationState(previousState);
    } else {
      navigateToSearch();
    }
  }, [navigationHistory, navigateToSearch]);

  const canGoBack = navigationHistory.length > 0;

  return {
    navigationState,
    navigateToDetail,
    navigateToEdit,
    navigateToSearch,
    goBack,
    canGoBack
  };
};
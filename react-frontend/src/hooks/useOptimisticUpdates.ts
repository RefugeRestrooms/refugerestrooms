import { useCallback } from 'react';
import { updateRestroomInCache } from '../services/apollo';
import { useUI } from '../contexts/UIContextHooks';
import { storageService } from '../services/storage';

/**
 * Hook for handling optimistic updates with fallback to offline storage
 */
export const useOptimisticUpdates = () => {
  const { state, addPendingOperation, removePendingOperation, addNotification } = useUI();

  // Optimistic feedback submission
  const submitFeedbackOptimistically = useCallback(async (
    restroomId: string,
    feedback: { positive: boolean; reasons: string[]; comment?: string }
  ) => {
    const operationId = addPendingOperation({
      type: 'feedback',
      data: { restroomId, feedback },
    });

    try {
      // Apply optimistic update to cache
      updateRestroomInCache(restroomId, {
        upvote: (current: number) => feedback.positive ? current + 1 : current,
        downvote: (current: number) => !feedback.positive ? current + 1 : current,
        totalFeedback: (current: number) => current + 1,
      });

      // If offline, store for later sync
      if (!state.networkStatus.isOnline) {
        storageService.saveFormDraft({
          id: `feedback-${restroomId}-${Date.now()}`,
          type: 'feedback',
          data: { restroomId, feedback },
        });

        addNotification({
          type: 'info',
          message: 'Feedback saved offline. Will sync when connection is restored.',
          duration: 5000,
        });

        return { success: true, offline: true };
      }

      // TODO: Execute actual mutation when GraphQL schema is available
      // const { data } = await submitFeedbackMutation({
      //   variables: { input: { restroomId, ...feedback } },
      // });

      removePendingOperation(operationId);
      
      addNotification({
        type: 'success',
        message: 'Feedback submitted successfully!',
        duration: 3000,
      });

      return { success: true, offline: false };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.';
      
      // Revert optimistic update on error
      updateRestroomInCache(restroomId, {
        upvote: (current: number) => feedback.positive ? current - 1 : current,
        downvote: (current: number) => !feedback.positive ? current - 1 : current,
        totalFeedback: (current: number) => current - 1,
      });

      removePendingOperation(operationId);

      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      });

      return { success: false, error: errorMessage };
    }
  }, [state.networkStatus.isOnline, addPendingOperation, removePendingOperation, addNotification]);

  // Optimistic restroom creation
  const createRestroomOptimistically = useCallback(async (restroomData: Record<string, unknown>) => {
    const tempId = `temp-${Date.now()}`;
    const operationId = addPendingOperation({
      type: 'create',
      data: { ...restroomData, id: tempId },
    });

    try {
      // If offline, store for later sync
      if (!state.networkStatus.isOnline) {
        storageService.saveFormDraft({
          id: `restroom-${tempId}`,
          type: 'restroom',
          data: restroomData,
        });

        addNotification({
          type: 'info',
          message: 'Restroom saved offline. Will sync when connection is restored.',
          duration: 5000,
        });

        return { success: true, offline: true, tempId };
      }

      // TODO: Execute actual mutation when GraphQL schema is available
      // const { data } = await createRestroomMutation({
      //   variables: { input: restroomData },
      //   optimisticResponse: {
      //     createRestroom: {
      //       __typename: 'Restroom',
      //       id: tempId,
      //       ...restroomData,
      //     },
      //   },
      // });

      removePendingOperation(operationId);

      addNotification({
        type: 'success',
        message: 'Restroom added successfully!',
        duration: 3000,
      });

      return { success: true, offline: false };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add restroom. Please try again.';
      
      removePendingOperation(operationId);

      addNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      });

      return { success: false, error: errorMessage };
    }
  }, [state.networkStatus.isOnline, addPendingOperation, removePendingOperation, addNotification]);

  // Sync pending operations when coming back online
  const syncPendingOperations = useCallback(async () => {
    if (!state.networkStatus.isOnline || state.cache.pendingOperations.length === 0) {
      return;
    }

    const operations = [...state.cache.pendingOperations];
    let successCount = 0;
    let errorCount = 0;

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'feedback':
            // TODO: Execute feedback mutation
            // await submitFeedbackMutation({
            //   variables: { input: operation.data },
            // });
            break;
          case 'create':
            // TODO: Execute create mutation
            // await createRestroomMutation({
            //   variables: { input: operation.data },
            // });
            break;
          case 'update':
            // TODO: Execute update mutation
            // await updateRestroomMutation({
            //   variables: { input: operation.data },
            // });
            break;
        }

        removePendingOperation(operation.id);
        successCount++;

      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      addNotification({
        type: 'success',
        message: `Synced ${successCount} offline operation${successCount > 1 ? 's' : ''}`,
        duration: 3000,
      });
    }

    if (errorCount > 0) {
      addNotification({
        type: 'warning',
        message: `Failed to sync ${errorCount} operation${errorCount > 1 ? 's' : ''}. Will retry later.`,
        duration: 5000,
      });
    }
  }, [state.networkStatus.isOnline, state.cache.pendingOperations, removePendingOperation, addNotification]);

  // Get offline data for display
  const getOfflineData = useCallback(() => {
    return {
      restrooms: storageService.getOfflineRestrooms(),
      drafts: storageService.getFormDrafts(),
      pendingOperations: state.cache.pendingOperations,
    };
  }, [state.cache.pendingOperations]);

  return {
    submitFeedbackOptimistically,
    createRestroomOptimistically,
    syncPendingOperations,
    getOfflineData,
    hasPendingOperations: state.cache.pendingOperations.length > 0,
    isOnline: state.networkStatus.isOnline,
  };
};
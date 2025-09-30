/**
 * Hook for managing sibling node lifecycle.
 * Handles fetching, animation, and auto-hide logic.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { SiblingAction } from '@/types/action';
import { actionsApi } from '@/api/actions';

interface UseSiblingLifecycleProps {
  projectId: string | null;
  selectedNodeId: string | null;
  autoHideDelay?: number; // ms, 0 = disabled
}

interface UseSiblingLifecycleReturn {
  actions: SiblingAction[];
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
  refreshActions: () => Promise<void>;
  hideActions: () => void;
  showActions: () => void;
}

/**
 * Manage sibling node lifecycle.
 */
export const useSiblingLifecycle = ({
  projectId,
  selectedNodeId,
  autoHideDelay = 10000, // 10 seconds default
}: UseSiblingLifecycleProps): UseSiblingLifecycleReturn => {
  const [actions, setActions] = useState<SiblingAction[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch actions for the selected node.
   */
  const fetchActions = useCallback(async () => {
    if (!projectId || !selectedNodeId) {
      setActions([]);
      setIsVisible(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const fetchedActions = await actionsApi.getActions(projectId, selectedNodeId);
      setActions(fetchedActions);
      setIsVisible(true);
      setError(null);

      // Start auto-hide timer
      if (autoHideDelay > 0) {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
        autoHideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch sibling actions:', err);
        setError(err.message || 'Failed to fetch actions');
        setActions([]);
        setIsVisible(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedNodeId, autoHideDelay]);

  /**
   * Manually hide actions.
   */
  const hideActions = useCallback(() => {
    setIsVisible(false);
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  /**
   * Manually show actions (resets auto-hide timer).
   */
  const showActions = useCallback(() => {
    if (actions.length > 0) {
      setIsVisible(true);

      // Restart auto-hide timer
      if (autoHideDelay > 0) {
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
        autoHideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
      }
    }
  }, [actions, autoHideDelay]);

  /**
   * Refresh actions (useful after action execution).
   */
  const refreshActions = useCallback(async () => {
    await fetchActions();
  }, [fetchActions]);

  /**
   * Fetch actions when selection changes.
   */
  useEffect(() => {
    fetchActions();

    // Cleanup on unmount or selection change
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchActions]);

  /**
   * Hide actions when node is deselected.
   */
  useEffect(() => {
    if (!selectedNodeId) {
      hideActions();
      setActions([]);
    }
  }, [selectedNodeId, hideActions]);

  return {
    actions,
    isVisible,
    isLoading,
    error,
    refreshActions,
    hideActions,
    showActions,
  };
};

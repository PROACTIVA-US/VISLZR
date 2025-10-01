/**
 * Hook for managing dependency focus mode.
 */
import { useState, useEffect, useCallback } from 'react';
import type { NodeData, EdgeData } from '@vislzr/shared';
import type { DependencyGraph } from '@/utils/dependencyAnalysis';
import { analyzeDependencies } from '@/utils/dependencyAnalysis';

interface UseDependencyFocusProps {
  selectedNodeId: string | null;
  nodes: NodeData[];
  edges: EdgeData[];
}

interface UseDependencyFocusReturn {
  isFocusMode: boolean;
  dependencyGraph: DependencyGraph | null;
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  toggleFocusMode: () => void;
}

/**
 * Manage dependency focus mode state.
 */
export const useDependencyFocus = ({
  selectedNodeId,
  nodes,
  edges,
}: UseDependencyFocusProps): UseDependencyFocusReturn => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph | null>(null);

  /**
   * Enter focus mode.
   */
  const enterFocusMode = useCallback(() => {
    if (!selectedNodeId) return;

    try {
      const graph = analyzeDependencies(selectedNodeId, nodes, edges);
      setDependencyGraph(graph);
      setIsFocusMode(true);
    } catch (err) {
      console.error('Failed to analyze dependencies:', err);
    }
  }, [selectedNodeId, nodes, edges]);

  /**
   * Exit focus mode.
   */
  const exitFocusMode = useCallback(() => {
    setIsFocusMode(false);
    setDependencyGraph(null);
  }, []);

  /**
   * Toggle focus mode.
   */
  const toggleFocusMode = useCallback(() => {
    if (isFocusMode) {
      exitFocusMode();
    } else {
      enterFocusMode();
    }
  }, [isFocusMode, enterFocusMode, exitFocusMode]);

  /**
   * Exit focus mode when node is deselected.
   */
  useEffect(() => {
    if (!selectedNodeId && isFocusMode) {
      exitFocusMode();
    }
  }, [selectedNodeId, isFocusMode, exitFocusMode]);

  /**
   * Handle Escape key to exit focus mode.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        exitFocusMode();
      }
    };

    if (isFocusMode) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocusMode, exitFocusMode]);

  return {
    isFocusMode,
    dependencyGraph,
    enterFocusMode,
    exitFocusMode,
    toggleFocusMode,
  };
};

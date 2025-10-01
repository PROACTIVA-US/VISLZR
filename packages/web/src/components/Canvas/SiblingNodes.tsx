/**
 * Sibling nodes visualization component.
 * Phase 1.3-1.4 Implementation - Uses D3.js renderer
 * Renders context-aware action buttons around a selected node.
 */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SiblingAction } from '@vislzr/shared';
import type { NodeData } from '@vislzr/shared';
import { SiblingNodeRenderer } from '../../lib/SiblingNodeRenderer';

export interface SiblingNodesProps {
  selectedNode: NodeData | null;
  actions: SiblingAction[];
  graphNodes: Array<{ id: string; x: number; y: number; radius: number }>;
  svgRef: React.RefObject<SVGSVGElement>;
  onActionClick: (action: SiblingAction) => void;
}

/**
 * React component for rendering sibling nodes
 * Wraps D3 rendering logic in React lifecycle
 */
export const SiblingNodes: React.FC<SiblingNodesProps> = ({
  selectedNode,
  actions,
  graphNodes,
  svgRef,
  onActionClick,
}) => {
  const rendererRef = useRef<SiblingNodeRenderer>(new SiblingNodeRenderer());

  useEffect(() => {
    const renderer = rendererRef.current;

    if (!selectedNode || !svgRef.current || actions.length === 0) {
      // Clear siblings if no node selected
      renderer.clear();
      return;
    }

    const svg = d3.select(svgRef.current);

    // Render siblings
    renderer.render({
      svg,
      parentNode: {
        x: selectedNode.x || 0,
        y: selectedNode.y || 0,
        radius: 20, // Default node radius
      },
      actions,
      graphNodes,
      onActionClick,
    });

    // Cleanup on unmount or when deps change
    return () => {
      renderer.clear();
    };
  }, [selectedNode, actions, graphNodes, svgRef, onActionClick]);

  return null; // Renders via D3, no React DOM
};

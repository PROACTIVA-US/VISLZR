/**
 * Sibling nodes visualization component.
 * Renders context-aware action buttons around a selected node.
 */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { NodeData } from '@/types/graph';
import type { SiblingAction, SiblingNodeLayout } from '@/types/action';
import {
  calculateSiblingPositions,
  animateSiblingsInStaggered,
  animateSiblingsOutStaggered,
  highlightSibling,
} from '@/utils/siblingAnimations';

interface SiblingNodesProps {
  parentNode: NodeData;
  actions: SiblingAction[];
  onActionClick: (action: SiblingAction) => void;
  layout?: SiblingNodeLayout['type'];
  visible?: boolean;
}

export const SiblingNodes: React.FC<SiblingNodesProps> = ({
  parentNode,
  actions,
  onActionClick,
  layout = 'arc',
  visible = true,
}) => {
  const groupRef = useRef<SVGGElement>(null);
  const siblingsRef = useRef<SVGGElement[]>([]);

  // Calculate sibling positions
  const positions = calculateSiblingPositions(
    { x: parentNode.x || 0, y: parentNode.y || 0, radius: 25 + parentNode.priority * 5 },
    actions.map((action) => ({
      id: `sibling-${action.id}`,
      parentNodeId: parentNode.id,
      action,
      x: 0,
      y: 0,
    })),
    layout
  );

  // Render siblings with D3
  useEffect(() => {
    if (!groupRef.current || actions.length === 0) return;

    const svg = d3.select(groupRef.current);
    siblingsRef.current = [];

    // Bind data
    const siblings = svg
      .selectAll<SVGGElement, SiblingAction>('g.sibling-node')
      .data(actions, (d) => d.id);

    // Remove old siblings
    const exitSiblings = siblings.exit();
    const exitElements = exitSiblings.nodes().map((node) => d3.select(node));
    animateSiblingsOutStaggered(exitElements).then(() => {
      exitSiblings.remove();
    });

    // Add new siblings
    const enterSiblings = siblings
      .enter()
      .append('g')
      .attr('class', 'sibling-node')
      .attr('cursor', 'pointer')
      .attr('transform', (d, i) => `translate(${positions[i].x}, ${positions[i].y})`);

    // Background rect (pill shape)
    enterSiblings
      .append('rect')
      .attr('class', 'sibling-bg')
      .attr('x', -40)
      .attr('y', -15)
      .attr('width', 80)
      .attr('height', 30)
      .attr('rx', 15)
      .attr('ry', 15)
      .attr('fill', (d) => getSiblingColor(d))
      .attr('stroke', (d) => getSiblingBorderColor(d))
      .attr('stroke-width', 2);

    // Icon (emoji or symbol)
    enterSiblings
      .append('text')
      .attr('class', 'sibling-icon')
      .attr('x', -25)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .text((d) => d.icon);

    // Label text
    enterSiblings
      .append('text')
      .attr('class', 'sibling-label')
      .attr('x', 0)
      .attr('y', 5)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', '500')
      .text((d) => truncateLabel(d.label, 10));

    // AI badge (if AI-powered)
    enterSiblings
      .filter((d) => d.ai_powered)
      .append('circle')
      .attr('class', 'ai-badge')
      .attr('cx', 35)
      .attr('cy', -10)
      .attr('r', 5)
      .attr('fill', '#8b5cf6')
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    // Update existing siblings
    const allSiblings = enterSiblings.merge(siblings);

    // Store references
    siblingsRef.current = allSiblings.nodes();

    // Add interactions
    allSiblings
      .on('click', function (event, d) {
        event.stopPropagation();
        onActionClick(d);
      })
      .on('mouseenter', function () {
        highlightSibling(d3.select(this), true);
      })
      .on('mouseleave', function () {
        highlightSibling(d3.select(this), false);
      });

    // Animate in new siblings
    if (visible) {
      const enterElements = enterSiblings.nodes().map((node) => d3.select(node));
      animateSiblingsInStaggered(enterElements);
    }
  }, [actions, positions, onActionClick, visible, layout]);

  // Handle visibility changes
  useEffect(() => {
    if (!groupRef.current) return;

    const svg = d3.select(groupRef.current);
    const siblings = svg.selectAll<SVGGElement, SiblingAction>('g.sibling-node');

    if (visible) {
      const elements = siblings.nodes().map((node) => d3.select(node));
      animateSiblingsInStaggered(elements);
    } else {
      const elements = siblings.nodes().map((node) => d3.select(node));
      animateSiblingsOutStaggered(elements).then(() => {
        siblings.remove();
      });
    }
  }, [visible]);

  return <g ref={groupRef} className="sibling-nodes-container" />;
};

/**
 * Get sibling background color based on category.
 */
const getSiblingColor = (action: SiblingAction): string => {
  switch (action.category) {
    case 'foundational':
      return '#3b82f6'; // Blue
    case 'ai':
      return '#8b5cf6'; // Purple
    case 'grouped':
      return '#6b7280'; // Gray
    default:
      return '#3b82f6';
  }
};

/**
 * Get sibling border color based on category.
 */
const getSiblingBorderColor = (action: SiblingAction): string => {
  switch (action.category) {
    case 'foundational':
      return '#60a5fa'; // Light blue
    case 'ai':
      return '#a78bfa'; // Light purple
    case 'grouped':
      return '#9ca3af'; // Light gray
    default:
      return '#60a5fa';
  }
};

/**
 * Truncate label to max length.
 */
const truncateLabel = (label: string, maxLength: number): string => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 1) + '…';
};

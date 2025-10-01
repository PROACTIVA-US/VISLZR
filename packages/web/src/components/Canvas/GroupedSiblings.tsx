/**
 * Grouped sibling nodes component.
 * Handles expandable/collapsible sibling groups.
 */
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { NodeData, SiblingAction } from '@vislzr/shared';
import { actionsApi } from '@/api/actions';
import {
  animateGroupExpansion,
  animateGroupCollapse,
  highlightSibling,
} from '@/utils/siblingAnimations';

interface GroupedSiblingsProps {
  groupAction: SiblingAction;
  parentNode: NodeData;
  projectId: string;
  position: { x: number; y: number };
  onSubActionClick: (action: SiblingAction) => void;
  onExpand?: (groupId: string) => void;
  onCollapse?: (groupId: string) => void;
}

export const GroupedSiblings: React.FC<GroupedSiblingsProps> = ({
  groupAction,
  parentNode,
  projectId,
  position,
  onSubActionClick,
  onExpand,
  onCollapse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subActions, setSubActions] = useState<SiblingAction[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  const groupRef = useRef<SVGGElement>(null);
  const subSiblingsRef = useRef<SVGGElement[]>([]);

  /**
   * Toggle group expansion.
   */
  const handleGroupClick = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isExpanded) {
      // Expand: fetch sub-actions
      setIsLoading(true);
      try {
        const actions = await actionsApi.expandGroup(
          projectId,
          parentNode.id,
          groupAction.id
        );
        setSubActions(actions);
        setIsExpanded(true);
        onExpand?.(groupAction.id);
      } catch (err) {
        console.error('Failed to expand group:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Collapse
      setIsExpanded(false);
      onCollapse?.(groupAction.id);
    }
  };

  /**
   * Render group button.
   */
  useEffect(() => {
    if (!groupRef.current) return;

    const groupElement = d3.select(groupRef.current).select('g.group-button');

    if (groupElement.empty()) {
      const group = d3
        .select(groupRef.current)
        .append('g')
        .attr('class', 'group-button')
        .attr('cursor', 'pointer')
        .attr('transform', `translate(${position.x}, ${position.y})`);

      // Background
      group
        .append('rect')
        .attr('class', 'group-bg')
        .attr('x', -40)
        .attr('y', -15)
        .attr('width', 80)
        .attr('height', 30)
        .attr('rx', 15)
        .attr('ry', 15)
        .attr('fill', '#6b7280')
        .attr('stroke', '#9ca3af')
        .attr('stroke-width', 2);

      // Icon
      group
        .append('text')
        .attr('class', 'group-icon')
        .attr('x', -25)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .text(groupAction.icon);

      // Label
      group
        .append('text')
        .attr('class', 'group-label')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .attr('font-weight', '500')
        .text(truncateLabel(groupAction.label, 10));

      // Expansion indicator (chevron)
      group
        .append('text')
        .attr('class', 'group-chevron')
        .attr('x', 35)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('›');

      // Interactions
      group
        .on('mouseenter', function () {
          highlightSibling(d3.select(this), true);
        })
        .on('mouseleave', function () {
          highlightSibling(d3.select(this), false);
        });
    }

    // Update chevron rotation
    const chevron = groupElement.select('.group-chevron');
    chevron
      .transition()
      .duration(200)
      .attr('transform', isExpanded ? 'rotate(90)' : 'rotate(0)')
      .attr('transform-origin', '35 5');
  }, [position, groupAction, isExpanded]);

  /**
   * Render sub-siblings when expanded.
   */
  useEffect(() => {
    if (!groupRef.current) return;

    const svg = d3.select(groupRef.current);

    if (isExpanded && subActions.length > 0) {
      // Calculate positions for sub-siblings (stack below group)
      const subPositions = subActions.map((_, index) => ({
        x: position.x,
        y: position.y + 40 + index * 35,
      }));

      // Bind data
      const subSiblings = svg
        .selectAll<SVGGElement, SiblingAction>('g.sub-sibling')
        .data(subActions, (d) => d.id);

      // Remove old
      subSiblings.exit().remove();

      // Add new
      const enterSiblings = subSiblings
        .enter()
        .append('g')
        .attr('class', 'sub-sibling')
        .attr('cursor', 'pointer')
        .attr('transform', (_d, i) => `translate(${subPositions[i].x}, ${subPositions[i].y})`);

      // Background
      enterSiblings
        .append('rect')
        .attr('x', -35)
        .attr('y', -12)
        .attr('width', 70)
        .attr('height', 24)
        .attr('rx', 12)
        .attr('ry', 12)
        .attr('fill', (d) => (d.category === 'ai-analysis' || d.category === 'ai-generative' ? '#8b5cf6' : '#3b82f6'))
        .attr('stroke', (d) => (d.category === 'ai-analysis' || d.category === 'ai-generative' ? '#a78bfa' : '#60a5fa'))
        .attr('stroke-width', 2);

      // Icon
      enterSiblings
        .append('text')
        .attr('x', -20)
        .attr('y', 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text((d) => d.icon);

      // Label
      enterSiblings
        .append('text')
        .attr('x', -5)
        .attr('y', 4)
        .attr('text-anchor', 'start')
        .attr('font-size', '10px')
        .attr('fill', 'white')
        .text((d) => truncateLabel(d.label, 8));

      // Merge and add interactions
      const allSubSiblings = enterSiblings.merge(subSiblings);

      allSubSiblings
        .on('click', function (event, d) {
          event.stopPropagation();
          onSubActionClick(d);
        })
        .on('mouseenter', function () {
          highlightSibling(d3.select(this), true);
        })
        .on('mouseleave', function () {
          highlightSibling(d3.select(this), false);
        });

      // Store references
      subSiblingsRef.current = allSubSiblings.nodes();

      // Animate expansion
      const groupElement = svg.select('g.group-button');
      const subElements = allSubSiblings.nodes().map((node) => d3.select(node));
      animateGroupExpansion(groupElement, subElements);
    } else {
      // Collapse: remove sub-siblings
      const subSiblings = svg.selectAll<SVGGElement, SiblingAction>('g.sub-sibling');
      if (!subSiblings.empty()) {
        const subElements = subSiblings.nodes().map((node) => d3.select(node));
        animateGroupCollapse(subElements).then(() => {
          subSiblings.remove();
        });
      }
    }
  }, [isExpanded, subActions, position, onSubActionClick]);

  return (
    <g
      ref={groupRef}
      className="grouped-siblings-container"
      onClick={handleGroupClick}
    />
  );
};

/**
 * Truncate label to max length.
 */
const truncateLabel = (label: string, maxLength: number): string => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 1) + '…';
};

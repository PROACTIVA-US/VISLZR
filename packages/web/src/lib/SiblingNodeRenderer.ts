import * as d3 from 'd3';
import type { SiblingAction, SiblingNodeInstance } from '@vislzr/shared/types/actions';
import { calculateSiblingPositions, resolveCollisions } from '../utils/siblingPositioning';
import { appearAnimation, fadeAnimation, hoverAnimation } from '../utils/siblingAnimations';
import { VISUAL, SIBLING_COLORS, Z_INDEX, ANIMATION_TIMING } from './constants';

export interface RenderOptions {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  parentNode: { x: number; y: number; radius: number };
  actions: SiblingAction[];
  graphNodes: Array<{ x: number; y: number; radius: number }>;
  onActionClick: (action: SiblingAction) => void;
}

// Extended instance type for internal use
interface SiblingNodeInstanceWithAction extends SiblingNodeInstance {
  action: SiblingAction;
}

/**
 * D3.js renderer for sibling nodes
 * Handles positioning, rendering, and animations
 */

export class SiblingNodeRenderer {
  private siblingGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private instances: SiblingNodeInstanceWithAction[] = [];

  /**
   * Render sibling nodes around a parent
   */
  render(options: RenderOptions): void {
    const { svg, parentNode, actions, graphNodes, onActionClick } = options;

    // Remove existing siblings
    this.clear();

    // Create sibling group
    this.siblingGroup = svg
      .append('g')
      .attr('class', 'sibling-nodes')
      .style('pointer-events', 'all')
      .attr('data-z-index', Z_INDEX.SIBLING_NODES.toString());

    // Calculate positions
    const positions = calculateSiblingPositions({
      parentX: parentNode.x,
      parentY: parentNode.y,
      parentRadius: parentNode.radius,
      actionCount: actions.length,
    });

    // Resolve collisions
    const adjustedPositions = resolveCollisions(positions, graphNodes);

    // Create instances
    this.instances = actions.map((action, index) => ({
      id: `sibling-${action.id}-${index}`,
      actionId: action.id,
      label: action.label,
      icon: action.icon,
      position: adjustedPositions[index],
      color: action.color || SIBLING_COLORS[action.category],
      isGroupParent: action.isGroupParent,
      isExpanded: false,
      action, // Store full action for reference
    }));

    // Render each sibling
    this.instances.forEach((instance, index) => {
      this.renderSibling(instance, index, onActionClick);
    });
  }

  /**
   * Render a single sibling node
   */
  private renderSibling(
    instance: SiblingNodeInstanceWithAction,
    index: number,
    onActionClick: (action: SiblingAction) => void
  ): void {
    if (!this.siblingGroup) return;

    const group = this.siblingGroup
      .append('g')
      .attr('class', 'sibling')
      .attr('data-action', instance.action.id)
      .attr('transform', `translate(${instance.position.x}, ${instance.position.y})`);

    // Background circle
    const circle = group
      .append('circle')
      .attr('r', VISUAL.SIBLING_RADIUS)
      .attr('fill', instance.color)
      .attr('stroke', VISUAL.STROKE_COLOR)
      .attr('stroke-width', VISUAL.STROKE_WIDTH)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // Icon/text
    group
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#FFFFFF')
      .attr('font-size', VISUAL.ICON_FONT_SIZE + 'px')
      .text(instance.icon)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Appear animation with stagger
    appearAnimation(group, { delay: index * VISUAL.ANIMATION_STAGGER });

    // Hover interactions
    group
      .on('mouseenter', () => {
        hoverAnimation(group, true);
        circle.attr('fill', this.lightenColor(instance.color));
      })
      .on('mouseleave', () => {
        hoverAnimation(group, false);
        circle.attr('fill', instance.color);
      })
      .on('click', (event) => {
        event.stopPropagation();
        this.clickAnimation(group);
        onActionClick(instance.action);
      });

    // Tooltip
    group.append('title').text(instance.label);
  }

  /**
   * Click animation: quick pulse
   */
  private clickAnimation(selection: d3.Selection<SVGGElement, unknown, null, undefined>): void {
    // Get current transform
    const currentTransform = selection.attr('transform');
    const match = currentTransform?.match(/translate\(([^)]+)\)/);
    const translatePart = match ? match[0] : 'translate(0, 0)';

    selection
      .transition()
      .duration(ANIMATION_TIMING.CLICK_DURATION)
      .ease(d3.easeQuadInOut)
      .attr('transform', `${translatePart} scale(0.9)`)
      .transition()
      .duration(ANIMATION_TIMING.CLICK_DURATION)
      .attr('transform', `${translatePart} scale(1)`);
  }

  /**
   * Clear all sibling nodes
   */
  clear(): void {
    if (this.siblingGroup) {
      // Fade out animation
      fadeAnimation(this.siblingGroup as any).then(() => {
        this.siblingGroup?.remove();
        this.siblingGroup = null;
      });
    }
    this.instances = [];
  }

  /**
   * Get all rendered instances
   */
  getInstances(): SiblingNodeInstance[] {
    return this.instances;
  }

  /**
   * Lighten color for hover effect
   */
  private lightenColor(color: string): string {
    // Simple lighten by increasing RGB values
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + 40);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + 40);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

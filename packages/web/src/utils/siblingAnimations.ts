/**
 * Animation utilities for sibling nodes.
 * Phase 1.3-1.4 Implementation - Spec-compliant animations
 * Uses D3.js for smooth 60fps transitions.
 */
import * as d3 from 'd3';
import type { SiblingNodeInstance } from '@vislzr/shared';
import { ANIMATION_TIMING } from '../lib/constants';

/**
 * Animation configuration interface
 */
export interface SiblingAnimationConfig {
  duration?: number;
  delay?: number;
  stagger?: number;
  easing?: 'cubic-out' | 'cubic-in' | 'linear';
}

/**
 * Default animation configuration (per spec Section 5.3)
 */
export const DEFAULT_ANIMATION_CONFIG: SiblingAnimationConfig = {
  duration: ANIMATION_TIMING.APPEAR_DURATION,
  delay: 0,
  stagger: 50,
  easing: 'cubic-out',
};

/**
 * Appear animation - fade in + scale (300ms)
 * Spec Section 5.4 - Smooth entrance from parent node position
 *
 * @param element - SVG element or D3 selection
 * @param config - Animation configuration
 */
export const appearAnimation = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined> | string,
  config: Partial<SiblingAnimationConfig> = {}
): void => {
  const { duration = ANIMATION_TIMING.APPEAR_DURATION, delay = 0 } = config;

  const selection = typeof element === 'string'
    ? d3.select(element)
    : element instanceof SVGElement
    ? d3.select(element)
    : element;

  // Get final position from transform attribute
  const finalTransform = selection.attr('transform');

  // Parse position from transform
  const match = finalTransform?.match(/translate\(([^,]+),\s*([^)]+)\)/);
  const finalX = match ? parseFloat(match[1]) : 0;
  const finalY = match ? parseFloat(match[2]) : 0;

  // Start slightly inward (90% of final position)
  const startX = finalX * 0.9;
  const startY = finalY * 0.9;

  selection
    .style('opacity', 0)
    .attr('transform', `translate(${startX}, ${startY}) scale(0.8)`)
    .transition()
    .delay(delay)
    .duration(duration)
    .ease(d3.easeCubicOut)
    .style('opacity', 1)
    .attr('transform', `translate(${finalX}, ${finalY}) scale(1)`);
};

/**
 * Fade animation - fade out (200ms)
 * Spec Section 5.4 - Smooth exit with slight inward movement
 *
 * @param element - SVG element or D3 selection
 * @param config - Animation configuration
 * @returns Promise that resolves when animation completes
 */
export const fadeAnimation = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  config: Partial<SiblingAnimationConfig> = {}
): Promise<void> => {
  const { duration = ANIMATION_TIMING.FADE_DURATION } = config;

  const selection = element instanceof SVGElement ? d3.select(element) : element;

  // Get current position
  const currentTransform = selection.attr('transform');
  const match = currentTransform?.match(/translate\(([^,]+),\s*([^)]+)\)/);
  const currentX = match ? parseFloat(match[1]) : 0;
  const currentY = match ? parseFloat(match[2]) : 0;

  // Move slightly inward (95% of current position)
  const endX = currentX * 0.95;
  const endY = currentY * 0.95;

  return new Promise((resolve) => {
    selection
      .transition()
      .duration(duration)
      .ease(d3.easeCubicIn)
      .style('opacity', 0)
      .attr('transform', `translate(${endX}, ${endY}) scale(0.9)`)
      .on('end', () => resolve());
  });
};

/**
 * Calculate stagger delays for multiple siblings.
 */
export const calculateStaggerDelays = (
  count: number,
  baseDelay: number = 0,
  stagger: number = DEFAULT_ANIMATION_CONFIG.stagger ?? 50
): number[] => {
  return Array.from({ length: count }, (_, i) => baseDelay + i * stagger);
};

/**
 * Animate siblings in with stagger effect.
 * Uses appearAnimation for smooth entrance.
 *
 * @param elements - Array of SVG elements or D3 selections
 * @param config - Animation configuration
 */
export const animateSiblingsInStaggered = (
  elements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): void => {
  const { stagger = 50 } = config;
  const delays = calculateStaggerDelays(elements.length, config.delay || 0, stagger);

  elements.forEach((element, index) => {
    appearAnimation(element, { ...config, delay: delays[index] });
  });
};

/**
 * Animate siblings out with stagger effect.
 * Uses fadeAnimation for smooth exit.
 *
 * @param elements - Array of SVG elements or D3 selections
 * @param config - Animation configuration
 * @returns Promise that resolves when all animations complete
 */
export const animateSiblingsOutStaggered = async (
  elements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): Promise<void> => {
  const { stagger = 25 } = config; // Faster stagger for exit
  const delays = calculateStaggerDelays(elements.length, 0, stagger);

  const promises = elements.map((element, index) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        fadeAnimation(element, config).then(resolve);
      }, delays[index]);
    });
  });

  await Promise.all(promises);
};

/**
 * Animate group expansion.
 */
export const animateGroupExpansion = (
  groupElement: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  subElements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): void => {
  const { duration = 300 } = { ...DEFAULT_ANIMATION_CONFIG, ...config };

  // Rotate group element slightly
  const groupSelection =
    groupElement instanceof SVGElement ? d3.select(groupElement) : groupElement;

  groupSelection
    .transition()
    .duration(duration / 2)
    .attr('transform', (d: any) => `translate(${d.x},${d.y}) rotate(90)`)
    .transition()
    .duration(duration / 2)
    .attr('transform', (d: any) => `translate(${d.x},${d.y}) rotate(0)`);

  // Stagger in sub-siblings
  animateSiblingsInStaggered(subElements, config);
};

/**
 * Animate group collapse.
 */
export const animateGroupCollapse = async (
  subElements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): Promise<void> => {
  await animateSiblingsOutStaggered(subElements, {
    ...config,
    duration: (config.duration || DEFAULT_ANIMATION_CONFIG.duration || 300) / 2,
  });
};

/**
 * Calculate arc position for a sibling around a parent node.
 */
export const calculateArcPosition = (
  parentX: number,
  parentY: number,
  parentRadius: number,
  index: number,
  totalSiblings: number,
  arcRadius: number = 120
): { x: number; y: number; angle: number } => {
  const angleRange = Math.PI; // 180 degrees
  const startAngle = -angleRange / 2;
  const angleStep = totalSiblings > 1 ? angleRange / (totalSiblings - 1) : 0;
  const angle = startAngle + index * angleStep;

  const x = parentX + Math.cos(angle) * (parentRadius + arcRadius);
  const y = parentY + Math.sin(angle) * (parentRadius + arcRadius);

  return { x, y, angle };
};

/**
 * Calculate stack position for a sibling.
 */
export const calculateStackPosition = (
  parentX: number,
  parentY: number,
  parentRadius: number,
  index: number,
  totalSiblings: number,
  direction: 'vertical' | 'horizontal' = 'vertical',
  spacing: number = 40
): { x: number; y: number } => {
  const offset = (index - (totalSiblings - 1) / 2) * spacing;

  if (direction === 'vertical') {
    return {
      x: parentX + parentRadius + 80,
      y: parentY + offset,
    };
  } else {
    return {
      x: parentX + offset,
      y: parentY + parentRadius + 60,
    };
  }
};

/**
 * Calculate positions for all siblings using specified layout.
 */
export const calculateSiblingPositions = (
  parentNode: { x: number; y: number; radius?: number },
  siblings: SiblingNodeInstance[],
  layout: 'arc' | 'stack' = 'arc',
  options: {
    arcRadius?: number;
    stackDirection?: 'vertical' | 'horizontal';
    stackSpacing?: number;
  } = {}
): Array<{ x: number; y: number; angle?: number }> => {
  const parentRadius = parentNode.radius || 30;
  const { arcRadius = 120, stackDirection = 'vertical', stackSpacing = 40 } = options;

  return siblings.map((_, index) => {
    if (layout === 'arc') {
      return calculateArcPosition(
        parentNode.x,
        parentNode.y,
        parentRadius,
        index,
        siblings.length,
        arcRadius
      );
    } else {
      return calculateStackPosition(
        parentNode.x,
        parentNode.y,
        parentRadius,
        index,
        siblings.length,
        stackDirection,
        stackSpacing
      );
    }
  });
};

/**
 * Pulse animation for important siblings (e.g., AI actions).
 */
export const pulseSibling = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  config: { scale?: number; duration?: number } = {}
): void => {
  const { scale = 1.1, duration = 1000 } = config;

  const selection = element instanceof SVGElement ? d3.select(element) : element;

  const pulse = () => {
    selection
      .transition()
      .duration(duration / 2)
      .attr('transform', `scale(${scale})`)
      .transition()
      .duration(duration / 2)
      .attr('transform', 'scale(1)')
      .on('end', pulse);
  };

  pulse();
};

/**
 * Hover animation - scale up slightly
 * Spec Section 5.4 - 150ms hover effect
 *
 * @param element - SVG element or D3 selection
 * @param highlight - True to highlight, false to unhighlight
 */
export const hoverAnimation = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  highlight: boolean
): void => {
  const selection = element instanceof SVGElement ? d3.select(element) : element;

  // Get current transform (preserve translate)
  const currentTransform = selection.attr('transform');
  const match = currentTransform?.match(/translate\(([^)]+)\)/);
  const translatePart = match ? match[0] : 'translate(0, 0)';

  const scale = highlight ? 1.15 : 1.0;
  const filter = highlight ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'none';

  selection
    .transition()
    .duration(ANIMATION_TIMING.HOVER_DURATION)
    .attr('transform', `${translatePart} scale(${scale})`)
    .style('filter', filter);
};

// Legacy alias for backward compatibility
export const highlightSibling = hoverAnimation;

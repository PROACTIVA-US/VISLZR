/**
 * Animation utilities for sibling nodes.
 * Uses D3.js for smooth transitions.
 */
import * as d3 from 'd3';
import type { SiblingNodeData, SiblingAnimationConfig } from '@/types/action';

/**
 * Default animation configuration.
 */
export const DEFAULT_ANIMATION_CONFIG: SiblingAnimationConfig = {
  duration: 300,
  delay: 0,
  stagger: 50,
  easing: 'cubic-out',
};

/**
 * Animate a sibling node in (fade in).
 */
export const animateSiblingIn = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  config: Partial<SiblingAnimationConfig> = {}
): void => {
  const { duration, delay } = { ...DEFAULT_ANIMATION_CONFIG, ...config };

  const selection = element instanceof SVGElement ? d3.select(element) : element;

  selection
    .attr('opacity', 0)
    .transition()
    .delay(delay)
    .duration(duration)
    .attr('opacity', 1)
    .ease(d3.easeCubicOut);
};

/**
 * Animate a sibling node out (fade out).
 */
export const animateSiblingOut = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  config: Partial<SiblingAnimationConfig> = {}
): Promise<void> => {
  const { duration } = { ...DEFAULT_ANIMATION_CONFIG, ...config };

  const selection = element instanceof SVGElement ? d3.select(element) : element;

  return new Promise((resolve) => {
    selection
      .transition()
      .duration(duration)
      .attr('opacity', 0)
      .ease(d3.easeCubicIn)
      .on('end', () => resolve());
  });
};

/**
 * Calculate stagger delays for multiple siblings.
 */
export const calculateStaggerDelays = (
  count: number,
  baseDelay: number = 0,
  stagger: number = DEFAULT_ANIMATION_CONFIG.stagger
): number[] => {
  return Array.from({ length: count }, (_, i) => baseDelay + i * stagger);
};

/**
 * Animate siblings in with stagger effect.
 */
export const animateSiblingsInStaggered = (
  elements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): void => {
  const { stagger } = { ...DEFAULT_ANIMATION_CONFIG, ...config };
  const delays = calculateStaggerDelays(elements.length, config.delay || 0, stagger);

  elements.forEach((element, index) => {
    animateSiblingIn(element, { ...config, delay: delays[index] });
  });
};

/**
 * Animate siblings out with stagger effect.
 */
export const animateSiblingsOutStaggered = async (
  elements: (SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>)[],
  config: Partial<SiblingAnimationConfig> = {}
): Promise<void> => {
  const { stagger, duration } = { ...DEFAULT_ANIMATION_CONFIG, ...config };
  const delays = calculateStaggerDelays(elements.length, 0, stagger / 2);

  const promises = elements.map((element, index) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        animateSiblingOut(element, { ...config, duration }).then(resolve);
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
  const { duration } = { ...DEFAULT_ANIMATION_CONFIG, ...config };

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
    duration: (config.duration || DEFAULT_ANIMATION_CONFIG.duration) / 2,
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
  siblings: SiblingNodeData[],
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
 * Highlight sibling on hover.
 */
export const highlightSibling = (
  element: SVGElement | d3.Selection<SVGGElement, unknown, null, undefined>,
  highlight: boolean
): void => {
  const selection = element instanceof SVGElement ? d3.select(element) : element;

  if (highlight) {
    selection
      .transition()
      .duration(150)
      .attr('transform', 'scale(1.1)')
      .style('filter', 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))');
  } else {
    selection
      .transition()
      .duration(150)
      .attr('transform', 'scale(1)')
      .style('filter', 'none');
  }
};

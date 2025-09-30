// Sibling Node Constants
// Phase 1.1 - Foundation (Visual Constants & Timing)

import type { ActionCategory } from '@vislzr/shared/types/actions';

/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION_TIMING = {
  /** Duration for sibling appearance animation */
  APPEAR_DURATION: 300,
  /** Duration for sibling disappearance animation */
  FADE_DURATION: 200,
  /** Duration for hover scale animation */
  HOVER_DURATION: 150,
  /** Duration for click animation */
  CLICK_DURATION: 100,
  /** Duration for group expand/collapse animation */
  GROUP_EXPAND_DURATION: 250,
  /** Easing function for appear animation */
  APPEAR_EASING: 'cubic-out',
  /** Easing function for fade animation */
  FADE_EASING: 'cubic-in',
} as const;

/**
 * Visual constants for sibling nodes
 */
export const VISUAL = {
  /** Radius of sibling node circles (smaller than primary nodes) */
  SIBLING_RADIUS: 12,
  /** Distance from selected node to siblings */
  SIBLING_OFFSET: 80,
  /** Vertical spacing for stack layout */
  STACK_SPACING: 35,
  /** Horizontal offset for stack layout */
  STACK_OFFSET_X: 70,
  /** Stroke width for sibling circles */
  STROKE_WIDTH: 2,
  /** Stroke color for sibling circles */
  STROKE_COLOR: '#fff',
  /** Fill opacity for sibling circles */
  FILL_OPACITY: 0.9,
  /** Stroke opacity for sibling circles */
  STROKE_OPACITY: 1,
  /** Font size for emoji icons */
  ICON_FONT_SIZE: 18,
  /** Font size for action labels */
  LABEL_FONT_SIZE: 10,
  /** Label text color */
  LABEL_COLOR: '#e5e7eb',
  /** Scale factor on hover */
  HOVER_SCALE: 1.15,
  /** Opacity on hover */
  HOVER_OPACITY: 1.0,
  /** Minimum distance for collision detection */
  MIN_COLLISION_DISTANCE: 30,
  /** Animation stagger time (ms) between siblings */
  ANIMATION_STAGGER: 50,
} as const;

/**
 * Color scheme for sibling nodes by category
 * Maps ActionCategory to hex color values
 */
export const SIBLING_COLORS: Record<ActionCategory, string> = {
  view: '#3b82f6',        // Blue - informational
  create: '#10b981',      // Green - additive
  'state-change': '#f59e0b', // Amber - modification
  'ai-analysis': '#8b5cf6',  // Purple - AI scanning
  'ai-generative': '#ec4899', // Pink - AI generation
  integration: '#06b6d4',    // Cyan - external tools
  destructive: '#ef4444',    // Red - dangerous actions
} as const;

/**
 * Layout selection thresholds
 * Determines which layout to use based on sibling count
 */
export const LAYOUT_THRESHOLDS = {
  /** Use arc layout for this many siblings or fewer */
  ARC_MAX: 4,
  /** Use stack layout for this many siblings or fewer */
  STACK_MAX: 7,
  /** Use ring layout for more than STACK_MAX siblings */
} as const;

/**
 * Arc layout configuration
 */
export const ARC_LAYOUT = {
  /** Arc angle in degrees (180 degrees) */
  startAngle: -90,
  /** End angle in degrees */
  endAngle: 90,
  /** Default radius for arc */
  radius: 80,
} as const;

/**
 * Ring layout configuration
 */
export const RING_LAYOUT = {
  /** Radius for ring layout */
  radius: 80,
} as const;

/**
 * Grouped siblings configuration
 */
export const GROUP_CONFIG = {
  /** Maximum nesting depth for grouped siblings */
  MAX_NESTING_DEPTH: 2,
  /** Spacing offset for sub-siblings */
  SUB_SIBLING_OFFSET: 40,
  /** Visual indent for child siblings */
  CHILD_INDENT: 15,
} as const;

/**
 * Performance and limits
 */
export const SIBLING_LIMITS = {
  /** Maximum number of top-level siblings to display */
  MAX_SIBLINGS: 10,
  /** Maximum number of sub-siblings in a group */
  MAX_GROUP_CHILDREN: 8,
  /** Delay before showing hover effect (ms) */
  HOVER_DELAY: 150,
} as const;

/**
 * Z-index layers for proper rendering
 */
export const Z_INDEX = {
  /** Primary graph nodes */
  PRIMARY_NODES: 1,
  /** Graph edges */
  EDGES: 0,
  /** Sibling nodes (appear above primary nodes) */
  SIBLING_NODES: 2,
  /** Expanded sub-siblings (appear above siblings) */
  SUB_SIBLINGS: 3,
} as const;

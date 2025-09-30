import type { Position, LayoutType } from '@vislzr/shared/types/actions';
import { VISUAL, ARC_LAYOUT, RING_LAYOUT, LAYOUT_THRESHOLDS } from '../lib/constants';

/**
 * Calculate positions for sibling nodes around a parent
 * Implements Arc, Stack, and Ring layout algorithms
 */

export interface PositionOptions {
  parentX: number;
  parentY: number;
  parentRadius: number;
  actionCount: number;
  layoutType?: LayoutType;
}

/**
 * Choose appropriate layout based on action count
 */
export function selectLayout(actionCount: number): LayoutType {
  if (actionCount <= LAYOUT_THRESHOLDS.ARC_MAX) {
    return 'arc';
  } else if (actionCount <= LAYOUT_THRESHOLDS.STACK_MAX) {
    return 'stack';
  } else {
    return 'ring';
  }
}

/**
 * Calculate positions for sibling nodes
 */
export function calculateSiblingPositions(
  options: PositionOptions
): Position[] {
  const layout = options.layoutType || selectLayout(options.actionCount);

  switch (layout) {
    case 'arc':
      return calculateArcPositions(options);
    case 'stack':
      return calculateStackPositions(options);
    case 'ring':
      return calculateRingPositions(options);
    default:
      return calculateArcPositions(options);
  }
}

/**
 * Arc Layout: Actions arranged in a 180° arc above the node
 */
function calculateArcPositions(options: PositionOptions): Position[] {
  const { parentX, parentY, actionCount } = options;
  const positions: Position[] = [];

  const radius = ARC_LAYOUT.radius;
  const startAngle = ARC_LAYOUT.startAngle * (Math.PI / 180);
  const endAngle = ARC_LAYOUT.endAngle * (Math.PI / 180);
  const angleRange = endAngle - startAngle;

  for (let i = 0; i < actionCount; i++) {
    const angle = startAngle + (angleRange * i) / (actionCount - 1 || 1);

    positions.push({
      x: parentX + Math.cos(angle) * radius,
      y: parentY + Math.sin(angle) * radius,
      angle: angle * (180 / Math.PI),
    });
  }

  return positions;
}

/**
 * Stack Layout: Actions stacked vertically to the right
 */
function calculateStackPositions(options: PositionOptions): Position[] {
  const { parentX, parentY, actionCount } = options;
  const positions: Position[] = [];

  const spacing = VISUAL.SIBLING_OFFSET;
  const startY = parentY - ((actionCount - 1) * spacing) / 2;

  for (let i = 0; i < actionCount; i++) {
    positions.push({
      x: parentX + VISUAL.SIBLING_OFFSET * 1.5,
      y: startY + i * spacing,
      angle: 0,
    });
  }

  return positions;
}

/**
 * Ring Layout: Actions arranged in full 360° circle
 */
function calculateRingPositions(options: PositionOptions): Position[] {
  const { parentX, parentY, actionCount } = options;
  const positions: Position[] = [];

  const radius = RING_LAYOUT.radius;
  const angleStep = (2 * Math.PI) / actionCount;

  for (let i = 0; i < actionCount; i++) {
    const angle = i * angleStep - Math.PI / 2; // Start at top

    positions.push({
      x: parentX + Math.cos(angle) * radius,
      y: parentY + Math.sin(angle) * radius,
      angle: angle * (180 / Math.PI),
    });
  }

  return positions;
}

/**
 * Check if position collides with any graph nodes
 */
export function checkCollision(
  position: Position,
  nodePositions: Array<{ x: number; y: number; radius: number }>
): boolean {
  const minDistance = VISUAL.MIN_COLLISION_DISTANCE;

  return nodePositions.some(node => {
    const dx = position.x - node.x;
    const dy = position.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (minDistance + node.radius);
  });
}

/**
 * Adjust positions to avoid collisions
 */
export function resolveCollisions(
  positions: Position[],
  nodePositions: Array<{ x: number; y: number; radius: number }>
): Position[] {
  return positions.map(pos => {
    let adjusted = { ...pos };
    let attempts = 0;
    const maxAttempts = 10;

    while (checkCollision(adjusted, nodePositions) && attempts < maxAttempts) {
      // Move radially outward
      const angle = pos.angle || 0;
      const angleRad = angle * (Math.PI / 180);
      adjusted.x += Math.cos(angleRad) * 10;
      adjusted.y += Math.sin(angleRad) * 10;
      attempts++;
    }

    return adjusted;
  });
}

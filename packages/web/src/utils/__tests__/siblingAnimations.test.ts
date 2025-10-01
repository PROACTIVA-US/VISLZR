/**
 * Unit tests for sibling animation utilities.
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ANIMATION_CONFIG,
  calculateStaggerDelays,
  calculateArcPosition,
  calculateStackPosition,
  calculateSiblingPositions,
} from '../siblingAnimations';
import type { SiblingAction } from '@vislzr/shared';

// Local test type for sibling node data with position
interface SiblingNodeData {
  id: string;
  parentNodeId: string;
  action: SiblingAction;
  x: number;
  y: number;
  angle?: number;
}

describe('siblingAnimations', () => {
  describe('DEFAULT_ANIMATION_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_ANIMATION_CONFIG).toEqual({
        duration: 300,
        delay: 0,
        stagger: 50,
        easing: 'cubic-out',
      });
    });
  });

  describe('calculateStaggerDelays', () => {
    it('should calculate delays with no base delay', () => {
      const delays = calculateStaggerDelays(3);
      expect(delays).toEqual([0, 50, 100]);
    });

    it('should calculate delays with base delay', () => {
      const delays = calculateStaggerDelays(3, 100);
      expect(delays).toEqual([100, 150, 200]);
    });

    it('should calculate delays with custom stagger', () => {
      const delays = calculateStaggerDelays(3, 0, 100);
      expect(delays).toEqual([0, 100, 200]);
    });

    it('should handle single element', () => {
      const delays = calculateStaggerDelays(1);
      expect(delays).toEqual([0]);
    });

    it('should handle zero elements', () => {
      const delays = calculateStaggerDelays(0);
      expect(delays).toEqual([]);
    });

    it('should handle large number of elements', () => {
      const delays = calculateStaggerDelays(10, 0, 25);
      expect(delays).toHaveLength(10);
      expect(delays[0]).toBe(0);
      expect(delays[9]).toBe(225);
    });
  });

  describe('calculateArcPosition', () => {
    it('should calculate arc position for single sibling', () => {
      const pos = calculateArcPosition(100, 100, 30, 0, 1);

      // Single sibling should be at the top center
      expect(pos.x).toBeCloseTo(100, 1);
      expect(pos.y).toBeCloseTo(100 - 150, 1); // parentY - (parentRadius + arcRadius)
      expect(pos.angle).toBeCloseTo(-Math.PI / 2, 2); // -π/2 radians points upward
    });

    it('should calculate arc positions for multiple siblings', () => {
      const positions = [
        calculateArcPosition(100, 100, 30, 0, 3),
        calculateArcPosition(100, 100, 30, 1, 3),
        calculateArcPosition(100, 100, 30, 2, 3),
      ];

      // Check that siblings are spread across an arc
      expect(positions[0].angle).toBeLessThan(positions[1].angle);
      expect(positions[1].angle).toBeLessThan(positions[2].angle);

      // All siblings should be at the same distance from parent
      positions.forEach((pos) => {
        const distance = Math.sqrt((pos.x - 100) ** 2 + (pos.y - 100) ** 2);
        expect(distance).toBeCloseTo(150, 1); // parentRadius + arcRadius
      });
    });

    it('should use custom arc radius', () => {
      const pos = calculateArcPosition(100, 100, 30, 0, 1, 200);
      const distance = Math.sqrt((pos.x - 100) ** 2 + (pos.y - 100) ** 2);
      expect(distance).toBeCloseTo(230, 1); // parentRadius + custom arcRadius
    });

    it('should position siblings symmetrically', () => {
      const pos1 = calculateArcPosition(0, 0, 30, 0, 2);
      const pos2 = calculateArcPosition(0, 0, 30, 1, 2);

      // Siblings should be symmetric around center
      expect(Math.abs(pos1.x + pos2.x)).toBeCloseTo(0, 1);
    });
  });

  describe('calculateStackPosition', () => {
    it('should calculate vertical stack position', () => {
      const pos = calculateStackPosition(100, 100, 30, 1, 3, 'vertical');

      expect(pos.x).toBe(100 + 30 + 80); // parentX + parentRadius + offset
      expect(pos.y).toBeCloseTo(100, 1); // Middle sibling at parent Y
    });

    it('should calculate horizontal stack position', () => {
      const pos = calculateStackPosition(100, 100, 30, 1, 3, 'horizontal');

      expect(pos.x).toBeCloseTo(100, 1); // Middle sibling at parent X
      expect(pos.y).toBe(100 + 30 + 60); // parentY + parentRadius + offset
    });

    it('should space siblings evenly in vertical stack', () => {
      const positions = [
        calculateStackPosition(100, 100, 30, 0, 3, 'vertical', 50),
        calculateStackPosition(100, 100, 30, 1, 3, 'vertical', 50),
        calculateStackPosition(100, 100, 30, 2, 3, 'vertical', 50),
      ];

      expect(positions[0].y).toBeCloseTo(50, 1);
      expect(positions[1].y).toBeCloseTo(100, 1);
      expect(positions[2].y).toBeCloseTo(150, 1);
    });

    it('should space siblings evenly in horizontal stack', () => {
      const positions = [
        calculateStackPosition(100, 100, 30, 0, 3, 'horizontal', 50),
        calculateStackPosition(100, 100, 30, 1, 3, 'horizontal', 50),
        calculateStackPosition(100, 100, 30, 2, 3, 'horizontal', 50),
      ];

      expect(positions[0].x).toBeCloseTo(50, 1);
      expect(positions[1].x).toBeCloseTo(100, 1);
      expect(positions[2].x).toBeCloseTo(150, 1);
    });

    it('should use custom spacing', () => {
      const pos1 = calculateStackPosition(100, 100, 30, 0, 2, 'vertical', 100);
      const pos2 = calculateStackPosition(100, 100, 30, 1, 2, 'vertical', 100);

      expect(Math.abs(pos2.y - pos1.y)).toBeCloseTo(100, 1);
    });

    it('should handle single sibling', () => {
      const pos = calculateStackPosition(100, 100, 30, 0, 1, 'vertical');

      expect(pos.x).toBe(100 + 30 + 80);
      expect(pos.y).toBeCloseTo(100, 1);
    });
  });

  describe('calculateSiblingPositions', () => {
    const mockSiblings: SiblingNodeData[] = [
      {
        id: 'sibling-1',
        parentNodeId: 'node-1',
        action: {
          id: 'action-1',
          label: 'Action 1',
          icon: '✓',
          category: 'create',
          visibilityRules: [],
          priority: 1,
          handler: async () => ({ success: true }),
        },
        x: 0,
        y: 0,
      },
      {
        id: 'sibling-2',
        parentNodeId: 'node-1',
        action: {
          id: 'action-2',
          label: 'Action 2',
          icon: '👁',
          category: 'view',
          visibilityRules: [],
          priority: 2,
          handler: async () => ({ success: true }),
        },
        x: 0,
        y: 0,
      },
      {
        id: 'sibling-3',
        parentNodeId: 'node-1',
        action: {
          id: 'action-3',
          label: 'Action 3',
          icon: '🔗',
          category: 'state-change',
          visibilityRules: [],
          priority: 3,
          handler: async () => ({ success: true }),
        },
        x: 0,
        y: 0,
      },
    ];

    it('should calculate arc layout positions', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        mockSiblings,
        'arc'
      );

      expect(positions).toHaveLength(3);
      positions.forEach((pos) => {
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
        expect(pos).toHaveProperty('angle');
      });
    });

    it('should calculate stack layout positions', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        mockSiblings,
        'stack'
      );

      expect(positions).toHaveLength(3);
      positions.forEach((pos) => {
        expect(pos).toHaveProperty('x');
        expect(pos).toHaveProperty('y');
        expect(pos.angle).toBeUndefined();
      });
    });

    it('should use default radius if not provided', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100 },
        mockSiblings,
        'arc'
      );

      expect(positions).toHaveLength(3);
      // Should use default radius of 30
    });

    it('should accept custom arc radius', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        mockSiblings,
        'arc',
        { arcRadius: 200 }
      );

      positions.forEach((pos) => {
        const distance = Math.sqrt((pos.x - 100) ** 2 + (pos.y - 100) ** 2);
        expect(distance).toBeCloseTo(230, 1); // radius + arcRadius
      });
    });

    it('should accept custom stack options', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        mockSiblings,
        'stack',
        { stackDirection: 'horizontal', stackSpacing: 60 }
      );

      // Check horizontal spacing
      expect(positions[1].x - positions[0].x).toBeCloseTo(60, 1);
      expect(positions[2].x - positions[1].x).toBeCloseTo(60, 1);
    });

    it('should handle empty siblings array', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        [],
        'arc'
      );

      expect(positions).toEqual([]);
    });

    it('should handle single sibling', () => {
      const positions = calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        [mockSiblings[0]],
        'arc'
      );

      expect(positions).toHaveLength(1);
      expect(positions[0]).toHaveProperty('x');
      expect(positions[0]).toHaveProperty('y');
    });
  });

  describe('Animation timing', () => {
    it('should meet performance target of <100ms for positioning', () => {
      const start = performance.now();

      const largeSiblings = Array.from({ length: 50 }, (_, i) => ({
        id: `sibling-${i}`,
        parentNodeId: 'node-1',
        action: {
          id: `action-${i}`,
          label: `Action ${i}`,
          icon: '✓',
          category: 'create' as const,
          visibilityRules: [],
          priority: 1,
          handler: async () => ({ success: true }),
        },
        x: 0,
        y: 0,
      }));

      calculateSiblingPositions(
        { x: 100, y: 100, radius: 30 },
        largeSiblings,
        'arc'
      );

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Performance target: <100ms
    });
  });
});

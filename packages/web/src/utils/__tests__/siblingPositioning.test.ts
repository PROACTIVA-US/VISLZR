import { describe, it, expect } from 'vitest';
import {
  calculateSiblingPositions,
  selectLayout,
  checkCollision,
  resolveCollisions,
} from '../siblingPositioning';

describe('siblingPositioning', () => {
  describe('selectLayout', () => {
    it('should select arc for 4 or fewer actions', () => {
      expect(selectLayout(1)).toBe('arc');
      expect(selectLayout(4)).toBe('arc');
    });

    it('should select stack for 5-7 actions', () => {
      expect(selectLayout(5)).toBe('stack');
      expect(selectLayout(7)).toBe('stack');
    });

    it('should select ring for 8+ actions', () => {
      expect(selectLayout(8)).toBe('ring');
      expect(selectLayout(12)).toBe('ring');
    });
  });

  describe('calculateSiblingPositions', () => {
    it('should calculate arc positions correctly', () => {
      const positions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 3,
        layoutType: 'arc',
      });

      expect(positions).toHaveLength(3);
      positions.forEach(pos => {
        expect(pos.x).toBeDefined();
        expect(pos.y).toBeDefined();
        expect(pos.angle).toBeDefined();
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
    });

    it('should calculate stack positions correctly', () => {
      const positions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 5,
        layoutType: 'stack',
      });

      expect(positions).toHaveLength(5);
      // Stack should be vertically aligned - all x coordinates should be equal
      const firstX = positions[0].x;
      positions.forEach(pos => {
        expect(pos.x).toBe(firstX);
      });
    });

    it('should calculate ring positions correctly', () => {
      const positions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 8,
        layoutType: 'ring',
      });

      expect(positions).toHaveLength(8);
      // Ring should be evenly distributed - check angle differences
      const firstAngle = positions[0].angle || 0;
      const secondAngle = positions[1].angle || 0;
      const expectedAngleStep = 45; // 360 / 8 = 45 degrees
      expect(Math.abs(secondAngle - firstAngle)).toBeCloseTo(expectedAngleStep, 0);
    });

    it('should auto-select layout when layoutType not provided', () => {
      // Should select arc for 3 actions
      const arcPositions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 3,
      });
      expect(arcPositions).toHaveLength(3);

      // Should select stack for 6 actions
      const stackPositions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 6,
      });
      expect(stackPositions).toHaveLength(6);

      // Should select ring for 10 actions
      const ringPositions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 10,
      });
      expect(ringPositions).toHaveLength(10);
    });
  });

  describe('checkCollision', () => {
    it('should detect collision when nodes overlap', () => {
      const position = { x: 100, y: 100, angle: 0 };
      const nodes = [{ x: 110, y: 100, radius: 20 }];

      expect(checkCollision(position, nodes)).toBe(true);
    });

    it('should not detect collision when nodes are far apart', () => {
      const position = { x: 100, y: 100, angle: 0 };
      const nodes = [{ x: 200, y: 200, radius: 20 }];

      expect(checkCollision(position, nodes)).toBe(false);
    });

    it('should handle empty node list', () => {
      const position = { x: 100, y: 100, angle: 0 };
      const nodes: Array<{ x: number; y: number; radius: number }> = [];

      expect(checkCollision(position, nodes)).toBe(false);
    });

    it('should detect collision with multiple nodes', () => {
      const position = { x: 100, y: 100, angle: 0 };
      const nodes = [
        { x: 50, y: 50, radius: 20 },
        { x: 105, y: 105, radius: 20 }, // This one collides
        { x: 200, y: 200, radius: 20 },
      ];

      expect(checkCollision(position, nodes)).toBe(true);
    });
  });

  describe('resolveCollisions', () => {
    it('should adjust positions to avoid collisions', () => {
      const positions = [{ x: 100, y: 100, angle: 0 }];
      const nodes = [{ x: 100, y: 100, radius: 20 }];

      const resolved = resolveCollisions(positions, nodes);

      // Position should have moved
      expect(resolved[0].x !== 100 || resolved[0].y !== 100).toBe(true);
    });

    it('should not change positions without collisions', () => {
      const positions = [{ x: 100, y: 100, angle: 0 }];
      const nodes = [{ x: 300, y: 300, radius: 20 }];

      const resolved = resolveCollisions(positions, nodes);

      // Position should remain the same
      expect(resolved[0].x).toBe(100);
      expect(resolved[0].y).toBe(100);
    });

    it('should handle multiple positions with collisions', () => {
      const positions = [
        { x: 100, y: 100, angle: 0 },
        { x: 150, y: 150, angle: 45 },
      ];
      const nodes = [
        { x: 100, y: 100, radius: 20 },
        { x: 150, y: 150, radius: 20 },
      ];

      const resolved = resolveCollisions(positions, nodes);

      expect(resolved).toHaveLength(2);
      // Both positions should have been adjusted
      expect(resolved[0].x !== 100 || resolved[0].y !== 100).toBe(true);
      expect(resolved[1].x !== 150 || resolved[1].y !== 150).toBe(true);
    });
  });
});

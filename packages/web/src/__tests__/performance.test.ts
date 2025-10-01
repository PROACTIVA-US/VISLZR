import { describe, it, expect, beforeAll } from 'vitest';
import { calculateSiblingPositions } from '../utils/siblingPositioning';
import { actionRegistry } from '../lib/ActionRegistry';
import { ContextDetector } from '../lib/ContextDetector';
import type { NodeData } from '@vislzr/shared';
import { defaultActions } from '../lib/defaultActions';
import type { SiblingAction } from '@vislzr/shared';

describe('Performance Tests', () => {
  beforeAll(() => {
    // Initialize actions before performance tests
    defaultActions.forEach((action: SiblingAction) => {
      actionRegistry.register(action);
    });
  });

  it('should calculate positions in under 10ms per iteration', () => {
    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 8,
      });
    }

    const end = performance.now();
    const avgTime = (end - start) / iterations;

    console.log(`Average position calculation time: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(10);
  });

  it('should filter actions in under 5ms per iteration', () => {
    // Create 100 nodes for a realistic graph
    const nodes: NodeData[] = Array.from({ length: 100 }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: 'TASK',
      status: 'IDLE',
      priority: 2,
      progress: 0,
      tags: [],
      parent_id: i > 0 ? `node-${i - 1}` : null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    }));

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes,
      edges: [],
    };

    const iterations = 100;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const nodeIndex = i % nodes.length;
      const context = ContextDetector.buildContext(nodes[nodeIndex], graph);
      actionRegistry.getActionsForContext(nodes[nodeIndex], context);
    }

    const end = performance.now();
    const avgTime = (end - start) / iterations;

    console.log(`Average action filtering time: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(5);
  });

  it('should build context quickly for large graphs', () => {
    // Create a large graph with 500 nodes
    const nodes: NodeData[] = Array.from({ length: 500 }, (_, i) => ({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: i % 3 === 0 ? 'FILE' : 'TASK',
      status: 'IDLE',
      priority: 1,
      progress: 0,
      tags: [],
      parent_id: i > 0 && i % 10 === 0 ? `node-${i - 1}` : null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    }));

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes,
      edges: [],
    };

    const start = performance.now();
    const context = ContextDetector.buildContext(nodes[250], graph);
    const end = performance.now();

    const time = end - start;
    console.log(`Context build time for 500 nodes: ${time.toFixed(3)}ms`);

    expect(context).toBeDefined();
    expect(time).toBeLessThan(50); // Should complete in under 50ms
  });

  it('should handle position calculation with collision resolution efficiently', () => {
    // Create a crowded scenario with many potential collisions
    const start = performance.now();

    for (let i = 0; i < 50; i++) {
      const positions = calculateSiblingPositions({
        parentX: 100,
        parentY: 100,
        parentRadius: 20,
        actionCount: 8,
      });

      // Positions are calculated
      expect(positions).toHaveLength(8);
    }

    const end = performance.now();
    const time = end - start;

    console.log(`Position calculation with collisions (50 iterations): ${time.toFixed(3)}ms`);
    expect(time).toBeLessThan(500); // Should complete 50 iterations in under 500ms
  });

  it('should scale well with increasing action count', () => {
    const actionCounts = [4, 8, 12, 16, 20];
    const results: { count: number; time: number }[] = [];

    actionCounts.forEach(count => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        calculateSiblingPositions({
          parentX: 100,
          parentY: 100,
          parentRadius: 20,
          actionCount: count,
        });
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;
      results.push({ count, time: avgTime });
    });

    console.log('Scaling results:');
    results.forEach(r => {
      console.log(`  ${r.count} actions: ${r.time.toFixed(3)}ms`);
    });

    // Performance should remain reasonable even with 20 actions
    const maxTime = Math.max(...results.map(r => r.time));
    expect(maxTime).toBeLessThan(10);

    // Should scale roughly linearly (not exponentially)
    const firstTime = results[0].time;
    const lastTime = results[results.length - 1].time;
    const scaleFactor = lastTime / firstTime;
    expect(scaleFactor).toBeLessThan(10); // Should not be more than 10x slower
  });

  it('should efficiently register and retrieve actions', () => {
    // Count current actions
    const initialCount = actionRegistry.getAllActions().length;

    // Test retrieval speed
    const retrievalStart = performance.now();
    for (let i = 0; i < 100; i++) {
      actionRegistry.getAllActions();
    }
    const retrievalTime = (performance.now() - retrievalStart) / 100;

    console.log(`Average action retrieval time: ${retrievalTime.toFixed(3)}ms`);
    expect(retrievalTime).toBeLessThan(1);

    // Verify actions are still registered
    expect(actionRegistry.getAllActions().length).toBe(initialCount);
  });
});

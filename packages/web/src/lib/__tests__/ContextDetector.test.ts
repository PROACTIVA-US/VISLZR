// ContextDetector tests
// Phase 1.2 - Action Registry & Context Detection

import { describe, it, expect } from 'vitest';
import { ContextDetector } from '../ContextDetector';
import type { NodeData, EdgeData, GraphData } from '@vislzr/shared';

describe('ContextDetector', () => {
  describe('buildContext', () => {
    it('should detect children correctly', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent Node',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child: NodeData = {
        id: 'child',
        label: 'Child Node',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'parent',
        target: 'child',
        type: 'parent',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child],
        edges: [edge],
      };

      const context = ContextDetector.buildContext(parent, graph);

      expect(context.hasChildren).toBe(true);
      expect(context.hasParent).toBe(false);
      expect(context.nodeType).toBe('FOLDER');
      expect(context.status).toBe('IDLE');
    });

    it('should detect parent correctly', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent',
        type: 'ROOT',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child: NodeData = {
        id: 'child',
        label: 'Child',
        type: 'TASK',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'parent',
        target: 'child',
        type: 'parent',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child],
        edges: [edge],
      };

      const context = ContextDetector.buildContext(child, graph);

      expect(context.hasParent).toBe(true);
      expect(context.hasChildren).toBe(false);
    });

    it('should detect dependencies correctly', () => {
      const dependency: NodeData = {
        id: 'dep',
        label: 'Dependency',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 50,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const target: NodeData = {
        id: 'target',
        label: 'Target Task',
        type: 'TASK',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: ['dep'],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'dep',
        target: 'target',
        type: 'dependency',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [dependency, target],
        edges: [edge],
      };

      const context = ContextDetector.buildContext(target, graph);

      expect(context.hasDependencies).toBe(true);
    });

    it('should detect blocked status when dependency is incomplete', () => {
      const dependency: NodeData = {
        id: 'dep',
        label: 'Dependency',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 50,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const target: NodeData = {
        id: 'target',
        label: 'Target Task',
        type: 'TASK',
        status: 'BLOCKED',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: ['dep'],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'dep',
        target: 'target',
        type: 'dependency',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [dependency, target],
        edges: [edge],
      };

      const context = ContextDetector.buildContext(target, graph);

      expect(context.isBlocked).toBe(true);
      expect(context.hasDependencies).toBe(true);
    });

    it('should detect overdue status from due_date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const node: NodeData = {
        id: 'node1',
        label: 'Overdue Task',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 30,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          due_date: yesterday.toISOString(),
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [node],
        edges: [],
      };

      const context = ContextDetector.buildContext(node, graph);

      expect(context.isOverdue).toBe(true);
    });

    it('should not detect overdue for completed tasks with past due date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const node: NodeData = {
        id: 'node1',
        label: 'Completed Task',
        type: 'TASK',
        status: 'COMPLETED',
        priority: 2,
        progress: 100,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          due_date: yesterday.toISOString(),
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [node],
        edges: [],
      };

      const context = ContextDetector.buildContext(node, graph);

      expect(context.isOverdue).toBe(false);
    });

    it('should detect AT_RISK status as overdue', () => {
      const node: NodeData = {
        id: 'node1',
        label: 'At Risk Task',
        type: 'TASK',
        status: 'AT_RISK',
        priority: 2,
        progress: 10,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [node],
        edges: [],
      };

      const context = ContextDetector.buildContext(node, graph);

      expect(context.isOverdue).toBe(true);
    });
  });

  describe('getChildren', () => {
    it('should return all child nodes', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child1: NodeData = {
        id: 'child1',
        label: 'Child 1',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child2: NodeData = {
        id: 'child2',
        label: 'Child 2',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edges: EdgeData[] = [
        {
          id: 'edge1',
          source: 'parent',
          target: 'child1',
          type: 'parent',
          status: 'active',
        },
        {
          id: 'edge2',
          source: 'parent',
          target: 'child2',
          type: 'parent',
          status: 'active',
        },
      ];

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child1, child2],
        edges,
      };

      const children = ContextDetector.getChildren('parent', graph);

      expect(children).toHaveLength(2);
      expect(children.map((c) => c.id)).toContain('child1');
      expect(children.map((c) => c.id)).toContain('child2');
    });

    it('should return empty array for leaf nodes', () => {
      const leaf: NodeData = {
        id: 'leaf',
        label: 'Leaf Node',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [leaf],
        edges: [],
      };

      const children = ContextDetector.getChildren('leaf', graph);

      expect(children).toHaveLength(0);
    });
  });

  describe('getDependencies', () => {
    it('should return all dependency nodes', () => {
      const dep1: NodeData = {
        id: 'dep1',
        label: 'Dependency 1',
        type: 'TASK',
        status: 'COMPLETED',
        priority: 2,
        progress: 100,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const dep2: NodeData = {
        id: 'dep2',
        label: 'Dependency 2',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 50,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const target: NodeData = {
        id: 'target',
        label: 'Target',
        type: 'TASK',
        status: 'BLOCKED',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: ['dep1', 'dep2'],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edges: EdgeData[] = [
        {
          id: 'edge1',
          source: 'dep1',
          target: 'target',
          type: 'dependency',
          status: 'active',
        },
        {
          id: 'edge2',
          source: 'dep2',
          target: 'target',
          type: 'dependency',
          status: 'active',
        },
      ];

      const graph: GraphData = {
        project: {} as any,
        nodes: [dep1, dep2, target],
        edges,
      };

      const dependencies = ContextDetector.getDependencies('target', graph);

      expect(dependencies).toHaveLength(2);
      expect(dependencies.map((d) => d.id)).toContain('dep1');
      expect(dependencies.map((d) => d.id)).toContain('dep2');
    });
  });

  describe('calculateSubtreeProgress', () => {
    it('should return node progress when no children', () => {
      const node: NodeData = {
        id: 'node1',
        label: 'Leaf Node',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 60,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [node],
        edges: [],
      };

      const progress = ContextDetector.calculateSubtreeProgress('node1', graph);

      expect(progress).toBe(60);
    });

    it('should calculate average progress of children', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child1: NodeData = {
        id: 'child1',
        label: 'Child 1',
        type: 'TASK',
        status: 'COMPLETED',
        priority: 2,
        progress: 100,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child2: NodeData = {
        id: 'child2',
        label: 'Child 2',
        type: 'TASK',
        status: 'IN_PROGRESS',
        priority: 2,
        progress: 50,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edges: EdgeData[] = [
        {
          id: 'edge1',
          source: 'parent',
          target: 'child1',
          type: 'parent',
          status: 'active',
        },
        {
          id: 'edge2',
          source: 'parent',
          target: 'child2',
          type: 'parent',
          status: 'active',
        },
      ];

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child1, child2],
        edges,
      };

      const progress = ContextDetector.calculateSubtreeProgress('parent', graph);

      expect(progress).toBe(75); // (100 + 50) / 2
    });
  });

  describe('isLeaf', () => {
    it('should return true for nodes without children', () => {
      const leaf: NodeData = {
        id: 'leaf',
        label: 'Leaf',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [leaf],
        edges: [],
      };

      expect(ContextDetector.isLeaf('leaf', graph)).toBe(true);
    });

    it('should return false for nodes with children', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child: NodeData = {
        id: 'child',
        label: 'Child',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'parent',
        target: 'child',
        type: 'parent',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child],
        edges: [edge],
      };

      expect(ContextDetector.isLeaf('parent', graph)).toBe(false);
    });
  });

  describe('isRoot', () => {
    it('should return true for nodes without parents', () => {
      const root: NodeData = {
        id: 'root',
        label: 'Root',
        type: 'ROOT',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [root],
        edges: [],
      };

      expect(ContextDetector.isRoot('root', graph)).toBe(true);
    });

    it('should return false for nodes with parents', () => {
      const parent: NodeData = {
        id: 'parent',
        label: 'Parent',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const child: NodeData = {
        id: 'child',
        label: 'Child',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'parent',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edge: EdgeData = {
        id: 'edge1',
        source: 'parent',
        target: 'child',
        type: 'parent',
        status: 'active',
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [parent, child],
        edges: [edge],
      };

      expect(ContextDetector.isRoot('child', graph)).toBe(false);
    });
  });

  describe('getDepth', () => {
    it('should return 0 for root nodes', () => {
      const root: NodeData = {
        id: 'root',
        label: 'Root',
        type: 'ROOT',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const graph: GraphData = {
        project: {} as any,
        nodes: [root],
        edges: [],
      };

      expect(ContextDetector.getDepth('root', graph)).toBe(0);
    });

    it('should calculate depth correctly', () => {
      const root: NodeData = {
        id: 'root',
        label: 'Root',
        type: 'ROOT',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const level1: NodeData = {
        id: 'level1',
        label: 'Level 1',
        type: 'FOLDER',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'root',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const level2: NodeData = {
        id: 'level2',
        label: 'Level 2',
        type: 'FILE',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: 'level1',
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      };

      const edges: EdgeData[] = [
        {
          id: 'edge1',
          source: 'root',
          target: 'level1',
          type: 'parent',
          status: 'active',
        },
        {
          id: 'edge2',
          source: 'level1',
          target: 'level2',
          type: 'parent',
          status: 'active',
        },
      ];

      const graph: GraphData = {
        project: {} as any,
        nodes: [root, level1, level2],
        edges,
      };

      expect(ContextDetector.getDepth('root', graph)).toBe(0);
      expect(ContextDetector.getDepth('level1', graph)).toBe(1);
      expect(ContextDetector.getDepth('level2', graph)).toBe(2);
    });
  });
});

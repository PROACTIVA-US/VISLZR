// ActionRegistry tests
// Phase 1.2 - Action Registry & Context Detection

import { describe, it, expect, beforeEach } from 'vitest';
import { ActionRegistry } from '../ActionRegistry';
import type { SiblingAction, NodeData, NodeContext, GraphContext } from '@vislzr/shared';

describe('ActionRegistry', () => {
  let registry: ActionRegistry;

  beforeEach(() => {
    registry = new ActionRegistry();
  });

  describe('register', () => {
    it('should register a new action', () => {
      const action: SiblingAction = {
        id: 'test-action',
        label: 'Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      expect(registry.count).toBe(1);
      expect(registry.getAction('test-action')).toBe(action);
    });

    it('should throw error when registering duplicate ID', () => {
      const action: SiblingAction = {
        id: 'duplicate',
        label: 'Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      expect(() => registry.register(action)).toThrow("Action with id 'duplicate' is already registered");
    });
  });

  describe('unregister', () => {
    it('should unregister an existing action', () => {
      const action: SiblingAction = {
        id: 'test-action',
        label: 'Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      expect(registry.count).toBe(1);

      const result = registry.unregister('test-action');
      expect(result).toBe(true);
      expect(registry.count).toBe(0);
    });

    it('should return false for non-existent action', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getActionsForContext', () => {
    const mockNode: NodeData = {
      id: 'node-1',
      label: 'Test Node',
      type: 'TASK',
      status: 'IDLE',
      priority: 2,
      progress: 0,
      tags: ['test'],
      parent_id: null,
      dependencies: [],
      metadata: {
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    };

    const mockContext: NodeContext = {
      nodeType: 'TASK',
      status: 'IDLE',
      hasChildren: false,
      hasParent: false,
      hasDependencies: false,
      isBlocked: false,
      isOverdue: false,
      metadata: {},
    };

    it('should return actions with "always" visibility rule', () => {
      const action: SiblingAction = {
        id: 'always-visible',
        label: 'Always',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('always-visible');
    });

    it('should filter actions based on node type', () => {
      const taskAction: SiblingAction = {
        id: 'task-action',
        label: 'Task Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'type', operator: 'equals', value: 'TASK' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      const serviceAction: SiblingAction = {
        id: 'service-action',
        label: 'Service Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'type', operator: 'equals', value: 'SERVICE' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(taskAction);
      registry.register(serviceAction);

      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('task-action');
    });

    it('should filter actions based on status', () => {
      const idleAction: SiblingAction = {
        id: 'idle-action',
        label: 'Idle Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'status', operator: 'equals', value: 'IDLE' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      const completedAction: SiblingAction = {
        id: 'completed-action',
        label: 'Completed Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'status', operator: 'equals', value: 'COMPLETED' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(idleAction);
      registry.register(completedAction);

      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('idle-action');
    });

    it('should filter actions based on context flags', () => {
      const depAction: SiblingAction = {
        id: 'dep-action',
        label: 'Dep Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'dependencies', operator: 'exists' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(depAction);

      // Should not appear (hasDependencies is false)
      let actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(0);

      // Should appear when hasDependencies is true
      const contextWithDeps: NodeContext = { ...mockContext, hasDependencies: true };
      actions = registry.getActionsForContext(mockNode, contextWithDeps);
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('dep-action');
    });

    it('should handle "not-equals" operator', () => {
      const action: SiblingAction = {
        id: 'not-completed',
        label: 'Not Completed',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'status', operator: 'not-equals', value: 'COMPLETED' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);
    });

    it('should handle "contains" operator for arrays', () => {
      const action: SiblingAction = {
        id: 'tag-action',
        label: 'Tag Action',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'tags', operator: 'contains', value: 'test' }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);
    });

    it('should sort actions by priority', () => {
      const lowPriority: SiblingAction = {
        id: 'low',
        label: 'Low',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
        priority: 10,
        handler: async () => ({ success: true }),
      };

      const highPriority: SiblingAction = {
        id: 'high',
        label: 'High',
        icon: '✓',
        category: 'view',
        visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(lowPriority);
      registry.register(highPriority);

      const actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(2);
      expect(actions[0].id).toBe('high');
      expect(actions[1].id).toBe('low');
    });

    it('should require ALL visibility rules to pass', () => {
      const action: SiblingAction = {
        id: 'multi-rule',
        label: 'Multi Rule',
        icon: '✓',
        category: 'view',
        visibilityRules: [
          { field: 'type', operator: 'equals', value: 'TASK' },
          { field: 'status', operator: 'equals', value: 'IDLE' },
        ],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);

      // Should pass (both rules match)
      let actions = registry.getActionsForContext(mockNode, mockContext);
      expect(actions).toHaveLength(1);

      // Should fail (status doesn't match)
      const differentContext: NodeContext = { ...mockContext, status: 'COMPLETED' };
      actions = registry.getActionsForContext(mockNode, differentContext);
      expect(actions).toHaveLength(0);
    });
  });

  describe('getGroupChildren', () => {
    it('should return children of a group', () => {
      const parent: SiblingAction = {
        id: 'parent',
        label: 'Parent',
        icon: '✓',
        category: 'view',
        isGroupParent: true,
        group: 'test-group',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      const child1: SiblingAction = {
        id: 'child1',
        label: 'Child 1',
        icon: '✓',
        category: 'view',
        group: 'test-group',
        visibilityRules: [],
        priority: 2,
        handler: async () => ({ success: true }),
      };

      const child2: SiblingAction = {
        id: 'child2',
        label: 'Child 2',
        icon: '✓',
        category: 'view',
        group: 'test-group',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(parent);
      registry.register(child1);
      registry.register(child2);

      const children = registry.getGroupChildren('test-group');
      expect(children).toHaveLength(2);
      expect(children[0].id).toBe('child2'); // Lower priority first
      expect(children[1].id).toBe('child1');
    });
  });

  describe('executeAction', () => {
    it('should execute action handler', async () => {
      let executed = false;
      const action: SiblingAction = {
        id: 'exec-test',
        label: 'Exec Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => {
          executed = true;
          return { success: true, message: 'Executed' };
        },
      };

      registry.register(action);

      const mockNode: NodeData = {
        id: 'node-1',
        label: 'Test',
        type: 'TASK',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        parent_id: null,
        dependencies: [],
        metadata: { created_at: '', updated_at: '' },
      };

      const mockContext: GraphContext = {
        projectId: 'proj-1',
        graphData: { project: {} as any, nodes: [], edges: [] },
        apiClient: {},
      };

      const result = await registry.executeAction('exec-test', mockNode, mockContext);
      expect(executed).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Executed');
    });

    it('should return error for non-existent action', async () => {
      const mockNode: NodeData = {} as any;
      const mockContext: GraphContext = {} as any;

      const result = await registry.executeAction('non-existent', mockNode, mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should handle action handler errors', async () => {
      const action: SiblingAction = {
        id: 'error-test',
        label: 'Error Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => {
          throw new Error('Handler error');
        },
      };

      registry.register(action);

      const mockNode: NodeData = {} as any;
      const mockContext: GraphContext = {} as any;

      const result = await registry.executeAction('error-test', mockNode, mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Handler error');
    });
  });

  describe('clear', () => {
    it('should clear all registered actions', () => {
      const action: SiblingAction = {
        id: 'test',
        label: 'Test',
        icon: '✓',
        category: 'view',
        visibilityRules: [],
        priority: 1,
        handler: async () => ({ success: true }),
      };

      registry.register(action);
      expect(registry.count).toBe(1);

      registry.clear();
      expect(registry.count).toBe(0);
    });
  });
});

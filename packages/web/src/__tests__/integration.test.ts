import { describe, it, expect, beforeAll } from 'vitest';
import { actionRegistry } from '../lib/ActionRegistry';
import { ContextDetector } from '../lib/ContextDetector';
import type { NodeData, EdgeData } from '@vislzr/shared';
import { defaultActions } from '../lib/defaultActions';
import type { SiblingAction } from '@vislzr/shared/types/actions';

describe('Integration: Registry + Context + Renderer', () => {
  beforeAll(() => {
    // Initialize the registry with default actions before tests
    defaultActions.forEach((action: SiblingAction) => {
      actionRegistry.register(action);
    });
  });

  it('should filter actions based on TASK context', () => {
    // Create a TASK node
    const taskNode: NodeData = {
      id: 'task-1',
      label: 'Test Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [taskNode],
      edges: [],
    };

    // Build context
    const context = ContextDetector.buildContext(taskNode, graph);

    // Get filtered actions
    const actions = actionRegistry.getActionsForContext(taskNode, context);

    // Should include TASK-specific actions
    expect(actions.length).toBeGreaterThan(0);

    // Should have common task actions
    const actionIds = actions.map(a => a.id);
    expect(actionIds).toContain('mark-complete');
    expect(actionIds).toContain('update-progress');
  });

  it('should not show FILE actions for TASK nodes', () => {
    const taskNode: NodeData = {
      id: 'task-1',
      label: 'Test Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [taskNode],
      edges: [],
    };

    const context = ContextDetector.buildContext(taskNode, graph);
    const actions = actionRegistry.getActionsForContext(taskNode, context);

    // Should not include FILE-specific actions
    const fileActions = actions.filter(a => a.id === 'view-code');
    expect(fileActions).toHaveLength(0);
  });

  it('should filter actions based on FILE context', () => {
    const fileNode: NodeData = {
      id: 'file-1',
      label: 'main.ts',
      type: 'FILE',
      status: 'IDLE',
      priority: 0,
      progress: 0,
      tags: ['typescript'],
      parent_id: null,
      dependencies: [],
      metadata: {
        created_at: '',
        updated_at: '',
        file_path: '/src/main.ts',
        file_type: 'typescript',
      },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [fileNode],
      edges: [],
    };

    const context = ContextDetector.buildContext(fileNode, graph);
    const actions = actionRegistry.getActionsForContext(fileNode, context);

    // Should include FILE-specific actions
    expect(actions.length).toBeGreaterThan(0);
    const actionIds = actions.map(a => a.id);
    expect(actionIds).toContain('view-code');
  });

  it('should detect hierarchy relationships in context', () => {
    // Create a parent and child node
    const parentNode: NodeData = {
      id: 'parent-1',
      label: 'Parent Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 30,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const childNode: NodeData = {
      id: 'child-1',
      label: 'Child Task',
      type: 'TASK',
      status: 'IDLE',
      priority: 1,
      progress: 0,
      tags: [],
      parent_id: 'parent-1',
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [parentNode, childNode],
      edges: [
        {
          source: 'parent-1',
          target: 'child-1',
          type: 'parent',
        },
      ],
    };

    // Build context for parent
    const parentContext = ContextDetector.buildContext(parentNode, graph);

    // Parent should have children
    expect(parentContext.hasChildren).toBe(true);

    // Build context for child
    const childContext = ContextDetector.buildContext(childNode, graph);

    // Context should be different for parent vs child
    expect(parentContext.hasChildren).not.toBe(childContext.hasChildren);
  });

  it('should filter actions based on dependencies', () => {
    const node1: NodeData = {
      id: 'node-1',
      label: 'Node 1',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: ['node-2'],
      metadata: { created_at: '', updated_at: '' },
    };

    const node2: NodeData = {
      id: 'node-2',
      label: 'Node 2',
      type: 'TASK',
      status: 'IDLE',
      priority: 1,
      progress: 0,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [node1, node2],
      edges: [
        {
          source: 'node-1',
          target: 'node-2',
          type: 'dependency',
        },
      ],
    };

    const context = ContextDetector.buildContext(node1, graph);

    // Context should detect dependencies
    expect(context.hasDependencies).toBe(true);
  });

  it('should handle empty graph gracefully', () => {
    const singleNode: NodeData = {
      id: 'single-1',
      label: 'Single Node',
      type: 'TASK',
      status: 'IDLE',
      priority: 1,
      progress: 0,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const graph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [singleNode],
      edges: [],
    };

    const context = ContextDetector.buildContext(singleNode, graph);
    const actions = actionRegistry.getActionsForContext(singleNode, context);

    // Should still return some actions
    expect(actions.length).toBeGreaterThan(0);
  });

  it('should filter by status conditions', () => {
    const inProgressNode: NodeData = {
      id: 'in-progress-1',
      label: 'In Progress Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const idleNode: NodeData = {
      id: 'idle-1',
      label: 'Idle Task',
      type: 'TASK',
      status: 'IDLE',
      priority: 2,
      progress: 0,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const inProgressGraph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [inProgressNode],
      edges: [],
    };

    const idleGraph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [idleNode],
      edges: [],
    };

    const inProgressContext = ContextDetector.buildContext(inProgressNode, inProgressGraph);
    const idleContext = ContextDetector.buildContext(idleNode, idleGraph);

    const inProgressActions = actionRegistry.getActionsForContext(inProgressNode, inProgressContext);
    const idleActions = actionRegistry.getActionsForContext(idleNode, idleContext);

    // Both should have actions, but they might differ based on status
    expect(inProgressActions.length).toBeGreaterThan(0);
    expect(idleActions.length).toBeGreaterThan(0);

    // In progress tasks should have "mark-complete" or similar completion actions
    const hasCompletionActions = inProgressActions.some(a =>
      a.id === 'mark-complete' || a.category === 'state-change'
    );
    expect(hasCompletionActions).toBe(true);
  });

  it('should provide different actions for different node types', () => {
    const taskNode: NodeData = {
      id: 'task-1',
      label: 'Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
    };

    const fileNode: NodeData = {
      id: 'file-1',
      label: 'main.ts',
      type: 'FILE',
      status: 'IDLE',
      priority: 0,
      progress: 0,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: {
        created_at: '',
        updated_at: '',
        file_path: '/src/main.ts',
      },
    };

    const taskGraph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [taskNode],
      edges: [],
    };

    const fileGraph = {
      project: { id: 'test', name: 'Test', created_at: '', updated_at: '' },
      nodes: [fileNode],
      edges: [],
    };

    const taskContext = ContextDetector.buildContext(taskNode, taskGraph);
    const fileContext = ContextDetector.buildContext(fileNode, fileGraph);

    const taskActions = actionRegistry.getActionsForContext(taskNode, taskContext);
    const fileActions = actionRegistry.getActionsForContext(fileNode, fileContext);

    // Actions should be different for different node types
    const taskActionIds = taskActions.map(a => a.id);
    const fileActionIds = fileActions.map(a => a.id);

    // Should have some difference
    expect(taskActionIds).not.toEqual(fileActionIds);
  });
});

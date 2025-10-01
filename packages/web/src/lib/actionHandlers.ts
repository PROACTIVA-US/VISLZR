// Action Handlers - Implementation of sibling node actions
// Phase 1.2 - Action Registry & Context Detection

import type {
  NodeData,
  GraphContext,
  ActionResult,
  ActionHandler,
} from '@vislzr/shared';

/**
 * Handler for viewing node dependencies
 * Displays or highlights all dependency relationships
 */
export const handleViewDependencies: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    // Find all dependency edges for this node
    const dependencies = context.graphData.edges.filter((edge) => {
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      return (targetId === node.id || sourceId === node.id) && edge.type === 'dependency';
    });

    console.log(`Dependencies for ${node.label}:`, dependencies);

    // TODO: In future, this will trigger a focus mode or side panel
    // For now, just return success with data
    return {
      success: true,
      message: `Found ${dependencies.length} dependencies`,
      data: { dependencies },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to view dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for adding a new task as a child
 * Creates a new TASK node linked to the current node
 */
export const handleAddTask: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const label = prompt('Enter task name:');
    if (!label || label.trim() === '') {
      return { success: false, message: 'Task creation cancelled' };
    }

    const newNode: Partial<NodeData> = {
      id: `task-${Date.now()}`,
      label: label.trim(),
      type: 'TASK',
      status: 'IDLE',
      priority: 2,
      progress: 0,
      tags: ['task'],
      parent_id: node.id,
      dependencies: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    // TODO: Replace with actual API call when available
    if (context.apiClient?.addNode) {
      await context.apiClient.addNode(context.projectId, newNode);
      await context.apiClient.addEdge(context.projectId, {
        id: `edge-${Date.now()}`,
        source: node.id,
        target: newNode.id,
        type: 'parent',
        status: 'active',
      });
    } else {
      console.log('Would create task:', newNode);
    }

    return {
      success: true,
      message: `Task "${label}" created`,
      data: { newNode },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for marking a task/node as complete
 * Updates status to COMPLETED and progress to 100%
 */
export const handleMarkComplete: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const updates: Partial<NodeData> = {
      status: 'COMPLETED',
      progress: 100,
      metadata: {
        ...node.metadata,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    };

    // TODO: Replace with actual API call when available
    if (context.apiClient?.patchNode) {
      await context.apiClient.patchNode(context.projectId, node.id, updates);
    } else {
      console.log('Would update node:', node.id, updates);
    }

    return {
      success: true,
      message: `${node.label} marked as complete`,
      nodeUpdate: updates,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to mark complete: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for adding a note to a node
 * Creates a new NOTE node linked to the current node
 */
export const handleAddNote: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const text = prompt('Enter note text:');
    if (!text || text.trim() === '') {
      return { success: false, message: 'Note creation cancelled' };
    }

    const newNode: Partial<NodeData> = {
      id: `note-${Date.now()}`,
      label: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      type: 'NOTE',
      status: 'IDLE',
      priority: 1,
      progress: 100,
      tags: ['note'],
      parent_id: node.id,
      dependencies: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        fullText: text,
      },
    };

    // TODO: Replace with actual API call when available
    if (context.apiClient?.addNode) {
      await context.apiClient.addNode(context.projectId, newNode);
      await context.apiClient.addEdge(context.projectId, {
        id: `edge-${Date.now()}`,
        source: node.id,
        target: newNode.id,
        type: 'parent',
        status: 'active',
      });
    } else {
      console.log('Would create note:', newNode);
    }

    return {
      success: true,
      message: 'Note added',
      data: { newNode },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to add note: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for viewing node details
 * Opens a detail view or side panel with full node information
 */
export const handleViewDetails: ActionHandler = async (
  node: NodeData,
  _context: GraphContext
): Promise<ActionResult> => {
  try {
    // TODO: In future, this will open a side panel or modal
    // For now, just log the details
    console.log('Node details:', {
      id: node.id,
      label: node.label,
      type: node.type,
      status: node.status,
      priority: node.priority,
      progress: node.progress,
      tags: node.tags,
      metadata: node.metadata,
    });

    return {
      success: true,
      message: 'Viewing details',
      data: { node },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to view details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for starting a task
 * Updates status to IN_PROGRESS
 */
export const handleStartTask: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const updates: Partial<NodeData> = {
      status: 'IN_PROGRESS',
      metadata: {
        ...node.metadata,
        updated_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      },
    };

    // TODO: Replace with actual API call when available
    if (context.apiClient?.patchNode) {
      await context.apiClient.patchNode(context.projectId, node.id, updates);
    } else {
      console.log('Would update node:', node.id, updates);
    }

    return {
      success: true,
      message: `Started ${node.label}`,
      nodeUpdate: updates,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to start task: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for adding a child node (generic)
 * Creates a new node of type determined by user
 */
export const handleAddChild: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const label = prompt('Enter child node name:');
    if (!label || label.trim() === '') {
      return { success: false, message: 'Child creation cancelled' };
    }

    const newNode: Partial<NodeData> = {
      id: `node-${Date.now()}`,
      label: label.trim(),
      type: 'FOLDER',
      status: 'IDLE',
      priority: 2,
      progress: 0,
      tags: [],
      parent_id: node.id,
      dependencies: [],
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    // TODO: Replace with actual API call when available
    if (context.apiClient?.addNode) {
      await context.apiClient.addNode(context.projectId, newNode);
      await context.apiClient.addEdge(context.projectId, {
        id: `edge-${Date.now()}`,
        source: node.id,
        target: newNode.id,
        type: 'parent',
        status: 'active',
      });
    } else {
      console.log('Would create child:', newNode);
    }

    return {
      success: true,
      message: `Child node "${label}" created`,
      data: { newNode },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create child: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Handler for updating progress
 * Prompts user for progress percentage
 */
export const handleUpdateProgress: ActionHandler = async (
  node: NodeData,
  context: GraphContext
): Promise<ActionResult> => {
  try {
    const progressStr = prompt(`Enter progress (0-100) for ${node.label}:`, String(node.progress));
    if (!progressStr) {
      return { success: false, message: 'Progress update cancelled' };
    }

    const progress = parseInt(progressStr, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return { success: false, message: 'Invalid progress value (must be 0-100)' };
    }

    const updates: Partial<NodeData> = {
      progress,
      metadata: {
        ...node.metadata,
        updated_at: new Date().toISOString(),
      },
    };

    // Auto-complete if progress is 100
    if (progress === 100 && node.status !== 'COMPLETED') {
      updates.status = 'COMPLETED';
      updates.metadata!.completed_at = new Date().toISOString();
    }

    // TODO: Replace with actual API call when available
    if (context.apiClient?.patchNode) {
      await context.apiClient.patchNode(context.projectId, node.id, updates);
    } else {
      console.log('Would update node:', node.id, updates);
    }

    return {
      success: true,
      message: `Progress updated to ${progress}%`,
      nodeUpdate: updates,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

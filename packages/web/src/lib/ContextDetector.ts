// Context Detector - Analyzes nodes to build action context
// Phase 1.2 - Action Registry & Context Detection

import type {
  NodeData,
  GraphData,
  NodeType,
  NodeStatus,
  NodeContext,
} from '@vislzr/shared/types/actions';

/**
 * ContextDetector analyzes nodes and their relationships
 * to build context information for action filtering
 */
export class ContextDetector {
  /**
   * Build complete context for a node
   * Analyzes node properties and graph relationships
   */
  static buildContext(node: NodeData, graph: GraphData): NodeContext {
    return {
      nodeType: node.type || 'TASK',
      nodeStatus: node.status || 'IDLE',
      hasChildren: this.hasChildren(node.id, graph),
      hasParent: this.hasParent(node.id, graph),
      hasDependencies: this.hasDependencies(node.id, graph),
      isBlocked: this.isBlocked(node, graph),
      isOverdue: this.isOverdue(node),
      hasCode: Boolean(node.metadata?.code),
      metadata: node.metadata || {},
    };
  }

  /**
   * Check if node has any children
   * Looks for outgoing 'parent' edges
   */
  private static hasChildren(nodeId: string, graph: GraphData): boolean {
    return graph.edges.some(
      (edge) => {
        // Handle both string IDs and D3 node objects
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        return sourceId === nodeId && edge.type === 'parent';
      }
    );
  }

  /**
   * Check if node has a parent
   * Looks for incoming 'parent' edges or parent_id field
   */
  private static hasParent(nodeId: string, graph: GraphData): boolean {
    // Check parent_id field first
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (node?.parent_id) {
      return true;
    }

    // Check for incoming parent edges
    return graph.edges.some(
      (edge) => {
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return targetId === nodeId && edge.type === 'parent';
      }
    );
  }

  /**
   * Check if node has any dependencies
   * Looks for dependency edges in either direction
   */
  private static hasDependencies(nodeId: string, graph: GraphData): boolean {
    // Check dependencies array in node data
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (node?.dependencies && node.dependencies.length > 0) {
      return true;
    }

    // Check for dependency edges
    return graph.edges.some(
      (edge) => {
        if (edge.type !== 'dependency') return false;

        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

        return sourceId === nodeId || targetId === nodeId;
      }
    );
  }

  /**
   * Check if node is blocked
   * Based on status or blocked dependencies
   */
  private static isBlocked(node: NodeData, graph: GraphData): boolean {
    // Check node status
    if (node.status === 'BLOCKED') {
      return true;
    }

    // Check if any dependency edges are blocked
    const dependencyEdges = graph.edges.filter((edge) => {
      if (edge.type !== 'dependency') return false;

      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      return targetId === node.id;
    });

    return dependencyEdges.some((edge) => edge.status === 'blocked');
  }

  /**
   * Check if node is overdue
   * Based on status or due date
   */
  private static isOverdue(node: NodeData): boolean {
    // Check status
    if (node.status === 'OVERDUE' || node.status === 'AT_RISK') {
      return true;
    }

    // Check due date if available
    if (node.metadata?.due_date) {
      try {
        const dueDate = new Date(node.metadata.due_date);
        const now = new Date();
        return dueDate < now && node.status !== 'COMPLETED';
      } catch (error) {
        // Invalid date format
        return false;
      }
    }

    return false;
  }

  /**
   * Get all child nodes of a given node
   * Useful for bulk operations
   */
  static getChildren(nodeId: string, graph: GraphData): NodeData[] {
    const childIds = graph.edges
      .filter((edge) => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        return sourceId === nodeId && edge.type === 'parent';
      })
      .map((edge) => typeof edge.target === 'string' ? edge.target : edge.target.id);

    return graph.nodes.filter((node) => childIds.includes(node.id));
  }

  /**
   * Get all dependency nodes (nodes this node depends on)
   */
  static getDependencies(nodeId: string, graph: GraphData): NodeData[] {
    const node = graph.nodes.find((n) => n.id === nodeId);

    // Get from dependencies array
    let dependencyIds: string[] = node?.dependencies || [];

    // Also check dependency edges
    const edgeDependencies = graph.edges
      .filter((edge) => {
        if (edge.type !== 'dependency') return false;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return targetId === nodeId;
      })
      .map((edge) => typeof edge.source === 'string' ? edge.source : edge.source.id);

    // Combine and deduplicate
    dependencyIds = [...new Set([...dependencyIds, ...edgeDependencies])];

    return graph.nodes.filter((node) => dependencyIds.includes(node.id));
  }

  /**
   * Get all dependent nodes (nodes that depend on this node)
   */
  static getDependents(nodeId: string, graph: GraphData): NodeData[] {
    const dependentIds = graph.edges
      .filter((edge) => {
        if (edge.type !== 'dependency') return false;
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        return sourceId === nodeId;
      })
      .map((edge) => typeof edge.target === 'string' ? edge.target : edge.target.id);

    return graph.nodes.filter((node) => dependentIds.includes(node.id));
  }

  /**
   * Calculate completion percentage for a node with children
   * Useful for progress tracking
   */
  static calculateSubtreeProgress(nodeId: string, graph: GraphData): number {
    const children = this.getChildren(nodeId, graph);

    if (children.length === 0) {
      // No children, use node's own progress
      const node = graph.nodes.find((n) => n.id === nodeId);
      return node?.progress || 0;
    }

    // Calculate average progress of children
    const totalProgress = children.reduce((sum, child) => {
      return sum + (child.progress || 0);
    }, 0);

    return totalProgress / children.length;
  }

  /**
   * Check if a node is a leaf (has no children)
   */
  static isLeaf(nodeId: string, graph: GraphData): boolean {
    return !this.hasChildren(nodeId, graph);
  }

  /**
   * Check if a node is a root (has no parent)
   */
  static isRoot(nodeId: string, graph: GraphData): boolean {
    return !this.hasParent(nodeId, graph);
  }

  /**
   * Get depth of node in tree (distance from root)
   * Returns 0 for root nodes
   */
  static getDepth(nodeId: string, graph: GraphData): number {
    let depth = 0;
    let currentId = nodeId;
    const visited = new Set<string>();

    while (this.hasParent(currentId, graph)) {
      // Find parent
      const parentEdge = graph.edges.find((edge) => {
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return targetId === currentId && edge.type === 'parent';
      });

      if (!parentEdge) break;

      const parentId = typeof parentEdge.source === 'string'
        ? parentEdge.source
        : parentEdge.source.id;

      // Prevent infinite loops
      if (visited.has(parentId)) break;
      visited.add(parentId);

      currentId = parentId;
      depth++;
    }

    return depth;
  }
}

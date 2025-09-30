/**
 * Dependency analysis utilities.
 * Analyzes node dependencies for visualization.
 */
import type { NodeData, EdgeData } from '@/types/graph';

export interface DependencyPath {
  nodes: string[];
  isBlocking: boolean;
  depth: number;
}

export interface DependencyGraph {
  selectedNodeId: string;
  upstream: string[];       // Nodes this depends on
  downstream: string[];     // Nodes that depend on this
  blocking: string[];       // Blocking dependencies
  paths: DependencyPath[];  // All dependency paths
}

/**
 * Analyze dependencies for a selected node.
 */
export const analyzeDependencies = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[]
): DependencyGraph => {
  const upstream = findUpstreamDependencies(nodeId, edges);
  const downstream = findDownstreamDependents(nodeId, edges);
  const blocking = identifyBlockingDependencies(upstream, nodes);
  const paths = calculateDependencyPaths(nodeId, edges, nodes);

  return {
    selectedNodeId: nodeId,
    upstream,
    downstream,
    blocking,
    paths,
  };
};

/**
 * Find all upstream dependencies (what this node needs).
 * Recursively traverses dependency edges.
 */
export const findUpstreamDependencies = (
  nodeId: string,
  edges: EdgeData[],
  visited: Set<string> = new Set()
): string[] => {
  if (visited.has(nodeId)) {
    return []; // Prevent circular dependencies
  }

  visited.add(nodeId);
  const dependencies: string[] = [];

  // Find edges where this node is the target
  const incomingEdges = edges.filter(
    (edge) => edge.target === nodeId && edge.type === 'dependency'
  );

  for (const edge of incomingEdges) {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;

    if (!dependencies.includes(sourceId)) {
      dependencies.push(sourceId);

      // Recursively find dependencies of dependencies
      const nestedDeps = findUpstreamDependencies(sourceId, edges, visited);
      for (const dep of nestedDeps) {
        if (!dependencies.includes(dep)) {
          dependencies.push(dep);
        }
      }
    }
  }

  return dependencies;
};

/**
 * Find all downstream dependents (what needs this node).
 * Recursively traverses dependent edges.
 */
export const findDownstreamDependents = (
  nodeId: string,
  edges: EdgeData[],
  visited: Set<string> = new Set()
): string[] => {
  if (visited.has(nodeId)) {
    return []; // Prevent circular dependencies
  }

  visited.add(nodeId);
  const dependents: string[] = [];

  // Find edges where this node is the source
  const outgoingEdges = edges.filter(
    (edge) => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      return sourceId === nodeId && edge.type === 'dependency';
    }
  );

  for (const edge of outgoingEdges) {
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

    if (!dependents.includes(targetId)) {
      dependents.push(targetId);

      // Recursively find dependents of dependents
      const nestedDeps = findDownstreamDependents(targetId, edges, visited);
      for (const dep of nestedDeps) {
        if (!dependents.includes(dep)) {
          dependents.push(dep);
        }
      }
    }
  }

  return dependents;
};

/**
 * Identify blocking dependencies.
 * A dependency is blocking if it's not completed.
 */
export const identifyBlockingDependencies = (
  dependencies: string[],
  nodes: NodeData[]
): string[] => {
  const blocking: string[] = [];

  for (const depId of dependencies) {
    const node = nodes.find((n) => n.id === depId);
    if (node && node.status !== 'COMPLETED') {
      blocking.push(depId);
    }
  }

  return blocking;
};

/**
 * Calculate all dependency paths from selected node.
 */
export const calculateDependencyPaths = (
  nodeId: string,
  edges: EdgeData[],
  nodes: NodeData[]
): DependencyPath[] => {
  const paths: DependencyPath[] = [];

  // Find upstream paths
  const upstreamPaths = findPathsToRoots(nodeId, edges, nodes, 'upstream');
  paths.push(...upstreamPaths);

  // Find downstream paths
  const downstreamPaths = findPathsToLeaves(nodeId, edges, nodes, 'downstream');
  paths.push(...downstreamPaths);

  return paths;
};

/**
 * Find all paths from node to root dependencies.
 */
const findPathsToRoots = (
  nodeId: string,
  edges: EdgeData[],
  nodes: NodeData[],
  direction: 'upstream' | 'downstream',
  currentPath: string[] = [],
  visited: Set<string> = new Set()
): DependencyPath[] => {
  if (visited.has(nodeId)) {
    return []; // Circular dependency detected
  }

  visited.add(nodeId);
  currentPath.push(nodeId);

  const paths: DependencyPath[] = [];

  // Find dependencies
  const incomingEdges = edges.filter(
    (edge) => edge.target === nodeId && edge.type === 'dependency'
  );

  if (incomingEdges.length === 0) {
    // Reached a root, save path
    const node = nodes.find((n) => n.id === nodeId);
    const isBlocking = currentPath.some((id) => {
      const n = nodes.find((n) => n.id === id);
      return n && n.status !== 'COMPLETED';
    });

    paths.push({
      nodes: [...currentPath],
      isBlocking,
      depth: currentPath.length,
    });
  } else {
    // Continue traversing
    for (const edge of incomingEdges) {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const nestedPaths = findPathsToRoots(
        sourceId,
        edges,
        nodes,
        direction,
        [...currentPath],
        new Set(visited)
      );
      paths.push(...nestedPaths);
    }
  }

  return paths;
};

/**
 * Find all paths from node to leaf dependents.
 */
const findPathsToLeaves = (
  nodeId: string,
  edges: EdgeData[],
  nodes: NodeData[],
  direction: 'upstream' | 'downstream',
  currentPath: string[] = [],
  visited: Set<string> = new Set()
): DependencyPath[] => {
  if (visited.has(nodeId)) {
    return [];
  }

  visited.add(nodeId);
  currentPath.push(nodeId);

  const paths: DependencyPath[] = [];

  // Find dependents
  const outgoingEdges = edges.filter((edge) => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    return sourceId === nodeId && edge.type === 'dependency';
  });

  if (outgoingEdges.length === 0) {
    // Reached a leaf, save path
    const isBlocking = currentPath.some((id) => {
      const n = nodes.find((n) => n.id === id);
      return n && n.status !== 'COMPLETED';
    });

    paths.push({
      nodes: [...currentPath],
      isBlocking,
      depth: currentPath.length,
    });
  } else {
    // Continue traversing
    for (const edge of outgoingEdges) {
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      const nestedPaths = findPathsToLeaves(
        targetId,
        edges,
        nodes,
        direction,
        [...currentPath],
        new Set(visited)
      );
      paths.push(...nestedPaths);
    }
  }

  return paths;
};

/**
 * Check if there are circular dependencies.
 */
export const hasCircularDependencies = (
  nodeId: string,
  edges: EdgeData[]
): boolean => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (currentId: string): boolean => {
    visited.add(currentId);
    recursionStack.add(currentId);

    const outgoingEdges = edges.filter((edge) => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      return sourceId === currentId && edge.type === 'dependency';
    });

    for (const edge of outgoingEdges) {
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

      if (!visited.has(targetId)) {
        if (hasCycle(targetId)) {
          return true;
        }
      } else if (recursionStack.has(targetId)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(currentId);
    return false;
  };

  return hasCycle(nodeId);
};

/**
 * Get related nodes (upstream + downstream + selected).
 */
export const getRelatedNodes = (
  nodeId: string,
  edges: EdgeData[]
): string[] => {
  const upstream = findUpstreamDependencies(nodeId, edges);
  const downstream = findDownstreamDependents(nodeId, edges);

  return [nodeId, ...upstream, ...downstream];
};

/**
 * Get unrelated nodes (for dimming).
 */
export const getUnrelatedNodes = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[]
): string[] => {
  const related = new Set(getRelatedNodes(nodeId, edges));

  return nodes
    .map((n) => n.id)
    .filter((id) => !related.has(id));
};

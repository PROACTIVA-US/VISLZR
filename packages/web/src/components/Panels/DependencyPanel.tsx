/**
 * DependencyPanel - Shows upstream and downstream dependencies for a node
 * Phase 2.2: Action Handlers & View Integration
 *
 * Contract defined by GraphView:
 * - Props: node, graph, onClose, onZoomToFit
 * - Renders when: dependencyPanelOpen && selectedNode && graph
 * - Closes on: Esc key, close button, or onClose call
 */

import { useMemo } from 'react';
import type { NodeData, EdgeData, GraphData } from '@vislzr/shared';

interface DependencyPanelProps {
  node: NodeData;
  graph: GraphData;
  onClose: () => void;
  onZoomToFit: (nodeIds: string[]) => void;
}

interface DependencyGroup {
  nodeId: string;
  node: NodeData;
  edgeType: string;
  edgeKind?: string;
}

export function DependencyPanel({ node, graph, onClose, onZoomToFit }: DependencyPanelProps) {
  // Calculate upstream dependencies (nodes pointing TO this node)
  const upstream = useMemo(() => {
    const deps: DependencyGroup[] = [];

    graph.edges.forEach((edge: EdgeData) => {
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;

      if (targetId === node.id) {
        const sourceNode = graph.nodes.find(n => n.id === sourceId);
        if (sourceNode) {
          deps.push({
            nodeId: sourceId,
            node: sourceNode,
            edgeType: edge.type || 'dependency',
            edgeKind: edge.kind,
          });
        }
      }
    });

    return deps;
  }, [node.id, graph]);

  // Calculate downstream dependents (nodes this node points TO)
  const downstream = useMemo(() => {
    const deps: DependencyGroup[] = [];

    graph.edges.forEach((edge: EdgeData) => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

      if (sourceId === node.id) {
        const targetNode = graph.nodes.find(n => n.id === targetId);
        if (targetNode) {
          deps.push({
            nodeId: targetId,
            node: targetNode,
            edgeType: edge.type || 'dependency',
            edgeKind: edge.kind,
          });
        }
      }
    });

    return deps;
  }, [node.id, graph]);

  const handleZoomToFit = () => {
    const allDepIds = [
      ...upstream.map(d => d.nodeId),
      ...downstream.map(d => d.nodeId),
      node.id,
    ];
    onZoomToFit(allDepIds);
  };

  const getEdgeTypeLabel = (edgeType: string, edgeKind?: string): string => {
    if (edgeKind) {
      return edgeKind;
    }
    return edgeType;
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'IN_PROGRESS':
        return 'text-blue-400';
      case 'BLOCKED':
        return 'text-red-400';
      case 'AT_RISK':
        return 'text-orange-400';
      case 'OVERDUE':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-700 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-white">Dependencies</h2>
          <p className="text-xs text-gray-400">{node.label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Upstream Dependencies */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Upstream Dependencies ({upstream.length})
          </h3>
          <p className="text-xs text-gray-500 mb-3">Nodes this depends on</p>

          {upstream.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No upstream dependencies</p>
          ) : (
            <div className="space-y-2">
              {upstream.map((dep) => (
                <div
                  key={dep.nodeId}
                  className="p-3 bg-gray-800 border border-gray-700 rounded hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm text-white font-medium">{dep.node.label}</p>
                    <span className={`text-xs ${getStatusColor(dep.node.status)}`}>
                      {dep.node.status || 'IDLE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{dep.node.type || 'TASK'}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-blue-400">
                      {getEdgeTypeLabel(dep.edgeType, dep.edgeKind)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Dependents */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Downstream Dependents ({downstream.length})
          </h3>
          <p className="text-xs text-gray-500 mb-3">Nodes that depend on this</p>

          {downstream.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No downstream dependents</p>
          ) : (
            <div className="space-y-2">
              {downstream.map((dep) => (
                <div
                  key={dep.nodeId}
                  className="p-3 bg-gray-800 border border-gray-700 rounded hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm text-white font-medium">{dep.node.label}</p>
                    <span className={`text-xs ${getStatusColor(dep.node.status)}`}>
                      {dep.node.status || 'IDLE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">{dep.node.type || 'TASK'}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-blue-400">
                      {getEdgeTypeLabel(dep.edgeType, dep.edgeKind)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleZoomToFit}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={upstream.length === 0 && downstream.length === 0}
          aria-label="Zoom to fit dependency subgraph"
        >
          Zoom to Fit
        </button>
      </div>
    </div>
  );
}

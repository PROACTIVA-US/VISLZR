import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { NodeData, EdgeData } from '@/types/graph';
import type { SiblingAction } from '@/types/action';
import { getNodeColor, getNodeBorderColor, shouldNodePulse } from '@/utils/nodeColors';
import { SiblingNodes } from './SiblingNodes';
import { DependencyFocusMode } from './DependencyFocusMode';
import { useSiblingLifecycle } from '@/hooks/useSiblingLifecycle';
import { useDependencyFocus } from '@/hooks/useDependencyFocus';
import { actionsApi } from '@/api/actions';

interface CanvasProps {
  nodes: NodeData[];
  edges: EdgeData[];
  projectId: string;
  onNodeClick?: (node: NodeData) => void;
  onNodeDrag?: (nodeId: string, x: number, y: number) => void;
  selectedNodeId?: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  projectId,
  onNodeClick,
  onNodeDrag,
  selectedNodeId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeData, EdgeData> | null>(null);
  const siblingsGroupRef = useRef<SVGGElement | null>(null);

  // Get selected node data
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Use sibling lifecycle hook
  const {
    actions: siblingActions,
    isVisible: siblingsVisible,
    refreshActions,
  } = useSiblingLifecycle({
    projectId,
    selectedNodeId,
    autoHideDelay: 10000, // 10 seconds
  });

  // Use dependency focus hook
  const {
    isFocusMode,
    dependencyGraph,
    enterFocusMode,
    exitFocusMode,
  } = useDependencyFocus({
    selectedNodeId,
    nodes,
    edges,
  });

  // Handle sibling action clicks
  const handleSiblingActionClick = async (action: SiblingAction) => {
    if (!selectedNodeId) return;

    // Handle "view-dependencies" action locally (no API call)
    if (action.id === 'view-dependencies') {
      enterFocusMode();
      return;
    }

    try {
      // Execute other actions via API
      const result = await actionsApi.executeAction(
        projectId,
        selectedNodeId,
        action.id
      );

      console.log('Action executed:', result);

      // Refresh actions (context may have changed)
      await refreshActions();

      // TODO: Show result to user (toast notification, modal, etc.)
    } catch (err) {
      console.error('Failed to execute action:', err);
      // TODO: Show error to user
    }
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous render
    svg.selectAll('*').remove();

    // Create container groups
    const g = svg.append('g');
    const edgesGroup = g.append('g').attr('class', 'edges');
    const nodesGroup = g.append('g').attr('class', 'nodes');
    const siblingsGroup = g.append('g').attr('class', 'siblings');
    siblingsGroupRef.current = siblingsGroup.node();

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Create a copy of nodes and edges for D3
    const nodesCopy = nodes.map((d) => ({ ...d }));
    const edgesCopy = edges.map((d) => ({ ...d }));

    // Force simulation
    const simulation = d3
      .forceSimulation(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<NodeData, EdgeData>(edgesCopy)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<NodeData>().radius((d) => 30 + d.priority * 8)
      );

    simulationRef.current = simulation;

    // Render edges
    const edgeElements = edgesGroup
      .selectAll<SVGLineElement, EdgeData>('line')
      .data(edgesCopy)
      .join('line')
      .attr('stroke', (d) => {
        if (d.type === 'dependency' && d.status === 'blocked') return '#EF4444';
        if (d.type === 'dependency' && d.status === 'met') return '#3B82F6';
        return '#6B7280';
      })
      .attr('stroke-width', (d) => {
        if (d.type === 'dependency' && d.status === 'blocked') return 3;
        return 2;
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => (d.type === 'reference' ? '5,5' : ''));

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, NodeData>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        if (onNodeDrag && d.x !== undefined && d.y !== undefined) {
          onNodeDrag(d.id, d.x, d.y);
        }
      });

    // Render nodes
    const nodeElements = nodesGroup
      .selectAll<SVGGElement, NodeData>('g')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node')
      .call(drag)
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d);
      });

    // Node circles
    nodeElements
      .append('circle')
      .attr('r', (d) => 25 + d.priority * 5)
      .attr('fill', (d) => getNodeColor(d.status))
      .attr('stroke', (d) => getNodeBorderColor(d.status))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 4 : 3))
      .attr('class', (d) => (shouldNodePulse(d.status) ? 'animate-pulse-error' : ''))
      .style('cursor', 'pointer');

    // Node labels
    nodeElements
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    // Status indicator (small circle)
    nodeElements
      .append('circle')
      .attr('r', 6)
      .attr('cx', (d) => 20 + d.priority * 5)
      .attr('cy', (d) => -(20 + d.priority * 5))
      .attr('fill', (d) => {
        if (d.status === 'COMPLETED') return '#10B981';
        if (d.status === 'ERROR' || d.status === 'BLOCKED') return '#EF4444';
        if (d.status === 'IN_PROGRESS') return '#3B82F6';
        return '#6B7280';
      })
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 2);

    // Update positions on tick
    simulation.on('tick', () => {
      edgeElements
        .attr('x1', (d) => (d.source as NodeData).x || 0)
        .attr('y1', (d) => (d.source as NodeData).y || 0)
        .attr('x2', (d) => (d.target as NodeData).x || 0)
        .attr('y2', (d) => (d.target as NodeData).y || 0);

      nodeElements.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, onNodeClick, onNodeDrag, selectedNodeId]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      style={{ cursor: 'grab' }}
    >
      {/* Render sibling nodes using React Portal-like approach */}
      {selectedNode && siblingsGroupRef.current && (
        <foreignObject x="0" y="0" width="100%" height="100%" pointerEvents="none">
          <div style={{ pointerEvents: 'none' }}>
            <svg
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}
            >
              <SiblingNodes
                parentNode={selectedNode}
                actions={siblingActions}
                onActionClick={handleSiblingActionClick}
                layout="arc"
                visible={siblingsVisible}
              />
            </svg>
          </div>
        </foreignObject>
      )}

      {/* Render dependency focus mode overlay */}
      {isFocusMode && selectedNode && dependencyGraph && svgRef.current && (
        <DependencyFocusMode
          selectedNode={selectedNode}
          dependencyGraph={dependencyGraph}
          nodes={nodes}
          edges={edges}
          svgElement={svgRef.current}
          onExit={exitFocusMode}
        />
      )}
    </svg>
  );
};
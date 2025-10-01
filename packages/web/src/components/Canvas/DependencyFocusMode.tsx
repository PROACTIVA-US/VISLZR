/**
 * Dependency focus mode visualization.
 * Dims unrelated nodes and highlights dependency chains.
 */
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { NodeData, EdgeData } from '@vislzr/shared';
import type { DependencyGraph } from '@/utils/dependencyAnalysis';

interface DependencyFocusModeProps {
  selectedNode: NodeData;
  dependencyGraph: DependencyGraph;
  nodes: NodeData[];
  edges: EdgeData[];
  svgElement: SVGSVGElement;
  onExit: () => void;
}

const COLORS = {
  dimmed: 0.2,                    // Opacity for unrelated nodes
  selected: '#FBBF24',            // Yellow glow for selected
  upstream: '#3B82F6',            // Blue for dependencies
  downstream: '#10B981',          // Green for dependents
  blocking: '#EF4444',            // Red for blocking
};

export const DependencyFocusMode: React.FC<DependencyFocusModeProps> = ({
  selectedNode,
  dependencyGraph,
  nodes,
  edges,
  svgElement,
  onExit,
}) => {
  const overlayRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!svgElement) return;

    const svg = d3.select(svgElement);

    // Get related node IDs
    const upstreamSet = new Set(dependencyGraph.upstream);
    const downstreamSet = new Set(dependencyGraph.downstream);
    const blockingSet = new Set(dependencyGraph.blocking);

    // Dim unrelated nodes
    svg.selectAll<SVGGElement, NodeData>('g.node')
      .transition()
      .duration(300)
      .attr('opacity', (d) => {
        if (d.id === selectedNode.id) return 1;
        if (upstreamSet.has(d.id) || downstreamSet.has(d.id)) return 1;
        return COLORS.dimmed;
      });

    // Dim unrelated edges
    svg.selectAll<SVGLineElement, EdgeData>('line')
      .transition()
      .duration(300)
      .attr('opacity', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;

        // Check if edge is part of dependency chain
        const isUpstream =
          targetId === selectedNode.id && upstreamSet.has(sourceId);
        const isDownstream =
          sourceId === selectedNode.id && downstreamSet.has(targetId);
        const isChainLink =
          (upstreamSet.has(sourceId) && upstreamSet.has(targetId)) ||
          (downstreamSet.has(sourceId) && downstreamSet.has(targetId));

        return (isUpstream || isDownstream || isChainLink) ? 1 : COLORS.dimmed;
      });

    // Highlight selected node
    svg.selectAll<SVGCircleElement, NodeData>('g.node circle')
      .transition()
      .duration(300)
      .attr('stroke', (d) => {
        if (d.id === selectedNode.id) return COLORS.selected;
        if (blockingSet.has(d.id)) return COLORS.blocking;
        if (upstreamSet.has(d.id)) return COLORS.upstream;
        if (downstreamSet.has(d.id)) return COLORS.downstream;
        return null; // Use default
      })
      .attr('stroke-width', (d) => {
        if (d.id === selectedNode.id) return 6;
        if (upstreamSet.has(d.id) || downstreamSet.has(d.id)) return 4;
        return 3;
      })
      .style('filter', (d) => {
        if (d.id === selectedNode.id) {
          return 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))';
        }
        return null;
      });

    // Color and thicken dependency edges
    svg.selectAll<SVGLineElement, EdgeData>('line')
      .transition()
      .duration(300)
      .attr('stroke', (d) => {
        if (d.kind !== 'depends') return null;

        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;

        // Upstream (blue)
        if (targetId === selectedNode.id && upstreamSet.has(sourceId)) {
          return blockingSet.has(sourceId) ? COLORS.blocking : COLORS.upstream;
        }

        // Downstream (green)
        if (sourceId === selectedNode.id && downstreamSet.has(targetId)) {
          return COLORS.downstream;
        }

        // Chain links
        if (upstreamSet.has(sourceId) && upstreamSet.has(targetId)) {
          const isBlocking = blockingSet.has(sourceId) || blockingSet.has(targetId);
          return isBlocking ? COLORS.blocking : COLORS.upstream;
        }

        if (downstreamSet.has(sourceId) && downstreamSet.has(targetId)) {
          return COLORS.downstream;
        }

        return null;
      })
      .attr('stroke-width', (d) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;

        const isRelevant =
          (targetId === selectedNode.id && upstreamSet.has(sourceId)) ||
          (sourceId === selectedNode.id && downstreamSet.has(targetId)) ||
          (upstreamSet.has(sourceId) && upstreamSet.has(targetId)) ||
          (downstreamSet.has(sourceId) && downstreamSet.has(targetId));

        return isRelevant ? 4 : 2;
      });

    // Animate blocking dependencies (pulse)
    const blockingNodes = svg.selectAll<SVGCircleElement, NodeData>('g.node circle')
      .filter((d) => blockingSet.has(d.id));

    const pulse = () => {
      blockingNodes
        .transition()
        .duration(800)
        .attr('stroke-width', 6)
        .transition()
        .duration(800)
        .attr('stroke-width', 4)
        .on('end', pulse);
    };

    if (blockingSet.size > 0) {
      pulse();
    }

    // Create overlay for exit instruction
    const overlay = svg.append('g')
      .attr('class', 'dependency-focus-overlay')
      .style('pointer-events', 'none');

    overlayRef.current = overlay.node();

    // Add exit instruction text
    overlay.append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 250)
      .attr('height', 60)
      .attr('rx', 8)
      .attr('fill', 'rgba(17, 24, 39, 0.95)')
      .attr('stroke', '#374151')
      .attr('stroke-width', 2);

    overlay.append('text')
      .attr('x', 20)
      .attr('y', 35)
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('Dependency Focus Mode');

    overlay.append('text')
      .attr('x', 20)
      .attr('y', 55)
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text('Press ESC or click canvas to exit');

    // Add legend
    const legend = overlay.append('g')
      .attr('transform', 'translate(10, 90)');

    const legendItems = [
      { color: COLORS.upstream, label: 'Dependencies (what this needs)' },
      { color: COLORS.downstream, label: 'Dependents (what needs this)' },
      { color: COLORS.blocking, label: 'Blocking (incomplete)' },
    ];

    legendItems.forEach((item, i) => {
      const y = i * 25;

      legend.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', 280)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', 'rgba(17, 24, 39, 0.95)')
        .attr('stroke', '#374151')
        .attr('stroke-width', 1);

      legend.append('line')
        .attr('x1', 10)
        .attr('y1', y + 10)
        .attr('x2', 30)
        .attr('y2', y + 10)
        .attr('stroke', item.color)
        .attr('stroke-width', 3);

      legend.append('text')
        .attr('x', 40)
        .attr('y', y + 14)
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(item.label);
    });

    // Cleanup function
    return () => {
      // Restore node opacity
      svg.selectAll<SVGGElement, NodeData>('g.node')
        .transition()
        .duration(300)
        .attr('opacity', 1);

      // Restore edge opacity
      svg.selectAll<SVGLineElement, EdgeData>('line')
        .transition()
        .duration(300)
        .attr('opacity', 0.6);

      // Restore node styles
      svg.selectAll<SVGCircleElement, NodeData>('g.node circle')
        .interrupt() // Stop pulse animation
        .transition()
        .duration(300)
        .attr('stroke', null)
        .attr('stroke-width', 3)
        .style('filter', null);

      // Restore edge styles
      svg.selectAll<SVGLineElement, EdgeData>('line')
        .transition()
        .duration(300)
        .attr('stroke', null)
        .attr('stroke-width', 2);

      // Remove overlay
      if (overlayRef.current) {
        d3.select(overlayRef.current).remove();
      }
    };
  }, [selectedNode, dependencyGraph, nodes, edges, svgElement, onExit]);

  // Handle canvas click to exit
  useEffect(() => {
    if (!svgElement) return;

    const handleClick = (event: MouseEvent) => {
      // Check if clicked on canvas background (not a node)
      const target = event.target as SVGElement;
      if (target.tagName === 'svg' || target.classList.contains('edges')) {
        onExit();
      }
    };

    svgElement.addEventListener('click', handleClick);

    return () => {
      svgElement.removeEventListener('click', handleClick);
    };
  }, [svgElement, onExit]);

  return null; // This component only manipulates D3 elements
};

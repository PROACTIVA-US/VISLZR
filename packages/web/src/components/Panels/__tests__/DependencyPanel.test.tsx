/**
 * DependencyPanel Unit Tests
 * Phase 2.2: Action Handlers & View Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DependencyPanel } from '../DependencyPanel';
import type { NodeData, GraphData } from '@vislzr/shared';

describe('DependencyPanel', () => {
  const mockNode: NodeData = {
    id: 'node-1',
    label: 'Test Node',
    type: 'TASK',
    status: 'IN_PROGRESS',
  };

  const mockGraph: GraphData = {
    project: {
      id: 'test-project',
      name: 'Test Project',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    nodes: [
      mockNode,
      { id: 'node-2', label: 'Upstream Node 1', type: 'TASK', status: 'COMPLETED' },
      { id: 'node-3', label: 'Upstream Node 2', type: 'SERVICE', status: 'RUNNING' },
      { id: 'node-4', label: 'Downstream Node 1', type: 'TASK', status: 'IDLE' },
      { id: 'node-5', label: 'Downstream Node 2', type: 'TASK', status: 'BLOCKED' },
    ],
    edges: [
      // Upstream: nodes pointing TO mockNode
      { source: 'node-2', target: 'node-1', type: 'dependency', kind: 'depends' },
      { source: 'node-3', target: 'node-1', type: 'dependency', kind: 'depends' },
      // Downstream: nodes mockNode points TO
      { source: 'node-1', target: 'node-4', type: 'dependency', kind: 'subtask' },
      { source: 'node-1', target: 'node-5', type: 'dependency', kind: 'relates' },
    ],
  };

  const mockOnClose = vi.fn();
  const mockOnZoomToFit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with node and graph data', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('should display upstream dependencies section', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText(/Upstream Dependencies \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Nodes this depends on/)).toBeInTheDocument();
    });

    it('should display downstream dependents section', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText(/Downstream Dependents \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Nodes that depend on this/)).toBeInTheDocument();
    });

    it('should list all upstream dependencies', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('Upstream Node 1')).toBeInTheDocument();
      expect(screen.getByText('Upstream Node 2')).toBeInTheDocument();
    });

    it('should list all downstream dependents', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('Downstream Node 1')).toBeInTheDocument();
      expect(screen.getByText('Downstream Node 2')).toBeInTheDocument();
    });

    it('should display edge types/kinds', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const dependsElements = screen.getAllByText('depends');
      expect(dependsElements.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('subtask')).toBeInTheDocument();
      expect(screen.getByText('relates')).toBeInTheDocument();
    });

    it('should display node statuses', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('RUNNING')).toBeInTheDocument();
      expect(screen.getByText('IDLE')).toBeInTheDocument();
      expect(screen.getByText('BLOCKED')).toBeInTheDocument();
    });

    it('should display node types', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const taskElements = screen.getAllByText('TASK');
      expect(taskElements.length).toBeGreaterThan(0);
      expect(screen.getByText('SERVICE')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show message when no upstream dependencies', () => {
      const graphWithNoUpstream: GraphData = {
        project: mockGraph.project,
        nodes: [mockNode],
        edges: [],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithNoUpstream}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText(/Upstream Dependencies \(0\)/)).toBeInTheDocument();
      expect(screen.getByText('No upstream dependencies')).toBeInTheDocument();
    });

    it('should show message when no downstream dependents', () => {
      const graphWithNoDownstream: GraphData = {
        project: mockGraph.project,
        nodes: [mockNode],
        edges: [],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithNoDownstream}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText(/Downstream Dependents \(0\)/)).toBeInTheDocument();
      expect(screen.getByText('No downstream dependents')).toBeInTheDocument();
    });

    it('should disable zoom button when no dependencies', () => {
      const graphWithNoDeps: GraphData = {
        project: mockGraph.project,
        nodes: [mockNode],
        edges: [],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithNoDeps}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const zoomButton = screen.getByLabelText('Zoom to fit dependency subgraph');
      expect(zoomButton).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const closeButton = screen.getByLabelText('Close panel');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onZoomToFit with all dependency node IDs', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const zoomButton = screen.getByLabelText('Zoom to fit dependency subgraph');
      fireEvent.click(zoomButton);

      expect(mockOnZoomToFit).toHaveBeenCalledTimes(1);
      const calledWith = mockOnZoomToFit.mock.calls[0][0];
      expect(calledWith).toContain('node-1'); // The selected node
      expect(calledWith).toContain('node-2'); // Upstream 1
      expect(calledWith).toContain('node-3'); // Upstream 2
      expect(calledWith).toContain('node-4'); // Downstream 1
      expect(calledWith).toContain('node-5'); // Downstream 2
    });
  });

  describe('Edge Cases', () => {
    it('should handle D3 node objects in edges', () => {
      const graphWithD3Objects: GraphData = {
        project: mockGraph.project,
        nodes: [
          mockNode,
          { id: 'node-2', label: 'Test Node 2', type: 'TASK' },
        ],
        edges: [
          {
            source: { id: 'node-2' } as any,
            target: { id: 'node-1' } as any,
            type: 'dependency',
          },
        ],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithD3Objects}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('Test Node 2')).toBeInTheDocument();
      expect(screen.getByText(/Upstream Dependencies \(1\)/)).toBeInTheDocument();
    });

    it('should handle edges without type field', () => {
      const graphWithoutTypes: GraphData = {
        project: mockGraph.project,
        nodes: [
          mockNode,
          { id: 'node-2', label: 'Test Node 2', type: 'TASK' },
        ],
        edges: [
          { source: 'node-2', target: 'node-1' },
        ],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithoutTypes}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText(/Upstream Dependencies \(1\)/)).toBeInTheDocument();
      expect(screen.getByText('dependency')).toBeInTheDocument(); // Default type
    });

    it('should handle nodes without status', () => {
      const graphWithoutStatus: GraphData = {
        project: mockGraph.project,
        nodes: [
          mockNode,
          { id: 'node-2', label: 'Test Node 2', type: 'TASK' },
        ],
        edges: [
          { source: 'node-2', target: 'node-1', type: 'dependency' },
        ],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithoutStatus}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      expect(screen.getByText('Test Node 2')).toBeInTheDocument();
      // Should show default status
      const idleElements = screen.getAllByText('IDLE');
      expect(idleElements.length).toBeGreaterThan(0);
    });

    it('should handle missing target nodes in edges', () => {
      const graphWithMissingNode: GraphData = {
        project: mockGraph.project,
        nodes: [mockNode],
        edges: [
          { source: 'node-999', target: 'node-1', type: 'dependency' },
        ],
      };

      render(
        <DependencyPanel
          node={mockNode}
          graph={graphWithMissingNode}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      // Should not crash, should show 0 dependencies
      expect(screen.getByText(/Upstream Dependencies \(0\)/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const closeButton = screen.getByLabelText('Close panel');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have accessible zoom button', () => {
      render(
        <DependencyPanel
          node={mockNode}
          graph={mockGraph}
          onClose={mockOnClose}
          onZoomToFit={mockOnZoomToFit}
        />
      );

      const zoomButton = screen.getByLabelText('Zoom to fit dependency subgraph');
      expect(zoomButton).toBeInTheDocument();
    });
  });
});

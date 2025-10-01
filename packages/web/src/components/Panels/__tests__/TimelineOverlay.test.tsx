/**
 * TimelineOverlay Unit Tests
 * Phase 2.2: Action Handlers & View Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineOverlay } from '../TimelineOverlay';
import type { NodeData } from '@vislzr/shared';

describe('TimelineOverlay', () => {
  const mockNodes: NodeData[] = [
    {
      id: 'node-1',
      label: 'First Task',
      type: 'TASK',
      status: 'COMPLETED',
      metadata: {
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      id: 'node-2',
      label: 'Second Task',
      type: 'TASK',
      status: 'IN_PROGRESS',
      metadata: {
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
      },
    },
    {
      id: 'node-3',
      label: 'Project Milestone',
      type: 'MILESTONE',
      status: 'PLANNED',
      metadata: {
        created_at: '2025-02-01T00:00:00Z',
        updated_at: '2025-02-01T00:00:00Z',
      },
    },
    {
      id: 'node-4',
      label: 'Third Task',
      type: 'TASK',
      status: 'BLOCKED',
      metadata: {
        created_at: '2025-02-15T00:00:00Z',
        updated_at: '2025-02-15T00:00:00Z',
      },
    },
    {
      id: 'node-5',
      label: 'Service Component',
      type: 'SERVICE',
      status: 'RUNNING',
      metadata: {
        created_at: '2025-03-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
      },
    },
  ];

  const mockOnNodeSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with all nodes', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText(/5 of 5 nodes/)).toBeInTheDocument();
    });

    it('should display filter controls', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/Status:/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type:/)).toBeInTheDocument();
      expect(screen.getByLabelText(/From:/)).toBeInTheDocument();
      expect(screen.getByLabelText(/To:/)).toBeInTheDocument();
    });

    it('should render milestone markers', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Project Milestone')).toBeInTheDocument();
    });

    it('should display timeline date range', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      // Should show start and end dates (in locale format)
      const dateElements = screen.getAllByText(/2025/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    it('should filter by status', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const statusSelect = screen.getByLabelText(/Status:/);
      fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });

      // Should show filtered count
      expect(screen.getByText(/1 of 5 nodes/)).toBeInTheDocument();
    });

    it('should filter by type', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const typeSelect = screen.getByLabelText(/Type:/);
      fireEvent.change(typeSelect, { target: { value: 'TASK' } });

      // 3 tasks in mockNodes
      expect(screen.getByText(/3 of 5 nodes/)).toBeInTheDocument();
    });

    it('should filter by date range start', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const dateStartInput = screen.getByLabelText(/From:/);
      fireEvent.change(dateStartInput, { target: { value: '2025-02-01' } });

      // Should filter out nodes before 2025-02-01 (node-1 and node-2)
      expect(screen.getByText(/3 of 5 nodes/)).toBeInTheDocument();
    });

    it('should filter by date range end', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const dateEndInput = screen.getByLabelText(/To:/);
      fireEvent.change(dateEndInput, { target: { value: '2025-01-31' } });

      // Should filter out nodes after 2025-01-31
      expect(screen.getByText(/2 of 5 nodes/)).toBeInTheDocument();
    });

    it('should reset all filters when reset clicked', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      // Apply filters
      const statusSelect = screen.getByLabelText(/Status:/);
      fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } });

      expect(screen.getByText(/1 of 5 nodes/)).toBeInTheDocument();

      // Reset
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      expect(screen.getByText(/5 of 5 nodes/)).toBeInTheDocument();
    });

    it('should combine multiple filters', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      // Filter by type TASK and status COMPLETED
      const typeSelect = screen.getByLabelText(/Type:/);
      fireEvent.change(typeSelect, { target: { value: 'TASK' } });

      const statusSelect = screen.getByLabelText(/Status:/);
      fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } });

      // Only node-1 matches both filters
      expect(screen.getByText(/1 of 5 nodes/)).toBeInTheDocument();
    });
  });

  describe('Node Selection', () => {
    it('should call onNodeSelect when node clicked', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const nodeButton = screen.getByLabelText('Select node: First Task');
      fireEvent.click(nodeButton);

      expect(mockOnNodeSelect).toHaveBeenCalledTimes(1);
      expect(mockOnNodeSelect).toHaveBeenCalledWith(mockNodes[0]);
    });

    it('should highlight selected node', () => {
      render(
        <TimelineOverlay
          selectedNode={mockNodes[0]}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const nodeButton = screen.getByLabelText('Select node: First Task');
      // Check for selection styling
      expect(nodeButton.className).toContain('scale-150');
    });
  });

  describe('Empty States', () => {
    it('should show message when no nodes match filters', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const statusSelect = screen.getByLabelText(/Status:/);
      fireEvent.change(statusSelect, { target: { value: 'OVERDUE' } });

      expect(screen.getByText('No nodes match the current filters')).toBeInTheDocument();
    });

    it('should handle empty nodes array', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={[]}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/0 of 0 nodes/)).toBeInTheDocument();
      expect(screen.getByText('No nodes match the current filters')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close timeline');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle nodes without metadata', () => {
      const nodesWithoutMetadata: NodeData[] = [
        { id: 'node-1', label: 'Node 1', type: 'TASK' },
        { id: 'node-2', label: 'Node 2', type: 'TASK' },
      ];

      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={nodesWithoutMetadata}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/2 of 2 nodes/)).toBeInTheDocument();
    });

    it('should handle nodes with same timestamp', () => {
      const sameTimeNodes: NodeData[] = [
        {
          id: 'node-1',
          label: 'Node 1',
          type: 'TASK',
          metadata: { created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        },
        {
          id: 'node-2',
          label: 'Node 2',
          type: 'TASK',
          metadata: { created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        },
      ];

      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={sameTimeNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      // Should render without crashing
      expect(screen.getByText(/2 of 2 nodes/)).toBeInTheDocument();
    });

    it('should handle nodes with due_date instead of created_at', () => {
      const dueDateNodes: NodeData[] = [
        {
          id: 'node-1',
          label: 'Node 1',
          type: 'TASK',
          metadata: { due_date: '2025-12-31T23:59:59Z', updated_at: '2025-01-01T00:00:00Z' },
        },
      ];

      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={dueDateNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/1 of 1 nodes/)).toBeInTheDocument();
    });

    it('should not render milestone nodes as regular markers', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      // Milestone should be rendered as text, not as a clickable button
      expect(screen.getByText('Project Milestone')).toBeInTheDocument();
      expect(screen.queryByLabelText('Select node: Project Milestone')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close timeline');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have accessible node buttons', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const nodeButton = screen.getByLabelText('Select node: First Task');
      expect(nodeButton).toBeInTheDocument();
    });

    it('should have proper htmlFor labels on filters', () => {
      render(
        <TimelineOverlay
          selectedNode={null}
          allNodes={mockNodes}
          onNodeSelect={mockOnNodeSelect}
          onClose={mockOnClose}
        />
      );

      const statusLabel = screen.getByText(/Status:/);
      expect(statusLabel).toHaveAttribute('for', 'filter-status');

      const typeLabel = screen.getByText(/Type:/);
      expect(typeLabel).toHaveAttribute('for', 'filter-type');

      const fromLabel = screen.getByText(/From:/);
      expect(fromLabel).toHaveAttribute('for', 'date-start');

      const toLabel = screen.getByText(/To:/);
      expect(toLabel).toHaveAttribute('for', 'date-end');
    });
  });
});

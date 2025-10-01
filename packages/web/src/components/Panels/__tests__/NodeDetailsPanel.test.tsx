/**
 * NodeDetailsPanel Unit Tests
 * Phase 2.2: Action Handlers & View Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NodeDetailsPanel } from '../NodeDetailsPanel';
import type { NodeData } from '@vislzr/shared';

describe('NodeDetailsPanel', () => {
  const mockNode: NodeData = {
    id: 'test-node-1',
    label: 'Test Node',
    type: 'TASK',
    status: 'IN_PROGRESS',
    priority: 2,
    progress: 0.5,
    tags: ['test', 'feature'],
    metadata: {
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      description: 'Test description',
      due_date: '2025-12-31T23:59:59Z',
      assignee: 'John Doe',
    },
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with node data', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Node Details')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
      expect(screen.getByText(/ID: test-node-1/)).toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Progress/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    });

    it('should display metadata section', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Metadata')).toBeInTheDocument();
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
      expect(screen.getByText(/Due:/)).toBeInTheDocument();
      expect(screen.getByText(/Assignee:/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should show progress bar with correct value', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/Progress \(50%\)/)).toBeInTheDocument();
    });
  });

  describe('Editing', () => {
    it('should detect unsaved changes when editing', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      await waitFor(() => {
        expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();
      });
    });

    it('should enable save button when there are changes', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      expect(saveButton).toBeDisabled();

      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should call onUpdate with correct data when saving', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Change name
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Change status
      const statusSelect = screen.getByLabelText(/Status/i);
      fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('test-node-1', {
          label: 'Updated Name',
          status: 'COMPLETED',
        });
      });
    });

    it('should update progress correctly', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const progressSlider = screen.getByLabelText(/Progress/i);
      fireEvent.change(progressSlider, { target: { value: '75' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('test-node-1', {
          progress: 0.75,
        });
      });
    });

    it('should parse tags correctly', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const tagsInput = screen.getByLabelText(/Tags/i);
      fireEvent.change(tagsInput, { target: { value: 'new, tags, here' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('test-node-1', {
          tags: ['new', 'tags', 'here'],
        });
      });
    });

    it('should update description in metadata', async () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const descInput = screen.getByLabelText(/Description/i);
      fireEvent.change(descInput, { target: { value: 'New description' } });

      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('test-node-1', {
          metadata: {
            ...mockNode.metadata,
            description: 'New description',
          },
        });
      });
    });
  });

  describe('Closing', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const closeButton = screen.getByLabelText(/Close panel/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked with no changes', () => {
      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show confirmation when closing with unsaved changes', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Make a change
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'Changed' } });

      // Try to close
      const closeButton = screen.getByLabelText(/Close panel/i);
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });

      expect(mockOnClose).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when save fails', async () => {
      const mockOnUpdateError = vi.fn().mockRejectedValue(new Error('Save failed'));

      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={mockOnUpdateError}
        />
      );

      // Make a change
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
      });
    });

    it('should show saving state while saving', async () => {
      const slowUpdate = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <NodeDetailsPanel
          projectId="test-project"
          node={mockNode}
          onClose={mockOnClose}
          onUpdate={slowUpdate}
        />
      );

      // Make a change
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });
  });
});

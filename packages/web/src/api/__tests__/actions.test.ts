/**
 * Unit tests for sibling actions API client.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actionsApi } from '../actions';
import { apiClient } from '../client';
import type { SiblingAction, ActionExecutionResult, ActionHistoryEntry } from '@/types/action';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('actionsApi', () => {
  const mockProjectId = 'project-123';
  const mockNodeId = 'node-456';
  const mockActionId = 'action-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActions', () => {
    it('should fetch actions for a node', async () => {
      const mockActions: SiblingAction[] = [
        {
          id: 'add-task',
          label: 'Add Task',
          icon: '✓',
          type: 'create',
          category: 'foundational',
          handler: 'addTask',
          requires_context: false,
          ai_powered: false,
          priority: 1,
        },
        {
          id: 'view-details',
          label: 'View Details',
          icon: '👁',
          type: 'view',
          category: 'foundational',
          handler: 'viewDetails',
          requires_context: false,
          ai_powered: false,
          priority: 2,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockActions });

      const result = await actionsApi.getActions(mockProjectId, mockNodeId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions`
      );
      expect(result).toEqual(mockActions);
    });

    it('should handle empty actions', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await actionsApi.getActions(mockProjectId, mockNodeId);

      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      const mockError = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(actionsApi.getActions(mockProjectId, mockNodeId)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('expandGroup', () => {
    it('should expand a grouped action', async () => {
      const mockGroupId = 'create-group';
      const mockSubActions: SiblingAction[] = [
        {
          id: 'add-task',
          label: 'Add Task',
          icon: '✓',
          type: 'create',
          category: 'foundational',
          group: mockGroupId,
          handler: 'addTask',
          requires_context: false,
          ai_powered: false,
          priority: 1,
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSubActions });

      const result = await actionsApi.expandGroup(mockProjectId, mockNodeId, mockGroupId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions/${mockGroupId}/expand`
      );
      expect(result).toEqual(mockSubActions);
    });

    it('should handle empty group', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await actionsApi.expandGroup(mockProjectId, mockNodeId, 'empty-group');

      expect(result).toEqual([]);
    });
  });

  describe('executeAction', () => {
    it('should execute an action without parameters', async () => {
      const mockResult: ActionExecutionResult = {
        status: 'success',
        action_id: mockActionId,
        node_id: mockNodeId,
        result: { newNodeId: 'new-node-123' },
        executed_at: '2025-09-30T12:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

      const result = await actionsApi.executeAction(mockProjectId, mockNodeId, mockActionId);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions/${mockActionId}`,
        { params: {} }
      );
      expect(result).toEqual(mockResult);
    });

    it('should execute an action with parameters', async () => {
      const mockParams = { taskName: 'New Task', priority: 1 };
      const mockResult: ActionExecutionResult = {
        status: 'success',
        action_id: mockActionId,
        node_id: mockNodeId,
        result: { newNodeId: 'new-node-123' },
        executed_at: '2025-09-30T12:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

      const result = await actionsApi.executeAction(
        mockProjectId,
        mockNodeId,
        mockActionId,
        mockParams
      );

      expect(apiClient.post).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions/${mockActionId}`,
        { params: mockParams }
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle failed action execution', async () => {
      const mockResult: ActionExecutionResult = {
        status: 'failed',
        action_id: mockActionId,
        node_id: mockNodeId,
        error_message: 'Failed to create task',
        executed_at: '2025-09-30T12:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult });

      const result = await actionsApi.executeAction(mockProjectId, mockNodeId, mockActionId);

      expect(result.status).toBe('failed');
      expect(result.error_message).toBe('Failed to create task');
    });

    it('should propagate execution errors', async () => {
      const mockError = new Error('Execution failed');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(
        actionsApi.executeAction(mockProjectId, mockNodeId, mockActionId)
      ).rejects.toThrow('Execution failed');
    });
  });

  describe('getActionHistory', () => {
    it('should fetch action history with default limit', async () => {
      const mockHistory: ActionHistoryEntry[] = [
        {
          id: 'history-1',
          action_id: 'add-task',
          executed_at: '2025-09-30T12:00:00Z',
          status: 'success',
        },
        {
          id: 'history-2',
          action_id: 'view-details',
          executed_at: '2025-09-30T11:00:00Z',
          status: 'success',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockHistory });

      const result = await actionsApi.getActionHistory(mockProjectId, mockNodeId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions/history`,
        { params: { limit: 50 } }
      );
      expect(result).toEqual(mockHistory);
    });

    it('should fetch action history with custom limit', async () => {
      const mockHistory: ActionHistoryEntry[] = [];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockHistory });

      const result = await actionsApi.getActionHistory(mockProjectId, mockNodeId, 10);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/projects/${mockProjectId}/nodes/${mockNodeId}/actions/history`,
        { params: { limit: 10 } }
      );
      expect(result).toEqual(mockHistory);
    });

    it('should handle empty history', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await actionsApi.getActionHistory(mockProjectId, mockNodeId);

      expect(result).toEqual([]);
    });

    it('should handle failed history entries', async () => {
      const mockHistory: ActionHistoryEntry[] = [
        {
          id: 'history-1',
          action_id: 'add-task',
          executed_at: '2025-09-30T12:00:00Z',
          status: 'failed',
          error_message: 'Validation failed',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockHistory });

      const result = await actionsApi.getActionHistory(mockProjectId, mockNodeId);

      expect(result[0].status).toBe('failed');
      expect(result[0].error_message).toBe('Validation failed');
    });
  });
});

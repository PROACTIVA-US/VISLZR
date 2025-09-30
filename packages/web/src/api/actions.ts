/**
 * API client for sibling node actions.
 */
import { apiClient } from './client';
import type {
  SiblingAction,
  ActionExecutionRequest,
  ActionExecutionResult,
  ActionHistoryEntry,
} from '@/types/action';

export const actionsApi = {
  /**
   * Get available actions for a node.
   */
  getActions: async (
    projectId: string,
    nodeId: string
  ): Promise<SiblingAction[]> => {
    const response = await apiClient.get(
      `/projects/${projectId}/nodes/${nodeId}/actions`
    );
    return response.data;
  },

  /**
   * Expand a grouped action to get sub-actions.
   */
  expandGroup: async (
    projectId: string,
    nodeId: string,
    groupId: string
  ): Promise<SiblingAction[]> => {
    const response = await apiClient.get(
      `/projects/${projectId}/nodes/${nodeId}/actions/${groupId}/expand`
    );
    return response.data;
  },

  /**
   * Execute a sibling action.
   */
  executeAction: async (
    projectId: string,
    nodeId: string,
    actionId: string,
    params?: Record<string, any>
  ): Promise<ActionExecutionResult> => {
    const request: ActionExecutionRequest = {
      params: params || {},
    };
    const response = await apiClient.post(
      `/projects/${projectId}/nodes/${nodeId}/actions/${actionId}`,
      request
    );
    return response.data;
  },

  /**
   * Get action execution history for a node.
   */
  getActionHistory: async (
    projectId: string,
    nodeId: string,
    limit: number = 50
  ): Promise<ActionHistoryEntry[]> => {
    const response = await apiClient.get(
      `/projects/${projectId}/nodes/${nodeId}/actions/history`,
      { params: { limit } }
    );
    return response.data;
  },
};

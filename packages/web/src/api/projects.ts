import { apiClient } from './client';
import type { Project, ProjectCreate, ProjectUpdate } from '@/types/project';
import type { GraphData, NodeData, EdgeData, Milestone } from '@/types/graph';

export const projectsApi = {
  // Projects
  list: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  get: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  update: async (projectId: string, data: ProjectUpdate): Promise<Project> => {
    const response = await apiClient.patch(`/projects/${projectId}`, data);
    return response.data;
  },

  delete: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
  },

  // Graph
  getGraph: async (projectId: string): Promise<GraphData> => {
    const response = await apiClient.get(`/projects/${projectId}/graph`);
    return response.data;
  },

  // Nodes
  listNodes: async (projectId: string): Promise<NodeData[]> => {
    const response = await apiClient.get(`/projects/${projectId}/nodes`);
    return response.data;
  },

  createNode: async (projectId: string, node: Partial<NodeData>): Promise<NodeData> => {
    const response = await apiClient.post(`/projects/${projectId}/nodes`, node);
    return response.data;
  },

  getNode: async (projectId: string, nodeId: string): Promise<NodeData> => {
    const response = await apiClient.get(`/projects/${projectId}/nodes/${nodeId}`);
    return response.data;
  },

  updateNode: async (
    projectId: string,
    nodeId: string,
    updates: Partial<NodeData>
  ): Promise<NodeData> => {
    const response = await apiClient.patch(`/projects/${projectId}/nodes/${nodeId}`, updates);
    return response.data;
  },

  deleteNode: async (projectId: string, nodeId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/nodes/${nodeId}`);
  },

  // Edges
  listEdges: async (projectId: string): Promise<EdgeData[]> => {
    const response = await apiClient.get(`/projects/${projectId}/edges`);
    return response.data;
  },

  createEdge: async (projectId: string, edge: Partial<EdgeData>): Promise<EdgeData> => {
    const response = await apiClient.post(`/projects/${projectId}/edges`, edge);
    return response.data;
  },

  getEdge: async (projectId: string, edgeId: string): Promise<EdgeData> => {
    const response = await apiClient.get(`/projects/${projectId}/edges/${edgeId}`);
    return response.data;
  },

  deleteEdge: async (projectId: string, edgeId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/edges/${edgeId}`);
  },

  // Milestones
  listMilestones: async (projectId: string): Promise<Milestone[]> => {
    const response = await apiClient.get(`/projects/${projectId}/milestones`);
    return response.data;
  },

  createMilestone: async (projectId: string, milestone: Partial<Milestone>): Promise<Milestone> => {
    const response = await apiClient.post(`/projects/${projectId}/milestones`, milestone);
    return response.data;
  },

  getMilestone: async (projectId: string, milestoneId: string): Promise<Milestone> => {
    const response = await apiClient.get(`/projects/${projectId}/milestones/${milestoneId}`);
    return response.data;
  },

  updateMilestone: async (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Milestone> => {
    const response = await apiClient.patch(
      `/projects/${projectId}/milestones/${milestoneId}`,
      updates
    );
    return response.data;
  },

  deleteMilestone: async (projectId: string, milestoneId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);
  },
};
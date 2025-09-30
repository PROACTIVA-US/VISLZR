import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectsApi } from '../projects';
import { apiClient } from '../client';
import { createMockProject, createMockNode, createMockGraph } from '@/test/mocks';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('projectsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('fetches all projects', async () => {
      const mockProjects = [createMockProject(), createMockProject({ id: 'project-2' })];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProjects });

      const result = await projectsApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('create', () => {
    it('creates a new project', async () => {
      const newProject = { name: 'New Project', description: 'Description' };
      const createdProject = createMockProject(newProject);
      vi.mocked(apiClient.post).mockResolvedValue({ data: createdProject });

      const result = await projectsApi.create(newProject);

      expect(apiClient.post).toHaveBeenCalledWith('/projects', newProject);
      expect(result).toEqual(createdProject);
    });
  });

  describe('get', () => {
    it('fetches a single project', async () => {
      const mockProject = createMockProject();
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProject });

      const result = await projectsApi.get('project-1');

      expect(apiClient.get).toHaveBeenCalledWith('/projects/project-1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('getGraph', () => {
    it('fetches project graph', async () => {
      const mockGraph = createMockGraph();
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockGraph });

      const result = await projectsApi.getGraph('project-1');

      expect(apiClient.get).toHaveBeenCalledWith('/projects/project-1/graph');
      expect(result).toEqual(mockGraph);
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });
  });

  describe('createNode', () => {
    it('creates a node', async () => {
      const newNode = createMockNode();
      vi.mocked(apiClient.post).mockResolvedValue({ data: newNode });

      const result = await projectsApi.createNode('project-1', newNode);

      expect(apiClient.post).toHaveBeenCalledWith('/projects/project-1/nodes', newNode);
      expect(result).toEqual(newNode);
    });
  });

  describe('updateNode', () => {
    it('updates a node', async () => {
      const updates = { status: 'COMPLETED' as const, progress: 100 };
      const updatedNode = createMockNode(updates);
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedNode });

      const result = await projectsApi.updateNode('project-1', 'node-1', updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/projects/project-1/nodes/node-1', updates);
      expect(result.status).toBe('COMPLETED');
      expect(result.progress).toBe(100);
    });
  });
});
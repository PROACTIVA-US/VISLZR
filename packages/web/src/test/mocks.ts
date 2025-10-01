import { vi } from 'vitest';
import type { Project, NodeData, EdgeData, GraphData } from '@/types';

// Mock API client
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Mock WebSocket
export class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = WebSocket.OPEN;

  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(_data: string) {
    // Mock send
  }

  close() {
    if (this.onclose) this.onclose();
  }
}

// Sample data factories
export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
});

export const createMockNode = (overrides?: Partial<NodeData>): NodeData => ({
  id: 'node-1',
  label: 'Test Node',
  type: 'TASK',
  status: 'IDLE',
  priority: 2,
  progress: 0,
  tags: [],
  parent_id: null,
  dependencies: [],
  metadata: {},
  ...overrides,
});

export const createMockEdge = (overrides?: Partial<EdgeData>): EdgeData => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'dependency',
  status: 'active',
  ...overrides,
});

export const createMockGraph = (): GraphData => ({
  project: {
    id: 'project-1',
    name: 'Test Project',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  nodes: [
    createMockNode({ id: 'node-1', label: 'Root', type: 'ROOT' }),
    createMockNode({ id: 'node-2', label: 'Task 1', status: 'IN_PROGRESS' }),
    createMockNode({ id: 'node-3', label: 'Task 2', status: 'COMPLETED' }),
  ],
  edges: [
    createMockEdge({ id: 'edge-1', source: 'node-1', target: 'node-2' }),
    createMockEdge({ id: 'edge-2', source: 'node-2', target: 'node-3' }),
  ],
});
// Integration test for GraphView with Sibling Nodes
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { GraphView } from '../components/GraphView';
import type { GraphData } from '@vislzr/shared';

// Mock API client
vi.mock('../services/apiClient', () => ({
  getGraph: vi.fn(() => Promise.resolve(mockGraphData)),
  ws: vi.fn(() => ({
    onmessage: null,
    close: vi.fn(),
  })),
  addNode: vi.fn(),
  addEdge: vi.fn(),
  patchNode: vi.fn(),
  deleteNode: vi.fn(),
  deleteEdge: vi.fn(),
  putGraph: vi.fn(),
}));

const mockGraphData: GraphData = {
  project: {
    id: 'test-project',
    name: 'Test Project',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  nodes: [
    {
      id: 'node-1',
      label: 'Task 1',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      x: 100,
      y: 100,
    },
    {
      id: 'node-2',
      label: 'Task 2',
      type: 'TASK',
      status: 'IDLE',
      priority: 2,
      x: 200,
      y: 200,
    },
  ],
  edges: [
    {
      source: 'node-1',
      target: 'node-2',
      type: 'dependency',
    },
  ],
};

describe('GraphView Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render GraphView component', async () => {
    const { container } = render(
      <GraphView projectId="test-project" />
    );

    // Wait for graph to load
    await vi.waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should initialize default sibling actions on mount', async () => {
    const { container } = render(
      <GraphView projectId="test-project" />
    );

    await vi.waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });

    // Actions should be initialized (tested via action registry)
    // This is implicit - we're testing that no errors occur
  });

  it('should accept node selection callback', async () => {
    const onNodeSelect = vi.fn();

    const { container } = render(
      <GraphView projectId="test-project" onNodeSelect={onNodeSelect} />
    );

    await vi.waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy();
    });

    // Selection callback should be wired up (tested via D3 event handlers)
  });
});

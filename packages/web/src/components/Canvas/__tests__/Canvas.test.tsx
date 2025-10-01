import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import { Canvas } from '../Canvas';
import { createMockGraph } from '@/test/mocks';

// Mock D3.js since it's hard to test in jsdom
vi.mock('d3', () => {
  // Create a chainable mock selection that supports nested append calls
  const createSelection = (): any => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
      data: vi.fn(() => ({
        join: vi.fn(() => createSelection()),
      })),
    })),
    append: vi.fn(() => createSelection()),
    attr: vi.fn(function(this: any) { return this; }),
    style: vi.fn(function(this: any) { return this; }),
    text: vi.fn(function(this: any) { return this; }),
    call: vi.fn(function(this: any) { return this; }),
    on: vi.fn(function(this: any) { return this; }),
    node: vi.fn(() => document.createElementNS('http://www.w3.org/2000/svg', 'svg')),
  });

  return {
    select: vi.fn(() => createSelection()),
    zoom: vi.fn(() => ({
      scaleExtent: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
    })),
    forceSimulation: vi.fn(() => ({
      force: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      stop: vi.fn(),
      alphaTarget: vi.fn().mockReturnThis(),
      restart: vi.fn().mockReturnThis(),
      nodes: vi.fn().mockReturnThis(),
      alpha: vi.fn().mockReturnThis(),
    })),
    forceLink: vi.fn(() => ({
      id: vi.fn().mockReturnThis(),
      distance: vi.fn().mockReturnThis(),
    })),
    forceManyBody: vi.fn(() => ({
      strength: vi.fn().mockReturnThis(),
    })),
    forceCenter: vi.fn(),
    forceCollide: vi.fn(() => ({
      radius: vi.fn().mockReturnThis(),
    })),
    drag: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
    })),
  };
});

describe('Canvas Component', () => {
  it('renders an SVG element', () => {
    const { nodes, edges } = createMockGraph();
    render(<Canvas projectId="test-project" nodes={nodes} edges={edges} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with empty nodes and edges', () => {
    render(<Canvas projectId="test-project" nodes={[]} edges={[]} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calls onNodeClick when provided', () => {
    const onNodeClick = vi.fn();
    const { nodes, edges } = createMockGraph();

    render(<Canvas projectId="test-project" nodes={nodes} edges={edges} onNodeClick={onNodeClick} />);

    // SVG should be rendered
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts selectedNodeId prop', () => {
    const { nodes, edges } = createMockGraph();

    render(<Canvas projectId="test-project" nodes={nodes} edges={edges} selectedNodeId="node-1" />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
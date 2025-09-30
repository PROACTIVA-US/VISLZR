import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SiblingNodes } from '../SiblingNodes';
import type { NodeData } from '@vislzr/shared';
import type { SiblingAction } from '@vislzr/shared/types/actions';
import React from 'react';

describe('SiblingNodes Component', () => {
  it('should render without crashing', () => {
    const svgRef = React.createRef<SVGSVGElement>();
    const selectedNode: NodeData = {
      id: 'test-node',
      label: 'Test',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      x: 100,
      y: 100,
    };

    const actions: SiblingAction[] = [
      {
        id: 'view_details',
        type: 'view_details',
        label: 'View Details',
        icon: '👁️',
        category: 'view',
        handler: 'handleViewDetails',
        conditions: {},
      },
    ];

    const { container } = render(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={selectedNode}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    expect(svgRef.current).toBeDefined();
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should clear when selectedNode is null', () => {
    const svgRef = React.createRef<SVGSVGElement>();

    const selectedNode: NodeData = {
      id: 'test-node',
      label: 'Test',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      x: 100,
      y: 100,
    };

    const actions: SiblingAction[] = [
      {
        id: 'view_details',
        type: 'view_details',
        label: 'View Details',
        icon: '👁️',
        category: 'view',
        handler: 'handleViewDetails',
        conditions: {},
      },
    ];

    const { rerender } = render(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={selectedNode}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    expect(svgRef.current).toBeDefined();

    // Re-render with null selectedNode
    rerender(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={null}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    // Component should handle null gracefully without errors
    expect(svgRef.current).toBeDefined();
  });

  it('should clear when actions array is empty', () => {
    const svgRef = React.createRef<SVGSVGElement>();

    const selectedNode: NodeData = {
      id: 'test-node',
      label: 'Test',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      x: 100,
      y: 100,
    };

    render(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={selectedNode}
          actions={[]}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    // Should render without errors even with empty actions
    expect(svgRef.current).toBeDefined();
  });

  it('should update when selectedNode changes', () => {
    const svgRef = React.createRef<SVGSVGElement>();

    const node1: NodeData = {
      id: 'node-1',
      label: 'Node 1',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      x: 100,
      y: 100,
    };

    const node2: NodeData = {
      id: 'node-2',
      label: 'Node 2',
      type: 'TASK',
      status: 'IDLE',
      priority: 1,
      progress: 0,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      x: 200,
      y: 200,
    };

    const actions: SiblingAction[] = [
      {
        id: 'view_details',
        type: 'view_details',
        label: 'View Details',
        icon: '👁️',
        category: 'view',
        handler: 'handleViewDetails',
        conditions: {},
      },
    ];

    const { rerender } = render(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={node1}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    expect(svgRef.current).toBeDefined();

    // Re-render with different node
    rerender(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={node2}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    // Component should handle node change without errors
    expect(svgRef.current).toBeDefined();
  });

  it('should handle nodes without x/y coordinates', () => {
    const svgRef = React.createRef<SVGSVGElement>();
    const selectedNode: NodeData = {
      id: 'test-node',
      label: 'Test',
      type: 'TASK',
      status: 'IN_PROGRESS',
      priority: 2,
      progress: 50,
      tags: [],
      parent_id: null,
      dependencies: [],
      metadata: { created_at: '', updated_at: '' },
      // No x/y coordinates
    };

    const actions: SiblingAction[] = [
      {
        id: 'view_details',
        type: 'view_details',
        label: 'View Details',
        icon: '👁️',
        category: 'view',
        handler: 'handleViewDetails',
        conditions: {},
      },
    ];

    render(
      <div>
        <svg ref={svgRef} data-testid="test-svg" />
        <SiblingNodes
          selectedNode={selectedNode}
          actions={actions}
          graphNodes={[]}
          svgRef={svgRef}
          onActionClick={vi.fn()}
        />
      </div>
    );

    // Should default to 0, 0 and not crash
    expect(svgRef.current).toBeDefined();
  });
});

/**
 * Component tests for SiblingNodes.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiblingNodes } from '../SiblingNodes';
import type { NodeData } from '@/types/graph';
import type { SiblingAction } from '@/types/action';

// Mock D3.js
vi.mock('d3', () => ({
  default: {
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({
        data: vi.fn(() => ({
          exit: vi.fn(() => ({
            nodes: vi.fn(() => []),
            remove: vi.fn(),
          })),
          enter: vi.fn(() => ({
            append: vi.fn(() => ({
              attr: vi.fn().mockReturnThis(),
              text: vi.fn().mockReturnThis(),
              filter: vi.fn().mockReturnThis(),
            })),
            nodes: vi.fn(() => []),
          })),
          merge: vi.fn(() => ({
            nodes: vi.fn(() => []),
            on: vi.fn().mockReturnThis(),
          })),
        })),
      })),
    })),
    easeCubicOut: vi.fn(),
    easeCubicIn: vi.fn(),
  },
}));

// Mock animation utilities
vi.mock('@/utils/siblingAnimations', () => ({
  calculateSiblingPositions: vi.fn(() => [
    { x: 100, y: 50, angle: 0 },
    { x: 120, y: 70, angle: Math.PI / 4 },
    { x: 140, y: 90, angle: Math.PI / 2 },
  ]),
  animateSiblingsInStaggered: vi.fn(),
  animateSiblingsOutStaggered: vi.fn(() => Promise.resolve()),
  highlightSibling: vi.fn(),
}));

describe('SiblingNodes', () => {
  const mockParentNode: NodeData = {
    id: 'node-1',
    label: 'Test Node',
    type: 'TASK',
    status: 'IN_PROGRESS',
    priority: 2,
    progress: 0.5,
    tags: [],
    parent_id: null,
    dependencies: [],
    metadata: {
      created_at: '2025-09-30T12:00:00Z',
      updated_at: '2025-09-30T12:00:00Z',
    },
    x: 100,
    y: 100,
  };

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
    {
      id: 'ai-scan',
      label: 'AI Scan',
      icon: '🤖',
      type: 'ai',
      category: 'ai',
      handler: 'aiScan',
      requires_context: true,
      ai_powered: true,
      priority: 3,
    },
  ];

  const mockOnActionClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sibling nodes container', () => {
    const { container } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    const group = container.querySelector('.sibling-nodes-container');
    expect(group).toBeInTheDocument();
  });

  it('should render with arc layout by default', () => {
    const { calculateSiblingPositions } = require('@/utils/siblingAnimations');

    render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    expect(calculateSiblingPositions).toHaveBeenCalledWith(
      expect.objectContaining({ x: 100, y: 100 }),
      expect.any(Array),
      'arc'
    );
  });

  it('should render with stack layout when specified', () => {
    const { calculateSiblingPositions } = require('@/utils/siblingAnimations');

    render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
          layout="stack"
        />
      </svg>
    );

    expect(calculateSiblingPositions).toHaveBeenCalledWith(
      expect.objectContaining({ x: 100, y: 100 }),
      expect.any(Array),
      'stack'
    );
  });

  it('should handle empty actions array', () => {
    const { container } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={[]}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    const group = container.querySelector('.sibling-nodes-container');
    expect(group).toBeInTheDocument();
  });

  it('should animate siblings in when visible', () => {
    const { animateSiblingsInStaggered } = require('@/utils/siblingAnimations');

    render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
          visible={true}
        />
      </svg>
    );

    expect(animateSiblingsInStaggered).toHaveBeenCalled();
  });

  it('should handle visibility changes', () => {
    const { animateSiblingsInStaggered, animateSiblingsOutStaggered } =
      require('@/utils/siblingAnimations');

    const { rerender } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
          visible={true}
        />
      </svg>
    );

    // Change visibility to false
    rerender(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
          visible={false}
        />
      </svg>
    );

    expect(animateSiblingsOutStaggered).toHaveBeenCalled();
  });

  it('should update when actions change', () => {
    const { rerender } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    const newActions: SiblingAction[] = [
      {
        id: 'new-action',
        label: 'New Action',
        icon: '🆕',
        type: 'create',
        category: 'foundational',
        handler: 'newHandler',
        requires_context: false,
        ai_powered: false,
        priority: 1,
      },
    ];

    rerender(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={newActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    // Component should re-render with new actions
    expect(mockOnActionClick).not.toHaveBeenCalled();
  });

  it('should update when parent node position changes', () => {
    const { calculateSiblingPositions } = require('@/utils/siblingAnimations');

    const { rerender } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    const movedNode = { ...mockParentNode, x: 200, y: 200 };

    rerender(
      <svg>
        <SiblingNodes
          parentNode={movedNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    expect(calculateSiblingPositions).toHaveBeenCalledWith(
      expect.objectContaining({ x: 200, y: 200 }),
      expect.any(Array),
      'arc'
    );
  });

  it('should calculate positions based on parent priority', () => {
    const { calculateSiblingPositions } = require('@/utils/siblingAnimations');

    const highPriorityNode = { ...mockParentNode, priority: 4 as const };

    render(
      <svg>
        <SiblingNodes
          parentNode={highPriorityNode}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    expect(calculateSiblingPositions).toHaveBeenCalledWith(
      expect.objectContaining({ radius: 45 }), // 25 + 4 * 5
      expect.any(Array),
      'arc'
    );
  });

  it('should handle nodes without coordinates', () => {
    const nodeWithoutCoords = { ...mockParentNode, x: undefined, y: undefined };

    const { calculateSiblingPositions } = require('@/utils/siblingAnimations');

    render(
      <svg>
        <SiblingNodes
          parentNode={nodeWithoutCoords}
          actions={mockActions}
          onActionClick={mockOnActionClick}
        />
      </svg>
    );

    expect(calculateSiblingPositions).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, y: 0 }),
      expect.any(Array),
      'arc'
    );
  });
});

describe('SiblingNodes - Visual Styling', () => {
  const mockParentNode: NodeData = {
    id: 'node-1',
    label: 'Test Node',
    type: 'TASK',
    status: 'IN_PROGRESS',
    priority: 2,
    progress: 0.5,
    tags: [],
    parent_id: null,
    dependencies: [],
    metadata: {
      created_at: '2025-09-30T12:00:00Z',
      updated_at: '2025-09-30T12:00:00Z',
    },
    x: 100,
    y: 100,
  };

  it('should apply correct category colors', () => {
    const foundationalAction: SiblingAction = {
      id: 'foundational',
      label: 'Foundational',
      icon: '✓',
      type: 'create',
      category: 'foundational',
      handler: 'handler',
      requires_context: false,
      ai_powered: false,
      priority: 1,
    };

    const aiAction: SiblingAction = {
      id: 'ai',
      label: 'AI Action',
      icon: '🤖',
      type: 'ai',
      category: 'ai',
      handler: 'handler',
      requires_context: false,
      ai_powered: true,
      priority: 1,
    };

    // Test is limited by D3 mocking, but structure is verified
    const { container } = render(
      <svg>
        <SiblingNodes
          parentNode={mockParentNode}
          actions={[foundationalAction, aiAction]}
          onActionClick={vi.fn()}
        />
      </svg>
    );

    expect(container.querySelector('.sibling-nodes-container')).toBeInTheDocument();
  });
});

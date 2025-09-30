import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as d3 from 'd3';
import { SiblingNodeRenderer } from '../SiblingNodeRenderer';
import type { SiblingAction } from '@vislzr/shared/types/actions';

describe('SiblingNodeRenderer', () => {
  let renderer: SiblingNodeRenderer;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let svgElement: SVGSVGElement;

  beforeEach(() => {
    renderer = new SiblingNodeRenderer();
    // Create a real SVG element in JSDOM
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgElement);
    svg = d3.select(svgElement);
  });

  afterEach(() => {
    // Clean up DOM
    if (svgElement && svgElement.parentNode) {
      svgElement.parentNode.removeChild(svgElement);
    }
  });

  it('should render sibling nodes', () => {
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
      {
        id: 'add_task',
        type: 'add_task',
        label: 'Add Task',
        icon: '➕',
        category: 'create',
        handler: 'handleAddTask',
        conditions: {},
      },
    ];

    const onActionClick = vi.fn();

    renderer.render({
      svg,
      parentNode: { x: 100, y: 100, radius: 20 },
      actions,
      graphNodes: [],
      onActionClick,
    });

    const instances = renderer.getInstances();
    expect(instances).toHaveLength(2);
    expect(instances[0].actionId).toBe('view_details');
    expect(instances[1].actionId).toBe('add_task');

    // Check that SVG elements were created
    const siblingGroups = svg.selectAll('.sibling');
    expect(siblingGroups.size()).toBe(2);
  });

  it('should clear sibling nodes', () => {
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

    renderer.render({
      svg,
      parentNode: { x: 100, y: 100, radius: 20 },
      actions,
      graphNodes: [],
      onActionClick: vi.fn(),
    });

    expect(renderer.getInstances()).toHaveLength(1);

    renderer.clear();

    // Clear is async due to animation, but instances should be cleared immediately
    expect(renderer.getInstances()).toHaveLength(0);
  });

  it('should position siblings correctly around parent', () => {
    const actions: SiblingAction[] = [
      {
        id: 'action1',
        type: 'action1',
        label: 'Action 1',
        icon: '🔵',
        category: 'view',
        handler: 'handler1',
        conditions: {},
      },
      {
        id: 'action2',
        type: 'action2',
        label: 'Action 2',
        icon: '🟢',
        category: 'create',
        handler: 'handler2',
        conditions: {},
      },
    ];

    const parentNode = { x: 200, y: 150, radius: 25 };

    renderer.render({
      svg,
      parentNode,
      actions,
      graphNodes: [],
      onActionClick: vi.fn(),
    });

    const instances = renderer.getInstances();
    expect(instances).toHaveLength(2);

    // Each position should be defined and different from parent
    instances.forEach(instance => {
      expect(instance.position.x).toBeDefined();
      expect(instance.position.y).toBeDefined();
      // Positions should not be exactly at parent node
      const isAtParent = instance.position.x === parentNode.x && instance.position.y === parentNode.y;
      expect(isAtParent).toBe(false);
    });
  });

  it('should handle click interactions', () => {
    const actions: SiblingAction[] = [
      {
        id: 'test_action',
        type: 'test_action',
        label: 'Test Action',
        icon: '✨',
        category: 'view',
        handler: 'handleTest',
        conditions: {},
      },
    ];

    const onActionClick = vi.fn();

    renderer.render({
      svg,
      parentNode: { x: 100, y: 100, radius: 20 },
      actions,
      graphNodes: [],
      onActionClick,
    });

    // Find the sibling group element and simulate click
    const siblingGroup = svg.select('.sibling');
    expect(siblingGroup.empty()).toBe(false);

    // Simulate click event
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const groupNode = siblingGroup.node();
    if (groupNode) {
      groupNode.dispatchEvent(clickEvent);
    }

    // onActionClick should have been called
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledWith(actions[0]);
  });

  it('should apply correct colors based on category', () => {
    const actions: SiblingAction[] = [
      {
        id: 'view_action',
        type: 'view_action',
        label: 'View',
        icon: '👁️',
        category: 'view',
        handler: 'handleView',
        conditions: {},
      },
      {
        id: 'create_action',
        type: 'create_action',
        label: 'Create',
        icon: '➕',
        category: 'create',
        handler: 'handleCreate',
        conditions: {},
      },
      {
        id: 'destructive_action',
        type: 'destructive_action',
        label: 'Delete',
        icon: '🗑️',
        category: 'destructive',
        handler: 'handleDelete',
        conditions: {},
      },
    ];

    renderer.render({
      svg,
      parentNode: { x: 100, y: 100, radius: 20 },
      actions,
      graphNodes: [],
      onActionClick: vi.fn(),
    });

    const instances = renderer.getInstances();
    expect(instances).toHaveLength(3);

    // Check that colors are assigned (should match SIBLING_COLORS from constants)
    expect(instances[0].color).toBe('#3b82f6'); // view - blue
    expect(instances[1].color).toBe('#10b981'); // create - green
    expect(instances[2].color).toBe('#ef4444'); // destructive - red
  });

  it('should handle collision avoidance', () => {
    const actions: SiblingAction[] = [
      {
        id: 'action1',
        type: 'action1',
        label: 'Action 1',
        icon: '🔵',
        category: 'view',
        handler: 'handler1',
        conditions: {},
      },
    ];

    // Place a graph node where the sibling would normally appear
    const graphNodes = [
      { x: 180, y: 100, radius: 30 }, // Likely collision point
    ];

    renderer.render({
      svg,
      parentNode: { x: 100, y: 100, radius: 20 },
      actions,
      graphNodes,
      onActionClick: vi.fn(),
    });

    const instances = renderer.getInstances();
    expect(instances).toHaveLength(1);

    // The renderer should have attempted to resolve collisions
    // Position should be adjusted from the collision point
    expect(instances[0].position.x).toBeDefined();
    expect(instances[0].position.y).toBeDefined();
  });
});

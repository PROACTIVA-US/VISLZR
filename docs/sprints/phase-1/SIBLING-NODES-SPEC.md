# Phase 1: Sibling Nodes System - Technical Specification

**Version**: 1.0
**Date**: September 30, 2025
**Status**: Ready for Implementation
**Target**: 2-3 weeks (Phase 1 of Vislzr Unified)

---

## Executive Summary

This specification details the implementation of the **Sibling Nodes System**, the core differentiator for Vislzr. Sibling nodes transform Vislzr from a traditional panel-based interface into a true canvas-centric application where 80%+ of interactions happen directly on the visualization.

**Key Innovation**: Context-aware action buttons that appear adjacent to selected nodes, eliminating the need for disconnected sidebars and context menus while dramatically improving discoverability and workflow efficiency.

---

## 1. Architecture Overview

### 1.1 High-Level Design

The Sibling Nodes system consists of three primary layers:

```
┌─────────────────────────────────────────────────────────┐
│                    GraphView Component                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │           D3.js Force Simulation Layer            │  │
│  │  • Primary nodes (project structure)              │  │
│  │  • Edges (relationships)                          │  │
│  │  • Sibling nodes (transient action buttons)       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Sibling Node Orchestration Layer          │  │
│  │  • Selection detection                            │  │
│  │  • Context analysis (node type + status)          │  │
│  │  • Action filtering & prioritization              │  │
│  │  • Position calculation                           │  │
│  │  • Lifecycle management (appear/fade)             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Action Registry & Handlers              │  │
│  │  • Action definitions                             │  │
│  │  • Conditional visibility logic                   │  │
│  │  • Execution handlers                             │  │
│  │  • Result processing                              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
User clicks node
    ↓
GraphView detects selection
    ↓
Context detector analyzes node (type, status, metadata)
    ↓
Action registry filters available actions
    ↓
Position calculator determines sibling placement
    ↓
D3.js renders sibling nodes with fade-in animation
    ↓
User clicks sibling node
    ↓
Action handler executes
    ↓
Result updates graph state
    ↓
WebSocket broadcasts change
    ↓
GraphView re-renders with updated data
```

### 1.3 Integration with Existing Architecture

**Current State** (from Phase 0 audit):
- GraphView.tsx manages D3.js force-directed graph
- Node selection tracked via `selectedNode` state
- Basic context menu (right-click) for simple actions
- SidePanel.tsx for node editing

**Phase 1 Changes**:
1. **Extend GraphView.tsx** to render sibling nodes alongside primary nodes
2. **Add SiblingNodeManager** component for orchestration logic
3. **Create ActionRegistry** system for extensible actions
4. **Deprecate context menu** in favor of sibling nodes
5. **Keep SidePanel** for now (migrate actions incrementally)

---

## 2. Component Design

### 2.1 New Components

#### 2.1.1 SiblingNodeManager

**Location**: `/packages/web/src/components/SiblingNodeManager.tsx`

**Responsibilities**:
- Detect node selection/deselection
- Query ActionRegistry for available actions
- Calculate sibling positions around selected node
- Manage sibling lifecycle (mount/unmount animations)
- Handle sibling click events

**Props**:
```typescript
interface SiblingNodeManagerProps {
  selectedNode: NodeData | null;
  graphData: GraphData;
  simulationRef: React.MutableRefObject<d3.Simulation<NodeData, EdgeData> | null>;
  svgGroupRef: React.MutableRefObject<d3.Selection<SVGGElement, unknown, null, undefined> | null>;
  onActionExecute: (action: SiblingAction, node: NodeData) => Promise<void>;
}
```

**State**:
```typescript
interface SiblingNodeManagerState {
  visibleSiblings: SiblingNodeInstance[];
  animating: boolean;
  expandedGroup: string | null; // For grouped siblings
}
```

#### 2.1.2 ActionRegistry

**Location**: `/packages/web/src/lib/ActionRegistry.ts`

**Purpose**: Central registry for all sibling node actions with conditional visibility logic.

**Interface**:
```typescript
class ActionRegistry {
  private actions: Map<string, SiblingAction>;

  register(action: SiblingAction): void;
  unregister(actionId: string): void;
  getActionsForNode(node: NodeData, context: GraphContext): SiblingAction[];
  executeAction(actionId: string, node: NodeData, context: GraphContext): Promise<ActionResult>;
}
```

#### 2.1.3 SiblingNodeRenderer (D3.js Integration)

**Location**: `/packages/web/src/lib/d3/siblingRenderer.ts`

**Purpose**: D3.js-specific rendering logic for sibling nodes.

**Functions**:
```typescript
function renderSiblingNodes(
  parentGroup: d3.Selection<SVGGElement>,
  siblings: SiblingNodeInstance[],
  selectedNode: NodeData,
  onSiblingClick: (sibling: SiblingNodeInstance) => void
): void;

function animateSiblingAppearance(
  siblingGroup: d3.Selection<SVGGElement>
): void;

function animateSiblingDisappearance(
  siblingGroup: d3.Selection<SVGGElement>,
  onComplete: () => void
): void;

function calculateSiblingPositions(
  selectedNode: NodeData,
  siblingCount: number,
  layout: 'arc' | 'stack' | 'ring'
): Position[];
```

### 2.2 GraphView Integration

**Modifications to GraphView.tsx**:

1. **Add sibling node rendering to D3.js effect**:
```typescript
// After primary node rendering
useEffect(() => {
  // ... existing node/edge rendering ...

  // Render sibling nodes
  if (selectedNode) {
    const actions = actionRegistry.getActionsForNode(selectedNode, graphContext);
    const siblingInstances = createSiblingInstances(actions, selectedNode);
    renderSiblingNodes(g, siblingInstances, selectedNode, handleSiblingClick);
  }
}, [graph, selectedNode]);
```

2. **Add sibling node state management**:
```typescript
const [activeSiblings, setActiveSiblings] = useState<SiblingNodeInstance[]>([]);
const [siblingAnimating, setSiblingAnimating] = useState(false);
```

3. **Handle sibling clicks**:
```typescript
const handleSiblingClick = async (sibling: SiblingNodeInstance) => {
  setSiblingAnimating(true);
  try {
    const result = await actionRegistry.executeAction(
      sibling.actionId,
      selectedNode!,
      graphContext
    );

    if (result.success) {
      // Handle result (update graph, show notification, etc.)
      processActionResult(result);
    }
  } catch (error) {
    console.error('Sibling action failed:', error);
  } finally {
    setSiblingAnimating(false);
  }
};
```

---

## 3. Data Models

### 3.1 SiblingAction Interface

**Location**: `/packages/shared/src/types/siblingActions.ts`

```typescript
export interface SiblingAction {
  // Core identity
  id: string;
  label: string;
  icon: string; // Emoji or icon identifier
  category: ActionCategory;

  // Conditional visibility
  visibilityRules: VisibilityRule[];
  priority: number; // For sorting (lower = higher priority)

  // Grouping (for sub-menus)
  group?: string; // e.g., "scans", "ai-actions"
  isGroupParent?: boolean;

  // Execution
  handler: ActionHandler;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;

  // Visual
  color?: string; // Override default color
  tooltip?: string;

  // Metadata
  estimatedDuration?: number; // seconds
  tags?: string[];
}

export type ActionCategory =
  | 'view'           // Non-destructive info display
  | 'create'         // Add new nodes
  | 'state-change'   // Modify node state
  | 'ai-analysis'    // AI scans and analysis
  | 'ai-generative'  // AI generation
  | 'integration'    // External tool actions
  | 'destructive';   // Delete, archive, etc.

export interface VisibilityRule {
  field: keyof NodeData | 'always' | 'never';
  operator: 'equals' | 'not-equals' | 'contains' | 'matches' | 'exists';
  value?: any;
}

export type ActionHandler = (
  node: NodeData,
  context: GraphContext
) => Promise<ActionResult>;

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
  graphUpdate?: Partial<GraphData>; // Optional graph changes
  nodeUpdate?: Partial<NodeData>;   // Optional node changes
}

export interface GraphContext {
  projectId: string;
  graphData: GraphData;
  apiClient: typeof import('../services/apiClient');
}
```

### 3.2 SiblingNodeInstance

```typescript
export interface SiblingNodeInstance {
  id: string; // Unique instance ID
  actionId: string; // Reference to SiblingAction
  label: string;
  icon: string;
  position: Position;
  color: string;
  isGroupParent?: boolean;
  isExpanded?: boolean; // For grouped siblings
  children?: SiblingNodeInstance[]; // For sub-siblings
}

export interface Position {
  x: number;
  y: number;
  angle?: number; // For arc layout
}
```

### 3.3 Context Detection Logic

```typescript
export class ContextDetector {
  static analyzeNode(node: NodeData, graph: GraphData): NodeContext {
    return {
      nodeType: this.inferNodeType(node),
      status: node.status || 'IDLE',
      hasChildren: this.hasChildren(node.id, graph),
      hasParent: this.hasParent(node.id, graph),
      hasDependencies: this.hasDependencies(node.id, graph),
      isBlocked: this.isBlocked(node, graph),
      isOverdue: this.isOverdue(node),
      metadata: node.metadata || {}
    };
  }

  private static inferNodeType(node: NodeData): NodeType {
    // Infer type from metadata, tags, or label patterns
    // For Phase 1, use simple heuristics
    // Phase 2+ will use explicit type field

    if (node.label.match(/\.tsx?$/)) return 'FILE';
    if (node.label.match(/\.py$/)) return 'FILE';
    if (node.tags?.includes('task')) return 'TASK';
    if (node.tags?.includes('service')) return 'SERVICE';
    return 'FOLDER'; // Default
  }

  private static hasChildren(nodeId: string, graph: GraphData): boolean {
    return graph.edges.some(e => e.source === nodeId);
  }

  private static hasDependencies(nodeId: string, graph: GraphData): boolean {
    return graph.edges.some(e =>
      (e.target === nodeId || e.source === nodeId) &&
      e.kind === 'dependency'
    );
  }

  private static isBlocked(node: NodeData, graph: GraphData): boolean {
    return node.status === 'blocked';
  }

  private static isOverdue(node: NodeData): boolean {
    return node.status === 'overdue' || node.status === 'focus';
  }
}
```

---

## 4. Visual Design

### 4.1 Sibling Node Appearance

**Visual Properties**:
```typescript
const SIBLING_STYLE = {
  // Size (smaller than primary nodes)
  radius: 12,

  // Colors (by category)
  colors: {
    view: '#3b82f6',        // Blue
    create: '#10b981',      // Green
    'state-change': '#f59e0b', // Amber
    'ai-analysis': '#8b5cf6',  // Purple
    'ai-generative': '#ec4899', // Pink
    integration: '#06b6d4',    // Cyan
    destructive: '#ef4444'     // Red
  },

  // Opacity
  fillOpacity: 0.9,
  strokeOpacity: 1,

  // Stroke
  stroke: '#fff',
  strokeWidth: 2,

  // Text
  fontSize: 18, // For emoji icons
  labelFontSize: 10,
  labelColor: '#e5e7eb',

  // Hover effects
  hoverScale: 1.15,
  hoverOpacity: 1.0
};
```

**Distinguishing Features** (vs Primary Nodes):
1. **Smaller size** (radius 12 vs 15-30)
2. **No border ring** (no status color)
3. **Icon-centric** (large emoji, small/no label)
4. **Transient** (fade in/out animations)
5. **Fixed position** (don't participate in force simulation)

### 4.2 Positioning Algorithm

**Layout Options**:

#### Arc Layout (Default)
Arrange siblings in a semi-circular arc around the selected node.

```typescript
function calculateArcPositions(
  selectedNode: NodeData,
  siblingCount: number,
  radius: number = 80
): Position[] {
  const positions: Position[] = [];
  const arcAngle = Math.PI; // 180 degrees
  const startAngle = -Math.PI / 2; // Start at top
  const angleStep = arcAngle / (siblingCount + 1);

  for (let i = 0; i < siblingCount; i++) {
    const angle = startAngle + angleStep * (i + 1);
    positions.push({
      x: selectedNode.x! + radius * Math.cos(angle),
      y: selectedNode.y! + radius * Math.sin(angle),
      angle: angle
    });
  }

  return positions;
}
```

**Visual**:
```
        S₁
       /  \
     S₂    S₃
    /        \
  S₄    ●    S₅
        ↑
    Selected Node
```

#### Stack Layout (Vertical)
Stack siblings vertically to the right of the selected node.

```typescript
function calculateStackPositions(
  selectedNode: NodeData,
  siblingCount: number,
  spacing: number = 35,
  offsetX: number = 70
): Position[] {
  const positions: Position[] = [];
  const totalHeight = (siblingCount - 1) * spacing;
  const startY = selectedNode.y! - totalHeight / 2;

  for (let i = 0; i < siblingCount; i++) {
    positions.push({
      x: selectedNode.x! + offsetX,
      y: startY + i * spacing,
      angle: 0
    });
  }

  return positions;
}
```

**Visual**:
```
          S₁
          S₂
    ●  →  S₃
          S₄
          S₅
```

#### Ring Layout (Full Circle)
Arrange siblings in a complete circle (for nodes with many actions).

```typescript
function calculateRingPositions(
  selectedNode: NodeData,
  siblingCount: number,
  radius: number = 80
): Position[] {
  const positions: Position[] = [];
  const angleStep = (2 * Math.PI) / siblingCount;

  for (let i = 0; i < siblingCount; i++) {
    const angle = i * angleStep;
    positions.push({
      x: selectedNode.x! + radius * Math.cos(angle),
      y: selectedNode.y! + radius * Math.sin(angle),
      angle: angle
    });
  }

  return positions;
}
```

**Layout Selection Logic**:
```typescript
function selectLayout(siblingCount: number): 'arc' | 'stack' | 'ring' {
  if (siblingCount <= 4) return 'arc';      // Clean arc for few actions
  if (siblingCount <= 7) return 'stack';    // Stack for moderate count
  return 'ring';                            // Ring for many actions
}
```

### 4.3 Animation Specifications

#### Appear Animation
```typescript
function animateAppearance(siblingGroup: d3.Selection<SVGGElement>): void {
  siblingGroup
    .style('opacity', 0)
    .attr('transform', (d: SiblingNodeInstance) => {
      // Start from selected node position
      return `translate(${d.position.x - 10},${d.position.y})`;
    })
    .transition()
    .duration(300)
    .ease(d3.easeCubicOut)
    .style('opacity', 1)
    .attr('transform', (d: SiblingNodeInstance) =>
      `translate(${d.position.x},${d.position.y})`
    );
}
```

**Timing**: 300ms ease-out
**Effect**: Fade in + slight movement outward from selected node

#### Fade Animation (Deselect)
```typescript
function animateDisappearance(
  siblingGroup: d3.Selection<SVGGElement>,
  onComplete: () => void
): void {
  siblingGroup
    .transition()
    .duration(200)
    .ease(d3.easeCubicIn)
    .style('opacity', 0)
    .attr('transform', (d: SiblingNodeInstance) => {
      // Move slightly toward selected node
      return `translate(${d.position.x - 5},${d.position.y})`;
    })
    .on('end', onComplete);
}
```

**Timing**: 200ms ease-in
**Effect**: Fade out + slight movement inward

#### Hover Animation
```typescript
// Applied via D3.js event listeners
siblingGroup.on('mouseenter', function() {
  d3.select(this)
    .select('circle')
    .transition()
    .duration(150)
    .attr('r', SIBLING_STYLE.radius * SIBLING_STYLE.hoverScale)
    .style('opacity', SIBLING_STYLE.hoverOpacity);
});

siblingGroup.on('mouseleave', function() {
  d3.select(this)
    .select('circle')
    .transition()
    .duration(150)
    .attr('r', SIBLING_STYLE.radius)
    .style('opacity', SIBLING_STYLE.fillOpacity);
});
```

### 4.4 Grouped Siblings (Sub-Menus)

For grouped actions (e.g., "Scans" with sub-options), implement expandable sub-siblings:

**Visual Flow**:
```
Initial State:
    S₁  S₂  S₃  S₄(Scans)  S₅
           ●

User clicks S₄(Scans):
    S₁  S₂  S₃  S₄(Scans)  S₅
                   ↓
               [Sub-siblings]
               S₄.₁ (Security)
               S₄.₂ (Compliance)
               S₄.₃ (Optimization)
```

**Implementation**:
```typescript
function handleGroupParentClick(group: SiblingNodeInstance): void {
  if (group.isExpanded) {
    // Collapse: fade out children
    collapseGroup(group);
  } else {
    // Expand: fade in children
    expandGroup(group);
  }
}

function expandGroup(group: SiblingNodeInstance): void {
  const children = actionRegistry.getGroupChildren(group.actionId);
  const childPositions = calculateSubSiblingPositions(group, children.length);
  const childInstances = createSiblingInstances(children, selectedNode!, childPositions);

  renderSiblingNodes(g, childInstances, selectedNode!, handleSiblingClick);
  animateAppearance(/* child sibling group */);

  group.isExpanded = true;
  group.children = childInstances;
}
```

---

## 5. Implementation Steps

### Phase 1.1: Foundation (Days 1-3)

**Tasks**:
1. Create SiblingAction interface in shared types
2. Create ActionRegistry class with basic CRUD
3. Define 5 foundational actions (Add Task, Add Note, View Details, Mark Complete, Delete)
4. Add visibility rules logic
5. Write unit tests for ActionRegistry

**Complexity**: LOW
**Estimated Time**: 2-3 days
**Dependencies**: None

**Deliverables**:
- `/packages/shared/src/types/siblingActions.ts`
- `/packages/web/src/lib/ActionRegistry.ts`
- Tests passing for action registration and filtering

---

### Phase 1.2: Context Detection (Days 4-5)

**Tasks**:
1. Create ContextDetector class
2. Implement node type inference logic
3. Add dependency/blocking detection
4. Create NodeContext interface
5. Write unit tests for context analysis

**Complexity**: MEDIUM
**Estimated Time**: 2 days
**Dependencies**: Phase 1.1

**Deliverables**:
- `/packages/web/src/lib/ContextDetector.ts`
- Tests for all context detection scenarios

---

### Phase 1.3: Positioning & Layout (Days 6-7)

**Tasks**:
1. Implement calculateArcPositions
2. Implement calculateStackPositions
3. Implement calculateRingPositions
4. Add layout selection logic
5. Handle edge cases (viewport boundaries, overlapping nodes)
6. Write visual tests

**Complexity**: MEDIUM
**Estimated Time**: 2 days
**Dependencies**: Phase 1.1

**Deliverables**:
- `/packages/web/src/lib/d3/siblingPositioning.ts`
- Visual regression tests (Playwright)

---

### Phase 1.4: D3.js Rendering (Days 8-10)

**Tasks**:
1. Create siblingRenderer.ts with D3.js rendering logic
2. Implement renderSiblingNodes function
3. Add sibling node SVG structure (circle + icon + label)
4. Implement click/hover event handlers
5. Add collision avoidance with primary nodes
6. Test rendering performance

**Complexity**: HIGH
**Estimated Time**: 3 days
**Dependencies**: Phase 1.3

**Deliverables**:
- `/packages/web/src/lib/d3/siblingRenderer.ts`
- Sibling nodes rendering correctly in graph
- No performance degradation on 100+ node graphs

---

### Phase 1.5: Animation System (Days 11-12)

**Tasks**:
1. Implement animateAppearance with D3.js transitions
2. Implement animateDisappearance with callbacks
3. Add hover animations
4. Implement grouped sibling expand/collapse animations
5. Smooth animation sequencing (avoid jank)
6. Test animation performance

**Complexity**: MEDIUM
**Estimated Time**: 2 days
**Dependencies**: Phase 1.4

**Deliverables**:
- Smooth 60fps animations
- No animation conflicts
- Graceful handling of rapid selection changes

---

### Phase 1.6: GraphView Integration (Days 13-15)

**Tasks**:
1. Modify GraphView.tsx to render sibling nodes
2. Add selectedNode state management for siblings
3. Integrate ActionRegistry with GraphView
4. Connect sibling clicks to action handlers
5. Handle graph updates from sibling actions
6. Add loading states for async actions
7. Test full user flow (select → sibling appear → click → action → update)

**Complexity**: MEDIUM
**Estimated Time**: 3 days
**Dependencies**: Phase 1.5

**Deliverables**:
- GraphView.tsx updated with sibling node support
- Full click-to-action flow working
- WebSocket updates triggering re-render

---

### Phase 1.7: Action Handlers (Days 16-18)

**Tasks**:
1. Implement handlers for 10 core actions:
   - Add Task
   - Add Note
   - Add Child
   - View Details (modal or side panel)
   - View Dependencies (highlight mode)
   - Mark Complete
   - Update Progress
   - Start Task
   - Delete Node
   - Ask AI (placeholder for Phase 3)
2. Add error handling and user feedback
3. Add confirmation dialogs for destructive actions
4. Test all action handlers

**Complexity**: MEDIUM
**Estimated Time**: 3 days
**Dependencies**: Phase 1.6

**Deliverables**:
- 10 working action handlers
- Proper error handling and user feedback
- Confirmation flows for destructive actions

---

### Phase 1.8: Grouped Siblings (Days 19-20)

**Tasks**:
1. Implement group parent action type
2. Add expand/collapse logic
3. Calculate sub-sibling positions
4. Render sub-siblings with indentation/hierarchy
5. Test nested interaction flows

**Complexity**: MEDIUM
**Estimated Time**: 2 days
**Dependencies**: Phase 1.7

**Deliverables**:
- Working grouped sibling menus
- At least 1 group (e.g., "Create" with Add Task, Add Note, Add Child)
- Smooth expand/collapse animations

---

### Phase 1.9: Polish & Refinement (Days 21-22)

**Tasks**:
1. Add tooltips for sibling actions
2. Improve visual styling (colors, spacing)
3. Add keyboard shortcuts (Esc to deselect, numbers for siblings)
4. Optimize rendering performance
5. Fix edge cases and bugs from user testing
6. Add accessibility (ARIA labels, focus management)

**Complexity**: LOW
**Estimated Time**: 2 days
**Dependencies**: Phase 1.8

**Deliverables**:
- Polished visual design
- Keyboard navigation working
- Performance optimized
- Accessibility features implemented

---

### Phase 1.10: Documentation & Testing (Days 23-24)

**Tasks**:
1. Write developer documentation (how to add new actions)
2. Create user guide (how sibling nodes work)
3. Add JSDoc comments to all public APIs
4. Achieve 80% test coverage
5. Run E2E tests (Playwright)
6. Create demo video

**Complexity**: LOW
**Estimated Time**: 2 days
**Dependencies**: Phase 1.9

**Deliverables**:
- Complete documentation
- 80%+ test coverage
- Passing E2E tests
- Demo video showcasing sibling nodes

---

## 6. Testing Strategy

### 6.1 Unit Tests (Vitest)

**Coverage Areas**:
1. **ActionRegistry**:
   - Action registration/unregistration
   - Filtering by visibility rules
   - Action execution
   - Edge cases (duplicate IDs, missing handlers)

2. **ContextDetector**:
   - Node type inference
   - Dependency detection
   - Status analysis
   - Edge cases (empty graph, orphaned nodes)

3. **Positioning Logic**:
   - Arc layout calculations
   - Stack layout calculations
   - Ring layout calculations
   - Boundary conditions (negative coords, overlaps)

**Target Coverage**: 90%+ for logic modules

### 6.2 Component Tests (React Testing Library)

**Coverage Areas**:
1. **GraphView with Siblings**:
   - Sibling nodes appear on selection
   - Sibling nodes disappear on deselection
   - Correct actions shown for different node types
   - Click handlers execute properly

2. **Action Handlers**:
   - Each action modifies graph correctly
   - Error states handled gracefully
   - Loading states displayed properly

**Target Coverage**: 80%+ for components

### 6.3 Visual Regression Tests (Playwright)

**Test Cases**:
1. Sibling node appearance (screenshot comparison)
2. Different layouts (arc, stack, ring)
3. Hover effects
4. Animation sequences
5. Grouped sibling expansion
6. Multiple nodes selected in sequence

**Target**: No visual regressions on PR merge

### 6.4 E2E Tests (Playwright)

**User Flows**:
1. **Happy Path**:
   - Load graph
   - Click node
   - See siblings appear
   - Click "Add Task" sibling
   - Enter task name
   - Verify new node created
   - Verify WebSocket update

2. **Grouped Actions**:
   - Click node
   - Click "Create" group sibling
   - See sub-siblings expand
   - Click "Add Note"
   - Enter note text
   - Verify note node attached

3. **Context-Aware Actions**:
   - Create TASK node (via tags)
   - Mark as IN_PROGRESS
   - Verify "Mark Complete" sibling appears
   - Mark as BLOCKED
   - Verify "Unblock" sibling appears

**Target**: 100% of critical flows passing

### 6.5 Performance Tests

**Metrics**:
1. **Rendering Time**: Siblings appear within 300ms of selection
2. **Animation FPS**: 60fps during animations
3. **Large Graph Performance**: No lag on 500+ node graphs
4. **Memory Usage**: No memory leaks after 50+ selections

**Tools**: Chrome DevTools Performance profiler

---

## 7. Success Criteria

### 7.1 Functional Requirements

- [ ] Sibling nodes appear on node selection
- [ ] Sibling nodes disappear on deselection or canvas click
- [ ] At least 10 actions implemented and working
- [ ] Context-aware action filtering working (show different actions for different node types/statuses)
- [ ] Grouped siblings (at least 1 group) working with expand/collapse
- [ ] All actions execute successfully and update graph
- [ ] Animations smooth (60fps) and visually appealing
- [ ] No context menu (replaced by siblings)
- [ ] WebSocket updates trigger re-render with new siblings

### 7.2 Non-Functional Requirements

- [ ] **Performance**: No noticeable lag on graphs up to 500 nodes
- [ ] **Test Coverage**: 80%+ overall, 90%+ for core logic
- [ ] **Code Quality**: ESLint passing, TypeScript strict mode, no console errors
- [ ] **Accessibility**: Keyboard navigation working, ARIA labels present
- [ ] **Documentation**: Developer guide for adding new actions
- [ ] **Browser Support**: Chrome, Firefox, Safari (latest versions)

### 7.3 User Experience Requirements

- [ ] **Discoverability**: New users can find actions without instructions
- [ ] **Speed**: Common actions (Add Task, Mark Complete) within 2 clicks
- [ ] **Visual Clarity**: Sibling nodes clearly distinguishable from primary nodes
- [ ] **Feedback**: Clear visual feedback on action execution (loading, success, error)
- [ ] **Error Handling**: Graceful error messages, no crashes

### 7.4 Migration Success

- [ ] 80%+ of sidebar actions migrated to sibling nodes
- [ ] Context menu deprecated (can be removed in Phase 2)
- [ ] User testing with 5+ developers shows positive feedback
- [ ] No feature regressions from Phase 0

---

## 8. Specific Metrics to Measure

### 8.1 Development Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Implementation Time** | 22-24 days | Actual days to complete |
| **Test Coverage** | 80%+ | Vitest/Istanbul report |
| **Bug Count** | <10 P0/P1 bugs | GitHub Issues |
| **Code Quality** | 0 ESLint errors | CI/CD pipeline |

### 8.2 Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Sibling Render Time** | <300ms | Chrome DevTools |
| **Animation FPS** | 60fps | Chrome DevTools |
| **Graph Render (500 nodes)** | <2s | Custom timer |
| **Action Execution** | <500ms (local ops) | Custom timer |

### 8.3 User Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Action Discoverability** | 90%+ users find actions without help | User testing survey |
| **Clicks to Complete Task** | Avg 2-3 clicks | Analytics tracking |
| **User Satisfaction** | 4.5/5 stars | User survey |
| **Feature Adoption** | 80%+ of actions via siblings (not sidebar) | Analytics tracking |

---

## 9. Risk Mitigation

### 9.1 Technical Risks

**Risk**: D3.js performance degrades with sibling nodes
**Mitigation**:
- Render siblings outside force simulation (fixed positions)
- Limit sibling count per node (max 10 primary actions)
- Use D3.js transitions instead of React state for animations
- Test performance early (Phase 1.4)

**Risk**: Animation jank on slower devices
**Mitigation**:
- Use CSS transforms (GPU-accelerated) where possible
- Implement requestAnimationFrame throttling
- Add "reduced motion" preference support
- Test on low-end devices

**Risk**: Complex state management with nested sibling groups
**Mitigation**:
- Keep group nesting to max 2 levels
- Use immutable state updates
- Clear state on deselection
- Add state debugging tools

### 9.2 UX Risks

**Risk**: Users confused by disappearing siblings
**Mitigation**:
- Add visual hint (glow) on selected node
- Implement "sticky" mode (siblings stay visible)
- Add onboarding tutorial
- User test early (Phase 1.6)

**Risk**: Too many actions overwhelming users
**Mitigation**:
- Implement action prioritization (show most relevant first)
- Use grouped siblings aggressively (max 7 top-level actions)
- Add "More actions..." overflow group
- Allow user customization (future)

**Risk**: Accidental clicks on siblings
**Mitigation**:
- Add confirmation dialogs for destructive actions
- Implement undo/redo (Phase 2)
- Increase click target size (larger than visual circle)
- Add hover delay before action (150ms)

---

## 10. Open Questions & Future Work

### 10.1 Open Questions

1. **Action Customization**: Should users be able to customize which actions appear? (Defer to Phase 3)
2. **Mobile Support**: How do siblings work on touch devices? (Consider Phase 5)
3. **Action History**: Should we track which actions are used most? (Add analytics in Phase 2)
4. **Multi-Select**: Can siblings work with multiple nodes selected? (Future enhancement)

### 10.2 Future Enhancements (Phase 2+)

**Phase 2**:
- Add 15+ more action types (scans, integrations)
- Implement action search/filter
- Add action history tracking
- Create action marketplace (community actions)

**Phase 3**:
- AI-powered action suggestions ("You might want to...")
- Contextual help (explain why action is available)
- Keyboard shortcuts for all actions
- Custom action creation UI

**Phase 4**:
- Mobile-optimized sibling UI (tap and hold)
- Voice-activated actions ("Create task")
- Collaborative actions (assign to teammate)
- Action templates (sequences of actions)

---

## 11. Appendix: Example Actions

### 11.1 Foundational Actions

```typescript
// Example 1: Add Task
const addTaskAction: SiblingAction = {
  id: 'add-task',
  label: 'Add Task',
  icon: '✓',
  category: 'create',
  visibilityRules: [
    { field: 'always', operator: 'equals', value: true }
  ],
  priority: 1,
  handler: async (node, context) => {
    const label = prompt('Enter task name:');
    if (!label) return { success: false };

    const newNode = {
      id: `task-${Date.now()}`,
      label,
      status: 'idle',
      priority: 2,
      tags: ['task']
    };

    await context.apiClient.addNode(context.projectId, newNode);
    await context.apiClient.addEdge(context.projectId, {
      source: node.id,
      target: newNode.id,
      kind: 'parent'
    });

    return { success: true, message: 'Task created' };
  }
};

// Example 2: View Dependencies (context-aware)
const viewDependenciesAction: SiblingAction = {
  id: 'view-dependencies',
  label: 'Dependencies',
  icon: '🔗',
  category: 'view',
  visibilityRules: [
    { field: 'hasDependencies', operator: 'equals', value: true }
  ],
  priority: 2,
  handler: async (node, context) => {
    // Trigger dependency focus mode (Phase 3)
    // For now, just log
    console.log('Showing dependencies for:', node.id);
    return { success: true };
  }
};

// Example 3: Mark Complete (status-dependent)
const markCompleteAction: SiblingAction = {
  id: 'mark-complete',
  label: 'Complete',
  icon: '✓',
  category: 'state-change',
  visibilityRules: [
    { field: 'status', operator: 'not-equals', value: 'completed' },
    { field: 'tags', operator: 'contains', value: 'task' }
  ],
  priority: 1,
  handler: async (node, context) => {
    await context.apiClient.patchNode(context.projectId, node.id, {
      status: 'completed',
      progress: 1.0
    });

    return {
      success: true,
      message: 'Task marked complete',
      nodeUpdate: { status: 'completed', progress: 1.0 }
    };
  }
};

// Example 4: Grouped Action (Create Group)
const createGroupAction: SiblingAction = {
  id: 'create-group',
  label: 'Create',
  icon: '➕',
  category: 'create',
  isGroupParent: true,
  group: 'create',
  visibilityRules: [
    { field: 'always', operator: 'equals', value: true }
  ],
  priority: 1,
  handler: async () => {
    // Group parents don't execute, they expand
    return { success: true };
  }
};

// Child actions of Create Group
const addNoteAction: SiblingAction = {
  id: 'add-note',
  label: 'Note',
  icon: '📝',
  category: 'create',
  group: 'create',
  visibilityRules: [
    { field: 'always', operator: 'equals', value: true }
  ],
  priority: 2,
  handler: async (node, context) => {
    const text = prompt('Enter note:');
    if (!text) return { success: false };

    const newNode = {
      id: `note-${Date.now()}`,
      label: text.substring(0, 30),
      status: 'ok',
      priority: 1,
      tags: ['note'],
      metadata: { fullText: text }
    };

    await context.apiClient.addNode(context.projectId, newNode);
    await context.apiClient.addEdge(context.projectId, {
      source: node.id,
      target: newNode.id,
      kind: 'parent'
    });

    return { success: true, message: 'Note added' };
  }
};
```

---

## 12. Developer Quick Start

### Adding a New Sibling Action (Post-Phase 1)

```typescript
// 1. Define your action in actionDefinitions.ts
export const myCustomAction: SiblingAction = {
  id: 'my-custom-action',
  label: 'My Action',
  icon: '🚀',
  category: 'view', // or 'create', 'state-change', etc.
  visibilityRules: [
    // When should this action appear?
    { field: 'status', operator: 'equals', value: 'in-progress' }
  ],
  priority: 5, // Lower = higher priority
  handler: async (node, context) => {
    // Your logic here
    // Return ActionResult
    return { success: true, message: 'Action completed!' };
  }
};

// 2. Register it in ActionRegistry initialization
actionRegistry.register(myCustomAction);

// 3. That's it! The action will now appear automatically
//    when visibility rules are met
```

---

## Document History

- **v1.0** - Initial specification (September 30, 2025)
- **Author**: Claude Code (Architect Agent)
- **Reviewed by**: Daniel Connolly
- **Status**: Approved for implementation

---

**Next Steps**: Begin Phase 1.1 (Foundation) - Create data models and ActionRegistry

**Questions?** Contact: Daniel Connolly (@danielconnolly)

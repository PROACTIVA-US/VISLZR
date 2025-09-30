# PHASE 2: Advanced Visualizations - Implementation Plan

**Project**: Vislzr - AI-Native Project Visualization Platform
**Phase**: 2 - Advanced Visualizations (Previously Phase 3 in PRD)
**Duration**: 3-4 weeks
**Priority**: MEDIUM
**Date**: 2025-09-30

---

## Executive Summary

Phase 2 enhances Vislzr's visualization capabilities with advanced features that provide deeper insights into project structure, dependencies, and health. The focus is on **dependency focus mode**, **timeline overlay**, **mini-map navigator**, and **multi-view modes**.

**Goals:**
- Implement dependency focus mode with dim/highlight
- Build interactive timeline overlay
- Add mini-map navigator
- Create 5+ visualization modes
- Smooth transitions between modes

**Success Criteria:**
- Dependency chains clearly visualized
- Timeline overlay functional with click-to-focus
- Mini-map shows viewport and allows navigation
- 5+ view modes implemented
- Smooth transitions (<500ms)
- >70% test coverage maintained

---

## Phase 2 Overview (PRD Section 4.3)

### Core Features

#### 1. Dependency Focus Mode
**Trigger**: Click "View Dependencies" sibling action

**Behavior:**
- Dim all unrelated nodes (opacity: 0.2)
- Highlight selected node (glow effect)
- **Upstream dependencies** (what this needs): bright blue (#3B82F6)
- **Downstream dependents** (what needs this): bright green (#10B981)
- Connection lines thicken (2px → 4px) and animate
- Blocking dependencies pulse in red (#EF4444)
- Escape key or click canvas to exit

#### 2. Project Timeline Overlay
**Trigger**: Toggle button or "View Timeline" action

**Features:**
- D3-powered timeline at bottom of canvas
- Shows all tasks with due dates and milestones
- Node health colors match canvas
- Hover to see task details
- Click to focus node on canvas
- Connectors draw from timeline to canvas nodes
- Critical path highlighting
- Zoom/pan timeline independently

#### 3. Mini-Map Navigator
**Location**: Bottom-right corner (persistent)

**Features:**
- Shows full project layout (scaled down)
- Viewport indicator (semi-transparent rect)
- Click to pan to any area
- Auto-updates as canvas changes
- Health color coding preserved
- Drag viewport to pan main canvas

#### 4. Multi-View Modes
**Modes to Implement:**
- **Graph View** (current): Force-directed mind map
- **Tree View**: Hierarchical top-down tree
- **Timeline View**: Gantt-chart style timeline
- **Dependency Matrix**: Grid showing all dependencies
- **Heat Map**: Color-coded by health, priority, or activity

**UI:** View mode switcher in toolbar

---

## Technical Architecture

### Data Structures

#### Dependency Graph
```typescript
interface DependencyGraph {
  selectedNodeId: string;
  upstream: string[];       // Nodes this depends on
  downstream: string[];     // Nodes that depend on this
  blocking: string[];       // Blocking dependencies
  paths: DependencyPath[];  // All dependency paths
}

interface DependencyPath {
  nodes: string[];
  isBlocking: boolean;
  depth: number;
}
```

#### Timeline Data
```typescript
interface TimelineItem {
  id: string;
  nodeId: string;
  label: string;
  startDate: Date;
  dueDate: Date;
  status: NodeStatus;
  progress: number;
  dependencies: string[];
  isCriticalPath: boolean;
}

interface TimelineScale {
  startDate: Date;
  endDate: Date;
  zoom: number;
  offset: number;
}
```

#### Mini-Map Data
```typescript
interface MiniMapConfig {
  width: number;
  height: number;
  scale: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
}
```

#### View Mode
```typescript
type ViewMode = 'graph' | 'tree' | 'timeline' | 'matrix' | 'heatmap';

interface ViewModeConfig {
  mode: ViewMode;
  previousMode: ViewMode;
  isTransitioning: boolean;
}
```

---

## Implementation Tasks

### Task 1: Dependency Focus Mode

#### Frontend Files

**File**: `packages/web/src/utils/dependencyAnalysis.ts`

**Purpose**: Analyze dependency graph for a selected node

**Functions:**
```typescript
export const analyzeDependencies = (
  nodeId: string,
  nodes: NodeData[],
  edges: EdgeData[]
): DependencyGraph => {
  // Find all upstream dependencies (what this needs)
  // Find all downstream dependents (what needs this)
  // Identify blocking dependencies
  // Calculate dependency paths
  // Return graph structure
};

export const findUpstreamDependencies = (
  nodeId: string,
  edges: EdgeData[]
): string[] => {
  // Recursively find all upstream dependencies
};

export const findDownstreamDependents = (
  nodeId: string,
  edges: EdgeData[]
): string[] => {
  // Recursively find all downstream dependents
};

export const identifyBlockingDependencies = (
  dependencies: string[],
  nodes: NodeData[]
): string[] => {
  // Find dependencies with incomplete/blocked status
};
```

**File**: `packages/web/src/components/Canvas/DependencyFocusMode.tsx`

**Purpose**: Render dependency focus visualization

**Component:**
```typescript
interface DependencyFocusModeProps {
  selectedNode: NodeData;
  dependencyGraph: DependencyGraph;
  nodes: NodeData[];
  edges: EdgeData[];
  onExit: () => void;
}

export const DependencyFocusMode: React.FC<DependencyFocusModeProps> = ({
  selectedNode,
  dependencyGraph,
  nodes,
  edges,
  onExit
}) => {
  // Render dimmed nodes
  // Highlight selected node
  // Color upstream/downstream
  // Animate connections
  // Handle exit (Escape key, click)
};
```

**File**: `packages/web/src/hooks/useDependencyFocus.ts`

**Purpose**: Manage dependency focus state

**Hook:**
```typescript
export const useDependencyFocus = (
  selectedNodeId: string | null,
  nodes: NodeData[],
  edges: EdgeData[]
) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dependencyGraph, setDependencyGraph] = useState<DependencyGraph | null>(null);

  const enterFocusMode = () => {
    // Analyze dependencies
    // Set focus mode
  };

  const exitFocusMode = () => {
    // Clear focus mode
  };

  return { isFocusMode, dependencyGraph, enterFocusMode, exitFocusMode };
};
```

---

### Task 2: Timeline Overlay

#### Frontend Files

**File**: `packages/web/src/components/Timeline/TimelineOverlay.tsx`

**Purpose**: Render timeline at bottom of canvas

**Component:**
```typescript
interface TimelineOverlayProps {
  items: TimelineItem[];
  scale: TimelineScale;
  onItemClick: (nodeId: string) => void;
  onScaleChange: (scale: TimelineScale) => void;
}

export const TimelineOverlay: React.FC<TimelineOverlayProps> = ({
  items,
  scale,
  onItemClick,
  onScaleChange
}) => {
  // Render D3 timeline
  // Show tasks and milestones
  // Color by status
  // Handle zoom/pan
  // Draw connectors to canvas
  // Highlight critical path
};
```

**File**: `packages/web/src/utils/timelineCalculations.ts`

**Purpose**: Calculate timeline positions and scales

**Functions:**
```typescript
export const calculateTimelineScale = (
  items: TimelineItem[]
): TimelineScale => {
  // Find min/max dates
  // Calculate default zoom
};

export const calculateItemPosition = (
  item: TimelineItem,
  scale: TimelineScale
): { x: number; width: number } => {
  // Convert dates to pixel positions
};

export const findCriticalPath = (
  items: TimelineItem[]
): string[] => {
  // Identify critical path (longest dependency chain)
};
```

**File**: `packages/web/src/hooks/useTimeline.ts`

**Purpose**: Manage timeline state

**Hook:**
```typescript
export const useTimeline = (nodes: NodeData[]) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState<TimelineScale | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);

  // Convert nodes to timeline items
  // Calculate scale
  // Handle visibility toggle

  return { isVisible, items, scale, toggleTimeline, setScale };
};
```

---

### Task 3: Mini-Map Navigator

#### Frontend Files

**File**: `packages/web/src/components/Canvas/MiniMap.tsx`

**Purpose**: Render mini-map in corner

**Component:**
```typescript
interface MiniMapProps {
  nodes: NodeData[];
  edges: EdgeData[];
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  };
  onViewportChange: (x: number, y: number) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  edges,
  viewport,
  onViewportChange
}) => {
  // Render scaled-down graph
  // Show viewport indicator
  // Handle click to pan
  // Handle drag viewport
  // Update on canvas changes
};
```

**File**: `packages/web/src/hooks/useMiniMap.ts`

**Purpose**: Manage mini-map state and viewport sync

**Hook:**
```typescript
export const useMiniMap = (
  nodes: NodeData[],
  canvasTransform: d3.ZoomTransform
) => {
  const [config, setConfig] = useState<MiniMapConfig>({
    width: 200,
    height: 150,
    scale: 0.1,
    viewportX: 0,
    viewportY: 0,
    viewportWidth: 100,
    viewportHeight: 100
  });

  // Calculate viewport from canvas transform
  // Update on canvas zoom/pan

  return { config, panToPosition };
};
```

---

### Task 4: Multi-View Modes

#### Frontend Files

**File**: `packages/web/src/components/Canvas/TreeView.tsx`

**Purpose**: Hierarchical tree layout

**Component:**
```typescript
export const TreeView: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodeClick
}) => {
  // D3 tree layout
  // Top-down hierarchy
  // Collapsible branches
};
```

**File**: `packages/web/src/components/Canvas/MatrixView.tsx`

**Purpose**: Dependency matrix grid

**Component:**
```typescript
export const MatrixView: React.FC<CanvasProps> = ({
  nodes,
  edges
}) => {
  // Grid layout: rows = nodes, cols = nodes
  // Cell = dependency relationship
  // Color by dependency type
};
```

**File**: `packages/web/src/components/Canvas/HeatMapView.tsx`

**Purpose**: Color-coded heat map

**Component:**
```typescript
export const HeatMapView: React.FC<CanvasProps> = ({
  nodes,
  metric: 'health' | 'priority' | 'activity'
}) => {
  // Treemap layout
  // Color by selected metric
  // Size by priority or complexity
};
```

**File**: `packages/web/src/hooks/useViewMode.ts`

**Purpose**: Manage view mode state

**Hook:**
```typescript
export const useViewMode = () => {
  const [mode, setMode] = useState<ViewMode>('graph');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchMode = async (newMode: ViewMode) => {
    setIsTransitioning(true);
    // Animate transition
    setMode(newMode);
    // Save preference
    setIsTransitioning(false);
  };

  return { mode, isTransitioning, switchMode };
};
```

**File**: `packages/web/src/components/Toolbar/ViewModeSwitcher.tsx`

**Purpose**: UI for switching view modes

**Component:**
```typescript
export const ViewModeSwitcher: React.FC<{
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}> = ({ currentMode, onModeChange }) => {
  // Button group for each view mode
  // Icons for each mode
  // Keyboard shortcuts (1-5)
};
```

---

## Styling & Visual Design

### Dependency Focus Mode Colors

```typescript
const DEPENDENCY_COLORS = {
  dimmed: 'opacity-20',              // Unrelated nodes
  selected: '#FBBF24',               // Selected node (yellow glow)
  upstream: '#3B82F6',               // What this needs (blue)
  downstream: '#10B981',             // What needs this (green)
  blocking: '#EF4444',               // Blocking deps (red, pulsing)
  connectionUpstream: '#3B82F6',     // Connection lines
  connectionDownstream: '#10B981',
  connectionBlocking: '#EF4444',
};
```

### Timeline Overlay Styles

```css
.timeline-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: rgba(17, 24, 39, 0.95);
  border-top: 2px solid #374151;
  backdrop-filter: blur(8px);
}

.timeline-item {
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.timeline-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.timeline-connector {
  stroke: #6b7280;
  stroke-width: 1;
  stroke-dasharray: 3, 3;
}

.critical-path {
  stroke: #ef4444;
  stroke-width: 3;
}
```

### Mini-Map Styles

```css
.mini-map {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  background: rgba(17, 24, 39, 0.9);
  border: 2px solid #374151;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

.mini-map-viewport {
  fill: rgba(59, 130, 246, 0.2);
  stroke: #3b82f6;
  stroke-width: 2;
  cursor: move;
}
```

---

## Testing Strategy

### Frontend Tests

#### 1. Dependency Analysis Tests
**File**: `packages/web/src/utils/__tests__/dependencyAnalysis.test.ts`

**Coverage:**
- Find upstream dependencies
- Find downstream dependents
- Identify blocking dependencies
- Calculate dependency paths
- Handle circular dependencies
- Empty graph edge cases

#### 2. Timeline Tests
**File**: `packages/web/src/components/Timeline/__tests__/TimelineOverlay.test.tsx`

**Coverage:**
- Render timeline items
- Calculate positions correctly
- Handle zoom/pan
- Click to focus node
- Critical path identification
- Empty timeline

#### 3. Mini-Map Tests
**File**: `packages/web/src/components/Canvas/__tests__/MiniMap.test.tsx`

**Coverage:**
- Render scaled graph
- Show viewport indicator
- Click to pan
- Drag viewport
- Sync with canvas transform

#### 4. View Mode Tests
**File**: `packages/web/src/hooks/__tests__/useViewMode.test.ts`

**Coverage:**
- Switch between modes
- Transition animations
- Save preferences
- Keyboard shortcuts

---

## Phased Rollout

### Week 1: Dependency Focus Mode
- ✅ Dependency analysis utilities
- ✅ DependencyFocusMode component
- ✅ useDependencyFocus hook
- ✅ Dim/highlight logic
- ✅ Connection animations
- ✅ Tests (>70% coverage)

### Week 2: Timeline Overlay & Mini-Map
- ✅ Timeline calculations
- ✅ TimelineOverlay component
- ✅ MiniMap component
- ✅ Viewport synchronization
- ✅ Click-to-focus
- ✅ Tests (>70% coverage)

### Week 3: Multi-View Modes (Basic)
- ✅ TreeView component
- ✅ ViewModeSwitcher UI
- ✅ useViewMode hook
- ✅ Transition animations
- ✅ View persistence
- ✅ Tests (>70% coverage)

### Week 4: Multi-View Modes (Advanced) & Polish
- ✅ MatrixView component
- ✅ HeatMapView component
- ✅ TimelineView component
- ✅ Polish animations
- ✅ Integration testing
- ✅ Performance optimization
- ✅ Documentation updates
- ✅ Phase 2 completion report

---

## Success Metrics

### Functional Metrics
- ✅ Dependency focus mode highlights correctly
- ✅ Timeline shows all scheduled items
- ✅ Mini-map viewport syncs with canvas
- ✅ 5+ view modes functional
- ✅ Smooth transitions (<500ms)
- ✅ All tests passing
- ✅ >70% test coverage maintained

### Performance Metrics
- ⏱ Dependency analysis: <100ms
- ⏱ Timeline render: <200ms
- ⏱ Mini-map update: <50ms
- ⏱ View mode transition: <500ms
- 📊 Canvas framerate: >30fps (all modes)

### User Experience Metrics
- 🎯 Dependency chains clearly visible
- 🎯 Timeline intuitive and interactive
- 🎯 Mini-map useful for navigation
- 🎯 View modes provide different insights
- 🎯 Smooth, professional transitions

---

## Risk Mitigation

### Risk: Performance Degradation with Large Graphs
**Mitigation**:
- Virtualize timeline items
- Simplify mini-map for 500+ nodes
- Optimize D3 selections
- Use requestAnimationFrame for animations
- Implement LOD (level of detail) for mini-map

### Risk: Dependency Analysis Complexity
**Mitigation**:
- Cache analysis results
- Limit depth for circular dependency detection
- Show warning for overly complex graphs
- Provide "Simplified View" option

### Risk: Timeline Cluttered with Many Tasks
**Mitigation**:
- Group tasks by milestone
- Implement zoom levels (day/week/month)
- Filter by status or priority
- Collapsible groups

---

## PRD Alignment

### Phase 3 (Advanced Visualizations) - Section 4.3 ✅

**PRD Requirements:**
- [ ] Dependency focus mode (dim, highlight, animate)
- [ ] Timeline overlay with node connectors
- [ ] Mini-map with viewport indicator
- [ ] Tree view mode
- [ ] Dependency matrix view
- [ ] Heat map visualizations
- [ ] View persistence (remember last view mode)

**Deliverables:**
- [ ] 5+ visualization modes working
- [ ] Smooth transitions between modes
- [ ] User preferences for default views

---

## Next Steps After Phase 2

**Phase 3 (Renamed Phase 4): AI Deep Integration (Weeks 5-8)**
- Contextual AI assistant
- Security/optimization scans
- Consensus agents
- Scan result visualization

**Phase 4 (Renamed Phase 5): Code Integration (Weeks 9-12)**
- In-canvas code viewer/editor
- File system sync
- Git integration

---

## Appendix: View Mode Descriptions

### Graph View (Default)
- Force-directed layout
- Organic, mind-map style
- Best for: Exploration, understanding relationships

### Tree View
- Hierarchical top-down
- Parent-child relationships clear
- Best for: Understanding structure, drilling down

### Timeline View
- Gantt-chart style
- Horizontal time axis
- Best for: Project planning, deadline tracking

### Dependency Matrix
- Grid layout (N×N)
- Rows and columns = nodes
- Best for: Understanding all dependencies at once

### Heat Map
- Treemap layout
- Color by metric (health, priority, activity)
- Best for: Identifying hotspots, problem areas

---

**Status**: 📋 PLANNING COMPLETE - Ready for Implementation
**Next Action**: Begin Week 1 - Dependency Focus Mode
**Priority**: MEDIUM
**Estimated Completion**: 3-4 weeks

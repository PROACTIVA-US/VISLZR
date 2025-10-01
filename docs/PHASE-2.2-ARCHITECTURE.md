# Phase 2.2 Architecture Decisions

**Date**: 2025-09-30
**Architect**: Architecture Agent
**Status**: ✅ Complete - Ready for Development

---

## Executive Summary

All architectural decisions for Phase 2.2 (Action Handlers & View Integration) are finalized. The architecture follows consistent patterns from Phase 2.1, prioritizes simplicity and user experience, and sets up a clean path for Phase 2.3 enhancements.

**Key Principles**:
- **Consistency**: Match existing UI patterns (SidePanel, D3.js canvas)
- **Progressive enhancement**: Start simple, add advanced features in later phases
- **Non-blocking**: Panels and overlays don't interrupt canvas interaction
- **Discoverability**: Keyboard shortcuts with tooltips, familiar UI patterns

---

## Decision 1: Dependency Visualization

### Chosen Approach: **Side Panel Pattern**

**Rationale**:
- Matches existing `SidePanel.tsx` UX pattern
- Non-blocking canvas interaction
- Familiar to users
- Phased approach: Simple panel now, focus mode in Phase 2.3

**Technical Specification**:

```typescript
// Component: DependencyPanel.tsx
interface DependencyPanelProps {
  node: NodeData;
  graph: GraphData;
  onClose: () => void;
  onZoomToFit: (nodeIds: NodeID[]) => void;
}

// Layout
- Width: 320px (w-80, same as SidePanel)
- Position: Fixed right, slide-in animation
- Sections:
  1. Header: "Dependencies for {node.label}"
  2. Incoming: Nodes that depend on this node
  3. Outgoing: Nodes this node depends on
  4. Footer: "Zoom to Fit" button
```

**Canvas Integration**:
- Highlight dependency paths with D3.js stroke color change
- Incoming edges: `stroke: #3b82f6` (blue)
- Outgoing edges: `stroke: #10b981` (green)
- Cyclic dependencies: Show warning badge

**Files**:
- Create: `packages/web/src/components/Panels/DependencyPanel.tsx`
- Create: `packages/web/src/components/Panels/DependencyPanel.module.css`
- Modify: `packages/web/src/components/GraphView.tsx` (state + handler)

**Alternatives Considered**:
- ❌ Overlay: Too intrusive, blocks canvas
- ❌ Modal: Blocks all interaction
- ❌ Focus mode only: Too complex for Phase 2.2

---

## Decision 2: Timeline Visualization

### Chosen Approach: **Horizontal Top Overlay**

**Rationale**:
- Doesn't conflict with side panels
- Natural timeline orientation (left=past, right=future)
- Semi-transparent allows seeing canvas beneath
- Overlay keeps user in canvas context

**Technical Specification**:

```typescript
// Component: TimelineOverlay.tsx
interface TimelineOverlayProps {
  selectedNode: NodeData | null;
  allNodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
  onClose: () => void;
}

// Layout
- Position: Fixed top, full width
- Height: 120px collapsed, 240px expanded
- Transparency: bg-gray-900/90 (90% opacity)
- Sections:
  1. Timeline bar (horizontal, scrollable)
  2. Milestones (default filter)
  3. "Show All Nodes" toggle
  4. Close button (top-right)
```

**Data Source**:
- Primary: `metadata.created_at`, `metadata.due_date`
- Filter: `type === 'MILESTONE'` (default)
- Fallback: Node creation order if no timestamps

**Interaction**:
- Click timeline item → select that node on canvas
- Horizontal scroll if overflow
- ESC key to close
- Arrow keys to navigate (←/→)

**Files**:
- Create: `packages/web/src/components/Overlays/TimelineOverlay.tsx`
- Create: `packages/web/src/components/Overlays/TimelineOverlay.module.css`
- Modify: `packages/web/src/components/GraphView.tsx` (state + handler)

**Alternatives Considered**:
- ❌ Separate view: Loses canvas context
- ❌ Vertical timeline: Unnatural for temporal data
- ❌ Bottom position: May conflict with future elements

---

## Decision 3: Node Details Panel

### Chosen Approach: **Enhanced Panel (400px)**

**Rationale**:
- Avoid duplication with existing `SidePanel`
- Provide richer detail view (metadata, links, timestamps)
- Gradual migration path (deprecate SidePanel in Phase 2.4)

**Technical Specification**:

```typescript
// Component: NodeDetailsPanel.tsx
interface NodeDetailsPanelProps {
  projectId: string;
  node: NodeData;
  onClose: () => void;
  onUpdate: (nodeId: NodeID, updates: Partial<NodeData>) => void;
}

// Layout
- Width: 400px (w-96, wider than SidePanel's 320px)
- Position: Fixed right, slide-in animation
- Sections:
  1. Header: Node name (editable), type badge, status badge
  2. Properties: Priority, progress, tags (editable)
  3. Metadata: Created, updated, due date, assignee (display only)
  4. Description: Rich text area (editable)
  5. Links: File paths, external URLs (if in metadata)
  6. Actions: Save, Cancel, Delete
```

**Features**:
- Inline editing with validation
- Loading state during API updates
- Error messages for invalid inputs
- "Unsaved changes" warning on close

**Files**:
- Create: `packages/web/src/components/Panels/NodeDetailsPanel.tsx`
- Create: `packages/web/src/components/Panels/NodeDetailsPanel.module.css`
- Keep: `packages/web/src/components/SidePanel.tsx` (deprecate in Phase 2.4)

**Alternatives Considered**:
- ❌ Enhance existing SidePanel: Risky, harder to rollback
- ❌ Modal dialog: Blocks canvas
- ❌ Keep both panels: User confusion

---

## Decision 4: Keyboard Shortcuts

### Chosen Approach: **Custom Hook Pattern**

**Rationale**:
- Flexible and composable
- Supports global and contextual shortcuts
- Easy to test and extend
- Familiar React pattern

**Technical Specification**:

```typescript
// Hook: useKeyboardShortcuts.ts
interface KeyboardShortcut {
  key: string;
  handler: () => void;
  modifier?: 'ctrl' | 'cmd' | 'shift';
  context?: 'global' | 'panel' | 'overlay';
}

function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
): void {
  // Implementation details:
  // - Add event listener on mount
  // - Filter out when input/textarea focused
  // - Support modifiers
  // - Remove listener on unmount
}
```

**Shortcuts Defined**:

| Key | Action | Context | Notes |
|-----|--------|---------|-------|
| `Esc` | Close active panel/overlay | Always | Highest priority |
| `d` | View dependencies | Node selected | Opens DependencyPanel |
| `i` | View details (info) | Node selected | Opens NodeDetailsPanel |
| `t` | View timeline | Always | Opens TimelineOverlay |
| `c` | Add child | Node selected | Existing functionality |
| `Space` | Mark complete | Node selected | Quick status update |
| `←/→` | Navigate timeline | Timeline open | Previous/next item |
| `?` | Show help | Always | Future: Help panel |

**Modifier Support**:
- `Cmd/Ctrl + D`: View dependencies (alternative)
- `Cmd/Ctrl + I`: View details (alternative)
- `Cmd/Ctrl + T`: View timeline (alternative)

**Files**:
- Create: `packages/web/src/hooks/useKeyboardShortcuts.ts`
- Modify: `packages/web/src/components/GraphView.tsx` (use hook)

**Alternatives Considered**:
- ❌ Global event listener: Harder to scope by context
- ❌ Third-party library (hotkeys-js): Overkill for our needs
- ❌ Command palette: Phase 3 feature

---

## Decision 5: State Management

### Chosen Approach: **Continue with useState**

**Rationale**:
- Only adding 3-4 new state variables
- Not yet critical (GraphView currently has ~5 state variables)
- Avoid premature optimization
- Re-evaluate in Phase 2.3 if state becomes unwieldy

**State Additions to GraphView**:

```typescript
// GraphView.tsx state additions
const [dependencyPanelOpen, setDependencyPanelOpen] = useState(false);
const [detailsPanelNode, setDetailsPanelNode] = useState<NodeData | null>(null);
const [timelineOverlayOpen, setTimelineOverlayOpen] = useState(false);

// Total GraphView state after Phase 2.2:
// - graph (GraphData)
// - loading (boolean)
// - error (string | null)
// - contextMenu (object | null)
// - selectedNode (NodeData | null)
// - siblingActions (SiblingAction[])
// - dependencyPanelOpen (boolean)
// - detailsPanelNode (NodeData | null)
// - timelineOverlayOpen (boolean)
// Total: 9 state variables → Still manageable
```

**Migration Threshold**:
- If state exceeds **10 variables**, consider zustand
- If state logic becomes complex (multiple interdependencies), consider zustand
- Re-evaluate after Phase 2.2 completion

**Alternatives Considered**:
- ❌ Zustand now: Premature, adds complexity
- ❌ Context API: Overkill for component-local state
- ❌ Redux: Way overkill

---

## Component Architecture

### Directory Structure

```
packages/web/src/
├── components/
│   ├── GraphView.tsx                    # (modified) State + handlers
│   ├── Panels/
│   │   ├── DependencyPanel.tsx         # (new) Dependency visualization
│   │   ├── DependencyPanel.module.css
│   │   ├── NodeDetailsPanel.tsx        # (new) Enhanced details
│   │   ├── NodeDetailsPanel.module.css
│   │   └── index.ts                    # Barrel export
│   └── Overlays/
│       ├── TimelineOverlay.tsx         # (new) Timeline visualization
│       ├── TimelineOverlay.module.css
│       └── index.ts                    # Barrel export
├── hooks/
│   └── useKeyboardShortcuts.ts         # (new) Keyboard shortcuts
└── lib/
    └── initializeActions.ts             # (modified) Update placeholders
```

### Component Interaction Flow

```
GraphView (State Container)
├── Canvas (D3.js)
│   ├── Nodes
│   ├── Edges
│   └── SiblingNodes
├── DependencyPanel (when dependencyPanelOpen)
│   └── Triggers: D3.js edge highlighting
├── NodeDetailsPanel (when detailsPanelNode !== null)
│   └── Triggers: API updates via patchNode
└── TimelineOverlay (when timelineOverlayOpen)
    └── Triggers: Node selection on click

Keyboard Shortcuts (Global)
└── Triggers: Panel/overlay state changes in GraphView
```

---

## Integration Points

### GraphView Modifications

**New State**:
```typescript
const [dependencyPanelOpen, setDependencyPanelOpen] = useState(false);
const [detailsPanelNode, setDetailsPanelNode] = useState<NodeData | null>(null);
const [timelineOverlayOpen, setTimelineOverlayOpen] = useState(false);
```

**New Handlers**:
```typescript
const handleViewDependencies = useCallback(() => {
  if (!selectedNode) return;
  setDependencyPanelOpen(true);
}, [selectedNode]);

const handleViewDetails = useCallback(() => {
  if (!selectedNode) return;
  setDetailsPanelNode(selectedNode);
}, [selectedNode]);

const handleViewTimeline = useCallback(() => {
  setTimelineOverlayOpen(true);
}, []);
```

**Updated Action Handler** (in `handleSiblingActionClick`):
```typescript
switch (action.type) {
  case 'view_dependencies':
    handleViewDependencies();
    break;
  case 'view_details':
    handleViewDetails();
    break;
  case 'view_timeline':
    handleViewTimeline();
    break;
  // ... existing handlers
}
```

**Conditional Rendering**:
```typescript
{/* Dependency Panel */}
{dependencyPanelOpen && selectedNode && graph && (
  <DependencyPanel
    node={selectedNode}
    graph={graph}
    onClose={() => setDependencyPanelOpen(false)}
    onZoomToFit={(nodeIds) => {/* D3.js zoom logic */}}
  />
)}

{/* Node Details Panel */}
{detailsPanelNode && (
  <NodeDetailsPanel
    projectId={projectId}
    node={detailsPanelNode}
    onClose={() => setDetailsPanelNode(null)}
    onUpdate={(id, updates) => patchNode(projectId, id, updates)}
  />
)}

{/* Timeline Overlay */}
{timelineOverlayOpen && graph && (
  <TimelineOverlay
    selectedNode={selectedNode}
    allNodes={graph.nodes}
    onNodeSelect={(node) => {
      setSelectedNode(node);
      onNodeSelect?.(node);
    }}
    onClose={() => setTimelineOverlayOpen(false)}
  />
)}
```

---

## Testing Strategy

### Unit Tests (Vitest + RTL)

**DependencyPanel**:
- Renders incoming and outgoing dependencies
- Highlights edges on mount
- Zoom to fit button calls handler
- Close button works

**NodeDetailsPanel**:
- Displays all node properties
- Inline editing updates state
- Save calls API with correct payload
- Validation shows errors

**TimelineOverlay**:
- Renders milestones by default
- "Show All" toggle includes all nodes
- Click timeline item calls onNodeSelect
- ESC key closes overlay

**useKeyboardShortcuts**:
- Shortcuts fire correct handlers
- Ignores shortcuts when input focused
- Modifiers work correctly
- Cleanup on unmount

### Integration Tests (RTL)

**GraphView + Panels**:
- Clicking "View Dependencies" opens DependencyPanel
- Clicking "View Details" opens NodeDetailsPanel
- Clicking "View Timeline" opens TimelineOverlay
- Keyboard shortcuts trigger correct actions
- Only one panel open at a time (or panel + overlay)

### E2E Tests (Playwright)

**User Flows**:
1. Select node → press 'd' → DependencyPanel opens → highlights edges
2. Select node → press 'i' → NodeDetailsPanel opens → edit name → save → API called
3. Press 't' → TimelineOverlay opens → click milestone → node selected
4. Press 'Esc' → active panel/overlay closes

---

## Performance Considerations

### D3.js Edge Highlighting
- Only highlight on DependencyPanel open (not continuous)
- Debounce highlight updates if graph is large (>100 edges)
- Reset highlights when panel closes

### Timeline Rendering
- Virtualize timeline if >50 nodes
- Lazy render "Show All" nodes (only milestones by default)
- Memoize timeline items to avoid re-renders

### State Updates
- Use `useCallback` for all handlers to prevent re-renders
- Memoize expensive computations (dependency calculation)
- Debounce inline editing API calls (300ms)

---

## Accessibility

### Keyboard Navigation
- All panels/overlays closeable with ESC
- Focus management: Auto-focus first input when panel opens
- Tab order: Logical top-to-bottom, left-to-right

### Screen Readers
- ARIA labels for all interactive elements
- Announce panel open/close events
- Describe keyboard shortcuts in tooltips

### Visual
- Sufficient color contrast (WCAG AA minimum)
- Don't rely on color alone (use icons + text)
- Respect `prefers-reduced-motion` for animations

---

## Security Considerations

### XSS Prevention
- Sanitize node labels and descriptions before rendering
- Use React's built-in escaping (avoid `dangerouslySetInnerHTML`)
- Validate URLs in metadata links

### Input Validation
- Validate node edits on client and server
- Prevent script injection in text fields
- Limit string lengths (name: 100 chars, description: 2000 chars)

### API Security
- No sensitive data in metadata
- Validate all patchNode payloads
- Rate limit edit requests (future)

---

## Migration Path

### Phase 2.2 (Current)
- ✅ Create DependencyPanel, NodeDetailsPanel, TimelineOverlay
- ✅ Add keyboard shortcuts
- ✅ Keep existing SidePanel (both coexist)

### Phase 2.3 (Next)
- Add dependency focus mode (advanced visualization)
- Enhance timeline with drag-to-reorder
- Consider zustand migration if state complex

### Phase 2.4 (Future)
- Deprecate SidePanel in favor of NodeDetailsPanel
- Add command palette (Cmd+K)
- Full keyboard navigation (vim mode?)

---

## Success Metrics

**Phase 2.2 Complete When**:
1. ✅ All 3 view actions implemented and functional
2. ✅ Keyboard shortcuts working for all actions
3. ✅ Test suite passing (80%+ coverage)
4. ✅ No regressions in existing features
5. ✅ Documentation updated (this file + PHASE-2.2-INTEGRATION.md)

---

## Handoff to Development

### Developer Agent Tasks
1. Implement `DependencyPanel.tsx` (6-8 hours)
2. Implement `NodeDetailsPanel.tsx` (4-6 hours)
3. Implement `TimelineOverlay.tsx` (6-8 hours)
4. Implement `useKeyboardShortcuts.ts` (2-3 hours)
5. Update `GraphView.tsx` with state and handlers (2-3 hours)
6. Polish animations and transitions (2-3 hours)

**Total Estimate**: 22-31 hours (2.75-3.9 days)

### QA Agent Tasks
1. Fix type errors in existing tests (3-4 hours)
2. Write unit tests for new components (4-5 hours)
3. Write integration tests (2-3 hours)
4. Write E2E tests (2-3 hours)
5. Run coverage report (1 hour)

**Total Estimate**: 12-16 hours (1.5-2 days)

### Parallel Work
- Developer can start NodeDetailsPanel immediately (least dependencies)
- QA can fix type errors in parallel with development
- Security review after components complete

---

**Architecture Status**: ✅ **COMPLETE**
**Ready for Development**: ✅ **YES**
**Next Phase**: Phase 2.2 Implementation

---

*Architect: Architecture Agent*
*Date: 2025-09-30*
*Version: 1.0*

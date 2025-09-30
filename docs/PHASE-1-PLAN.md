# PHASE 1: Sibling Nodes & Context - Implementation Plan

**Project**: Vislzr - AI-Native Project Visualization Platform
**Phase**: 1 - Sibling Nodes & Context-Aware Actions
**Duration**: 2-3 weeks
**Priority**: HIGH
**Date**: 2025-09-30

---

## Executive Summary

Phase 1 transforms Vislzr from a basic graph visualization into a canvas-centric, context-aware workspace. The primary innovation is **Sibling Nodes**—transient, button-like nodes that appear adjacent to selected nodes, offering intelligent, context-aware actions.

**Goals:**
- Replace sidebar-heavy UX with on-canvas interactions
- Implement full sibling node visual system
- Build context-aware action intelligence
- Migrate 80%+ of actions from sidebar to canvas

**Success Criteria:**
- Functional sibling node rendering and lifecycle
- Context detection working for all node types
- Smooth animations (fade in/out)
- Grouped sibling menus operational
- Action registry system complete
- >70% test coverage maintained

---

## Phase 1 Overview (PRD Section 4.2)

### Core Concept: Sibling Nodes

**Definition:** Transient, button-like nodes that appear adjacent to a selected primary node, offering context-aware commands.

**Key Characteristics:**
- **Visual**: Slim, compact, visually distinct from project nodes
- **Positioning**: Stack or arc adjacent to selected node
- **Lifecycle**: Gracefully appear on selection, fade on deselection
- **Intelligence**: Available actions determined by node's `type` and `status`

### Sibling Node Categories

#### 1. Foundational Siblings (Always Available)
- **View Siblings**: Timeline, Status Log, Dependencies, Details, Schema
- **Creation Siblings**: Add Task, Add Note, Add Child, Add Idea
- **State-Change Siblings**: Mark Complete, Update Progress, Pause/Resume, Start Task

#### 2. AI Analysis & Augmentation Siblings
- **Maintenance Scans**: Security Scan, Compliance Scan, Check Updates, Dependency Audit
- **Optimization Scans**: Optimization Scan, Architectural Scan, Performance Scan, Code Quality Scan
- **Generative & Exploratory**: Propose Features, Market Intel, Partnership Analysis, Competitor Analysis
- **Contextual AI Assistant**: Ask AI

#### 3. Grouped Siblings (Expandable Sub-Menus)
- **Scans Group**: Security, Compliance, Optimization, Architectural
- **AI Actions Group**: Propose Features, Refactor Code, Generate Docs, Generate Tests
- **Integrations Group**: GitHub Actions, Docker Registry, Cloud Services, Analytics

---

## Technical Architecture

### Data Structures

#### Sibling Node Schema
```typescript
interface SiblingAction {
  id: string;                    // Unique action ID
  label: string;                 // Display text
  icon: string;                  // Icon (emoji or icon name)
  type: 'view' | 'create' | 'state' | 'ai' | 'group';
  category: 'foundational' | 'ai' | 'grouped';
  group?: string;                // Parent group ID (for sub-actions)
  handler: string;               // Action handler identifier
  requiresContext?: boolean;     // Needs node context
  aiPowered?: boolean;           // Uses AI APIs
}

interface SiblingNodeData {
  id: string;
  parentNodeId: string;          // Node this sibling belongs to
  action: SiblingAction;
  x: number;                     // D3 position
  y: number;
  angle?: number;                // Position angle around parent
  isExpanded?: boolean;          // For group siblings
  children?: SiblingNodeData[];  // Sub-siblings
}
```

#### Context Rules Schema
```typescript
interface ContextRule {
  id: string;
  nodeType: NodeType[];          // Applicable node types
  nodeStatus?: NodeStatus[];     // Applicable statuses
  actions: string[];             // Available action IDs
  priority?: number;             // Display priority
}

type NodeType = 'ROOT' | 'FOLDER' | 'FILE' | 'TASK' | 'SERVICE' | 'COMPONENT'
              | 'DEPENDENCY' | 'MILESTONE' | 'IDEA' | 'NOTE' | 'SECURITY'
              | 'AGENT' | 'API_ENDPOINT' | 'DATABASE';

type NodeStatus = 'IDLE' | 'PLANNED' | 'IN_PROGRESS' | 'AT_RISK' | 'OVERDUE'
                | 'BLOCKED' | 'COMPLETED' | 'RUNNING' | 'ERROR' | 'STOPPED';
```

### Context-Aware Intelligence

#### Example Context Rules

```typescript
const contextRules: ContextRule[] = [
  // ROOT node
  {
    id: 'root-actions',
    nodeType: ['ROOT'],
    actions: [
      'view-timeline',
      'view-status-log',
      'scans-group',
      'add-milestone',
      'ai-generate'
    ]
  },

  // TASK - IN_PROGRESS
  {
    id: 'task-in-progress',
    nodeType: ['TASK'],
    nodeStatus: ['IN_PROGRESS'],
    actions: [
      'view-dependencies',
      'update-progress',
      'add-note',
      'ask-ai',
      'mark-complete'
    ]
  },

  // TASK - BLOCKED
  {
    id: 'task-blocked',
    nodeType: ['TASK'],
    nodeStatus: ['BLOCKED'],
    actions: [
      'view-dependencies',
      'unblock-ai',           // Special action
      'add-note',
      'update-status'
    ]
  },

  // FILE node
  {
    id: 'file-actions',
    nodeType: ['FILE'],
    actions: [
      'view-code',
      'edit-code',
      'run-linter',
      'run-tests',
      'ask-ai',
      'add-note'
    ]
  },

  // SERVICE - RUNNING
  {
    id: 'service-running',
    nodeType: ['SERVICE'],
    nodeStatus: ['RUNNING'],
    actions: [
      'view-logs',
      'view-metrics',
      'restart',
      'scale',
      'add-monitor'
    ]
  },

  // SERVICE - ERROR
  {
    id: 'service-error',
    nodeType: ['SERVICE'],
    nodeStatus: ['ERROR'],
    actions: [
      'view-logs',
      'debug-ai',             // AI-powered debugging
      'restart',
      'rollback',
      'alert-team'
    ]
  },

  // DATABASE
  {
    id: 'database-actions',
    nodeType: ['DATABASE'],
    actions: [
      'view-schema',
      'run-backup',
      'check-integrity',
      'optimize',
      'add-migration'
    ]
  },

  // SECURITY node (vulnerability)
  {
    id: 'security-actions',
    nodeType: ['SECURITY'],
    actions: [
      'view-details',
      'assign-task',
      'mark-false-positive',
      'run-remediation-scan'
    ]
  },

  // DEPENDENCY
  {
    id: 'dependency-actions',
    nodeType: ['DEPENDENCY'],
    actions: [
      'check-updates',
      'view-changelog',
      'security-audit',
      'alternatives-ai'       // AI suggests alternatives
    ]
  }
];
```

---

## Implementation Tasks

### Backend Tasks

#### 1. Action Registry System
**File**: `packages/api/app/services/action_registry.py`

**Purpose**: Central registry for all sibling actions and context rules

**Features**:
- Register available actions
- Store context rules
- Query actions by node type/status
- Validate action availability

**API**:
```python
class ActionRegistry:
    def register_action(self, action: SiblingAction) -> None
    def register_context_rule(self, rule: ContextRule) -> None
    def get_actions_for_node(self, node: Node) -> List[SiblingAction]
    def validate_action(self, action_id: str, node: Node) -> bool
```

#### 2. Context Detection Service
**File**: `packages/api/app/services/context_detector.py`

**Purpose**: Determine which actions are available for a given node

**Features**:
- Match node type and status against rules
- Priority sorting
- Group expansion logic
- Dynamic action filtering

**API**:
```python
class ContextDetector:
    def detect_actions(self, node: Node) -> List[SiblingAction]
    def expand_group(self, group_id: str, node: Node) -> List[SiblingAction]
    def filter_by_permissions(self, actions: List[SiblingAction], user: User) -> List[SiblingAction]
```

#### 3. Action Handler Registry
**File**: `packages/api/app/services/action_handlers.py`

**Purpose**: Execute sibling actions

**Features**:
- Map action IDs to handler functions
- Async execution support
- Error handling
- Progress tracking

**API**:
```python
class ActionHandlerRegistry:
    def register_handler(self, action_id: str, handler: Callable) -> None
    async def execute_action(self, action_id: str, node: Node, params: dict) -> ActionResult
    def get_handler(self, action_id: str) -> Callable | None
```

#### 4. New API Endpoints

**File**: `packages/api/app/api/actions.py`

```python
# Get available actions for a node
GET /api/projects/{pid}/nodes/{nid}/actions
Response: List[SiblingAction]

# Execute a sibling action
POST /api/projects/{pid}/nodes/{nid}/actions/{action_id}
Body: { "params": {...} }
Response: { "status": "success", "result": {...} }

# Get grouped siblings (expanded)
GET /api/projects/{pid}/nodes/{nid}/actions/{group_id}/expand
Response: List[SiblingAction]
```

#### 5. Database Schema Updates

**New Table**: `action_history`
```sql
CREATE TABLE action_history (
    id VARCHAR PRIMARY KEY,
    project_id VARCHAR NOT NULL,
    node_id VARCHAR NOT NULL,
    action_id VARCHAR NOT NULL,
    user_id VARCHAR,
    executed_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR,  -- 'success', 'failed', 'pending'
    result JSON,
    error_message VARCHAR,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);
```

---

### Frontend Tasks

#### 1. Sibling Node Visualization Component
**File**: `packages/web/src/components/Canvas/SiblingNodes.tsx`

**Purpose**: Render sibling nodes around selected node

**Features**:
- Calculate positions (arc or stack layout)
- Render slim, button-like nodes
- Handle hover states
- Click handlers

**Component**:
```typescript
interface SiblingNodesProps {
  parentNode: NodeData;
  actions: SiblingAction[];
  onActionClick: (action: SiblingAction) => void;
  layout: 'arc' | 'stack';
}

export const SiblingNodes: React.FC<SiblingNodesProps> = ({
  parentNode,
  actions,
  onActionClick,
  layout
}) => {
  // Calculate sibling positions
  // Render SVG elements for siblings
  // Handle interactions
};
```

#### 2. Sibling Lifecycle Manager
**File**: `packages/web/src/hooks/useSiblingLifecycle.ts`

**Purpose**: Manage sibling node appearance/disappearance

**Features**:
- Trigger on node selection
- Fade-in animation
- Fade-out on deselection
- Cleanup on unmount

**Hook**:
```typescript
interface UseSiblingLifecycleProps {
  selectedNodeId: string | null;
  animationDuration?: number;
}

export const useSiblingLifecycle = ({
  selectedNodeId,
  animationDuration = 300
}: UseSiblingLifecycleProps) => {
  const [visibleSiblings, setVisibleSiblings] = useState<SiblingNodeData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load actions for selected node
  // Animate in/out
  // Return current siblings

  return { visibleSiblings, isAnimating };
};
```

#### 3. Context Detection Client
**File**: `packages/web/src/api/actions.ts`

**Purpose**: Fetch available actions from backend

**API Client**:
```typescript
export const actionsApi = {
  getActions: async (projectId: string, nodeId: string): Promise<SiblingAction[]> => {
    const response = await apiClient.get(
      `/projects/${projectId}/nodes/${nodeId}/actions`
    );
    return response.data;
  },

  executeAction: async (
    projectId: string,
    nodeId: string,
    actionId: string,
    params?: Record<string, any>
  ): Promise<ActionResult> => {
    const response = await apiClient.post(
      `/projects/${projectId}/nodes/${nodeId}/actions/${actionId}`,
      { params }
    );
    return response.data;
  },

  expandGroup: async (
    projectId: string,
    nodeId: string,
    groupId: string
  ): Promise<SiblingAction[]> => {
    const response = await apiClient.get(
      `/projects/${projectId}/nodes/${nodeId}/actions/${groupId}/expand`
    );
    return response.data;
  }
};
```

#### 4. Update Canvas Component
**File**: `packages/web/src/components/Canvas/Canvas.tsx`

**Changes**:
- Integrate `SiblingNodes` component
- Pass selected node to sibling renderer
- Handle sibling click events
- Update D3 simulation to account for siblings

**Updated Canvas**:
```typescript
export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId
}) => {
  const [siblingActions, setSiblingActions] = useState<SiblingAction[]>([]);

  // Load sibling actions when node is selected
  useEffect(() => {
    if (selectedNodeId) {
      actionsApi.getActions(projectId, selectedNodeId).then(setSiblingActions);
    } else {
      setSiblingActions([]);
    }
  }, [selectedNodeId]);

  return (
    <svg ref={svgRef}>
      {/* Existing nodes and edges */}

      {selectedNodeId && (
        <SiblingNodes
          parentNode={nodes.find(n => n.id === selectedNodeId)!}
          actions={siblingActions}
          onActionClick={handleSiblingClick}
          layout="arc"
        />
      )}
    </svg>
  );
};
```

#### 5. Sibling Animation System
**File**: `packages/web/src/utils/siblingAnimations.ts`

**Purpose**: Smooth transitions for sibling appearance

**Features**:
- Fade-in animation
- Fade-out animation
- Stagger effect (siblings appear sequentially)
- Group expansion animation

**Utilities**:
```typescript
export const animateSiblingIn = (
  siblingElement: SVGElement,
  duration: number = 300,
  delay: number = 0
): void => {
  d3.select(siblingElement)
    .attr('opacity', 0)
    .transition()
    .delay(delay)
    .duration(duration)
    .attr('opacity', 1);
};

export const animateSiblingOut = (
  siblingElement: SVGElement,
  duration: number = 200
): void => {
  d3.select(siblingElement)
    .transition()
    .duration(duration)
    .attr('opacity', 0)
    .remove();
};

export const staggerSiblings = (
  siblings: SiblingNodeData[],
  baseDelay: number = 50
): number[] => {
  return siblings.map((_, index) => index * baseDelay);
};
```

#### 6. Grouped Sibling System
**File**: `packages/web/src/components/Canvas/GroupedSiblings.tsx`

**Purpose**: Render expandable sibling groups

**Features**:
- Parent group button
- Expand/collapse animation
- Sub-sibling positioning
- Nested interaction handling

**Component**:
```typescript
interface GroupedSiblingsProps {
  groupAction: SiblingAction;
  parentNode: NodeData;
  onSubActionClick: (action: SiblingAction) => void;
}

export const GroupedSiblings: React.FC<GroupedSiblingsProps> = ({
  groupAction,
  parentNode,
  onSubActionClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subActions, setSubActions] = useState<SiblingAction[]>([]);

  const handleGroupClick = async () => {
    if (!isExpanded) {
      const actions = await actionsApi.expandGroup(
        parentNode.project_id!,
        parentNode.id,
        groupAction.id
      );
      setSubActions(actions);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <SiblingButton action={groupAction} onClick={handleGroupClick} />
      {isExpanded && (
        <g className="sub-siblings">
          {subActions.map(action => (
            <SiblingButton
              key={action.id}
              action={action}
              onClick={() => onSubActionClick(action)}
            />
          ))}
        </g>
      )}
    </>
  );
};
```

---

## Styling & Visual Design

### Sibling Node Appearance

**Visual Characteristics:**
- **Shape**: Rounded rectangle (pill-shaped)
- **Size**: Smaller than regular nodes (height: 30px, width: auto)
- **Color**: Distinct from node colors (use neutral/accent colors)
- **Border**: 2px solid, color varies by action category
- **Shadow**: Subtle drop shadow for elevation
- **Icon**: Leading emoji or icon
- **Label**: Truncated text (max 15 chars)

**TailwindCSS Classes:**
```typescript
const siblingStyles = {
  foundational: 'bg-blue-600 border-blue-400 text-white',
  ai: 'bg-purple-600 border-purple-400 text-white',
  grouped: 'bg-gray-700 border-gray-500 text-white',
  hover: 'hover:scale-110 hover:shadow-lg transition-transform duration-200',
};
```

### Positioning Algorithms

#### Arc Layout (Default)
Siblings arranged in a circular arc around parent node:
```typescript
const calculateArcPosition = (
  parentX: number,
  parentY: number,
  parentRadius: number,
  index: number,
  totalSiblings: number,
  arcRadius: number = 120
): { x: number; y: number; angle: number } => {
  const angleRange = Math.PI; // 180 degrees
  const startAngle = -angleRange / 2;
  const angleStep = angleRange / (totalSiblings - 1);
  const angle = startAngle + index * angleStep;

  const x = parentX + Math.cos(angle) * (parentRadius + arcRadius);
  const y = parentY + Math.sin(angle) * (parentRadius + arcRadius);

  return { x, y, angle };
};
```

#### Stack Layout (Alternative)
Siblings stacked vertically or horizontally:
```typescript
const calculateStackPosition = (
  parentX: number,
  parentY: number,
  parentRadius: number,
  index: number,
  direction: 'vertical' | 'horizontal' = 'vertical',
  spacing: number = 40
): { x: number; y: number } => {
  if (direction === 'vertical') {
    return {
      x: parentX + parentRadius + 80,
      y: parentY + (index * spacing) - ((totalSiblings - 1) * spacing / 2)
    };
  } else {
    return {
      x: parentX + (index * spacing) - ((totalSiblings - 1) * spacing / 2),
      y: parentY + parentRadius + 60
    };
  }
};
```

---

## Testing Strategy

### Backend Tests

#### 1. Action Registry Tests
**File**: `packages/api/tests/test_action_registry.py`

**Coverage**:
- Register actions
- Register context rules
- Query actions by node type
- Query actions by node status
- Validate action availability

#### 2. Context Detection Tests
**File**: `packages/api/tests/test_context_detector.py`

**Coverage**:
- Detect actions for ROOT node
- Detect actions for TASK (IN_PROGRESS)
- Detect actions for TASK (BLOCKED)
- Detect actions for FILE node
- Detect actions for SERVICE (RUNNING, ERROR)
- Group expansion logic
- Priority sorting

#### 3. Action Execution Tests
**File**: `packages/api/tests/test_action_handlers.py`

**Coverage**:
- Register handlers
- Execute action successfully
- Handle execution errors
- Async action execution
- Track action history

#### 4. API Endpoint Tests
**File**: `packages/api/tests/test_actions_api.py`

**Coverage**:
- GET /actions - returns correct actions
- POST /actions/{action_id} - executes successfully
- GET /actions/{group_id}/expand - returns sub-actions
- 404 handling for invalid nodes
- Permission validation

### Frontend Tests

#### 1. Sibling Nodes Component Tests
**File**: `packages/web/src/components/Canvas/__tests__/SiblingNodes.test.tsx`

**Coverage**:
- Renders siblings correctly
- Calculates arc positions
- Calculates stack positions
- Handles click events
- Shows hover states

#### 2. Sibling Lifecycle Hook Tests
**File**: `packages/web/src/hooks/__tests__/useSiblingLifecycle.test.ts`

**Coverage**:
- Shows siblings on selection
- Hides siblings on deselection
- Animates in/out
- Fetches actions from API
- Cleanup on unmount

#### 3. Actions API Client Tests
**File**: `packages/web/src/api/__tests__/actions.test.ts`

**Coverage**:
- getActions() fetches correctly
- executeAction() sends correct payload
- expandGroup() returns sub-actions
- Error handling

#### 4. Animation Tests
**File**: `packages/web/src/utils/__tests__/siblingAnimations.test.ts`

**Coverage**:
- Fade-in animation
- Fade-out animation
- Stagger delays calculation
- Group expansion animation

### Integration Tests

#### 1. End-to-End Sibling Interaction
**Test Scenario**:
1. Select a TASK node (IN_PROGRESS)
2. Verify correct siblings appear
3. Click "Update Progress" sibling
4. Verify modal opens
5. Update progress to 50%
6. Verify node updates on canvas
7. Verify WebSocket broadcasts change

#### 2. Grouped Sibling Expansion
**Test Scenario**:
1. Select ROOT node
2. Click "Scans" group sibling
3. Verify sub-siblings appear (Security, Compliance, etc.)
4. Click "Security Scan" sub-sibling
5. Verify scan initiates
6. Verify scan results appear

---

## Documentation Updates

### 1. Update Frontend README
**File**: `packages/web/README.md`

**Add Section**: "Sibling Nodes System"
- Explanation of sibling nodes
- How to add new sibling actions
- Context rule configuration
- Animation customization

### 2. Create Phase 1 Progress Document
**File**: `docs/PHASE-1-PROGRESS.md`

Track implementation progress:
- Backend tasks completed
- Frontend tasks completed
- Tests written
- Issues encountered
- Next steps

### 3. Update API Documentation
**File**: `packages/api/README.md`

**Add Section**: "Actions API"
- Endpoints documentation
- Action registry usage
- Creating custom actions
- Context rules examples

---

## Migration Strategy

### Sidebar to Sibling Migration

**Current Sidebar Actions to Migrate:**
1. Edit Node → `edit-node` sibling (foundational)
2. Delete Node → `delete-node` sibling (state-change)
3. Add Child → `add-child` sibling (creation)
4. View Dependencies → `view-dependencies` sibling (view)
5. Timeline View → `view-timeline` sibling (view, ROOT only)

**Migration Plan:**
1. Phase 1.1: Implement foundational siblings (view, create, state-change)
2. Phase 1.2: Migrate sidebar actions to siblings
3. Phase 1.3: Reduce sidebar to minimal controls
4. Phase 1.4: (Future) Remove sidebar entirely (canvas-only UX)

**Sidebar Retained (Phase 1):**
- Project switcher
- Zoom controls
- View mode toggles (Graph, Tree, Timeline)
- Global settings

---

## Phased Rollout

### Week 1: Backend Foundation
- ✅ Action registry system
- ✅ Context detection service
- ✅ Action handler registry
- ✅ New API endpoints
- ✅ Database schema updates
- ✅ Backend tests (>70% coverage)

### Week 2: Frontend Implementation
- ✅ Sibling node component
- ✅ Sibling lifecycle management
- ✅ Actions API client
- ✅ Canvas integration
- ✅ Animation system
- ✅ Grouped sibling system
- ✅ Frontend tests (>70% coverage)

### Week 3: Polish & Documentation
- ✅ Animation refinement
- ✅ Context rule tuning
- ✅ Integration testing
- ✅ Documentation updates
- ✅ Migration of sidebar actions
- ✅ User testing and feedback
- ✅ Bug fixes
- ✅ Phase 1 completion report

---

## Success Metrics

### Functional Metrics
- ✅ Sibling nodes render correctly
- ✅ Context detection returns correct actions for all node types
- ✅ Animations smooth (60fps)
- ✅ Action execution successful
- ✅ Grouped siblings expand/collapse
- ✅ All tests passing
- ✅ >70% test coverage maintained

### User Experience Metrics
- ⏱ Sibling appearance time: <300ms
- ⏱ Action execution time: <1s (non-AI)
- ⏱ AI action time: <3s
- 🎯 80%+ of actions performed via siblings (not sidebar)
- 🎯 User satisfaction with on-canvas interactions

### Performance Metrics
- 📊 Canvas framerate: >30fps with siblings active
- 📊 Memory usage: <50MB increase with siblings
- 📊 API response time: <200ms for action queries

---

## Risk Mitigation

### Risk: Performance Degradation
**Mitigation**:
- Limit simultaneous sibling nodes (max 10)
- Use requestAnimationFrame for animations
- Debounce rapid selection changes
- Virtualize sub-siblings in large groups

### Risk: Visual Clutter
**Mitigation**:
- Auto-hide siblings after 10s of inactivity
- Reduce sibling size as node count increases
- Smart positioning to avoid overlaps
- Fade out distant siblings

### Risk: Context Detection Errors
**Mitigation**:
- Comprehensive test coverage
- Fallback to foundational actions
- User feedback mechanism
- Action validation before execution

---

## Next Steps After Phase 1

**Phase 2: Advanced Visualizations (Weeks 5-8)**
- Dependency focus mode
- Timeline overlay
- Mini-map navigator
- Multi-view modes

**Phase 3: AI Deep Integration (Weeks 9-12)**
- Contextual AI assistant
- Security/optimization scans
- Consensus agents
- Scan result visualization

---

## Appendix: Action Definitions

### Foundational Actions

| Action ID | Label | Icon | Category | Handler |
|-----------|-------|------|----------|---------|
| `view-timeline` | Timeline | 📊 | view | `viewTimelineHandler` |
| `view-status-log` | Status Log | 📝 | view | `viewStatusLogHandler` |
| `view-dependencies` | Dependencies | 🔗 | view | `viewDependenciesHandler` |
| `view-details` | Details | 📄 | view | `viewDetailsHandler` |
| `add-task` | Add Task | ➕ | create | `addTaskHandler` |
| `add-note` | Add Note | ➕ | create | `addNoteHandler` |
| `add-child` | Add Child | ➕ | create | `addChildHandler` |
| `mark-complete` | Complete | ✓ | state | `markCompleteHandler` |
| `update-progress` | Progress | 🔄 | state | `updateProgressHandler` |
| `start-task` | Start | 🏃 | state | `startTaskHandler` |

### AI-Powered Actions

| Action ID | Label | Icon | Category | Handler |
|-----------|-------|------|----------|---------|
| `security-scan` | Security Scan | 🔒 | ai | `securityScanHandler` |
| `optimization-scan` | Optimization | ⚡ | ai | `optimizationScanHandler` |
| `ask-ai` | Ask AI | ❓ | ai | `askAIHandler` |
| `debug-ai` | Debug | 🐛 | ai | `debugAIHandler` |
| `alternatives-ai` | Alternatives | 🔄 | ai | `alternativesAIHandler` |

### Grouped Actions

| Group ID | Label | Icon | Sub-Actions |
|----------|-------|------|-------------|
| `scans-group` | Scans | 🔍 | `security-scan`, `compliance-scan`, `optimization-scan`, `architectural-scan` |
| `ai-actions-group` | AI Actions | 🤖 | `propose-features`, `refactor-code`, `generate-docs`, `generate-tests` |
| `integrations-group` | Integrations | 🔗 | `github-actions`, `docker-registry`, `cloud-services`, `analytics` |

---

**Status**: 📋 PLANNING COMPLETE - Ready for Implementation
**Next Action**: Begin Week 1 - Backend Foundation

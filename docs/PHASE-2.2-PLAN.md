# Phase 2.2: Action Handlers & View Integration - Development Plan

**Phase**: 2.2
**Start Date**: TBD
**Estimated Duration**: 2-3 days
**Status**: 📋 Planned
**Prerequisites**: Phase 2.1 Complete ✅

---

## Overview

Phase 2.2 expands the sibling nodes system by implementing the view-related actions (dependencies, details, timeline) and fixing the test suite issues from the Phase 2.1 type system migration.

## Goals

1. ✅ Implement all view-related action handlers
2. ✅ Create interactive visualization components
3. ✅ Fix test suite type errors from migration
4. ✅ Achieve 80%+ test coverage
5. ✅ Enhance UX with animations and interactions

---

## Work Breakdown

### Priority 1: View Action Implementations

#### Task 1.1: Dependency Visualization
**Agent**: Developer + Architect
**Estimated**: 6-8 hours

**Requirements**:
- Create `DependencyPanel` component
- Visualize incoming and outgoing edges
- Highlight dependency paths on canvas
- Support focus mode (dim non-dependencies)

**Architecture Decisions Needed**:
- Panel vs overlay vs focus mode? → **Decision**: Start with side panel, add focus mode in Phase 2.3
- How to handle cyclic dependencies? → Show warning, allow user to break cycle
- Zoom to dependencies? → Yes, add "Zoom to Fit" button

**Files to Create**:
- `packages/web/src/components/Panels/DependencyPanel.tsx`
- `packages/web/src/components/Panels/DependencyPanel.module.css`
- `packages/web/src/__tests__/DependencyPanel.test.tsx`

**Files to Modify**:
- `packages/web/src/components/GraphView.tsx` (add panel state, handler)
- `packages/web/src/lib/initializeActions.ts` (update view_dependencies handler placeholder)

**Acceptance Criteria**:
- [ ] Panel opens when "View Dependencies" sibling action is clicked
- [ ] Shows list of incoming and outgoing edges with node names
- [ ] Highlights dependency paths on canvas
- [ ] Includes "Zoom to Fit" button for dependencies
- [ ] Has close button to dismiss panel
- [ ] Unit tests for component
- [ ] Integration test for GraphView + panel interaction

---

#### Task 1.2: Node Details Panel
**Agent**: Developer
**Estimated**: 4-6 hours

**Requirements**:
- Create `NodeDetailsPanel` component
- Display all node properties (name, type, status, priority, description, metadata)
- Allow inline editing of editable fields
- Show timestamps (created, updated)
- Support file/code links if metadata includes them

**Files to Create**:
- `packages/web/src/components/Panels/NodeDetailsPanel.tsx`
- `packages/web/src/components/Panels/NodeDetailsPanel.module.css`
- `packages/web/src/__tests__/NodeDetailsPanel.test.tsx`

**Files to Modify**:
- `packages/web/src/components/GraphView.tsx` (add panel state, handler)

**Acceptance Criteria**:
- [ ] Panel opens when "View Details" sibling action is clicked
- [ ] Displays all node properties in readable format
- [ ] Supports inline editing (name, description, priority)
- [ ] Calls API to update node on edit
- [ ] Shows loading state during updates
- [ ] Has close button to dismiss panel
- [ ] Unit tests for component
- [ ] Integration test for edit functionality

---

#### Task 1.3: Timeline Overlay
**Agent**: Developer + Architect
**Estimated**: 6-8 hours

**Requirements**:
- Create `TimelineOverlay` component
- Show selected node in context of project timeline
- Highlight milestones and dependencies along timeline
- Allow navigation between timeline items
- Semi-transparent overlay that doesn't block canvas

**Architecture Decisions Needed**:
- Overlay vs separate view? → **Decision**: Overlay for Phase 2.2, separate view in Phase 2.4
- How to filter timeline (all nodes vs milestones only)? → Default to milestones, add "Show All" toggle
- Timeline orientation (horizontal top/bottom vs vertical left/right)? → Horizontal top

**Files to Create**:
- `packages/web/src/components/Overlays/TimelineOverlay.tsx`
- `packages/web/src/components/Overlays/TimelineOverlay.module.css`
- `packages/web/src/__tests__/TimelineOverlay.test.tsx`

**Files to Modify**:
- `packages/web/src/components/GraphView.tsx` (add overlay state, handler)

**Acceptance Criteria**:
- [ ] Overlay appears at top of canvas when "View Timeline" is clicked
- [ ] Shows selected node highlighted on timeline
- [ ] Displays milestones with dates/deadlines
- [ ] Clicking timeline item selects that node on canvas
- [ ] Has "Show All" toggle to include non-milestone nodes
- [ ] Semi-transparent background, doesn't block canvas interaction
- [ ] Close button or click outside to dismiss
- [ ] Unit tests for component
- [ ] E2E test for timeline interaction

---

### Priority 2: Test Suite Fixes

#### Task 2.1: Fix Type Errors
**Agent**: QA + Developer
**Estimated**: 3-4 hours

**Problem**: Type system migration to `@vislzr/shared` introduced type errors in existing tests

**Files Affected**:
- Tests using old `NodeData`, `EdgeData` type definitions
- Tests mocking API responses with incorrect types
- Tests expecting non-optional fields that are now optional

**Fix Strategy**:
1. Update imports to use `@vislzr/shared` types
2. Add default values for optional fields in test mocks
3. Update type assertions to match new type definitions
4. Run `pnpm test` to verify all tests pass

**Acceptance Criteria**:
- [ ] All existing tests pass without type errors
- [ ] Test mocks use shared types from `@vislzr/shared`
- [ ] Coverage report shows no regression

---

#### Task 2.2: Add Tests for New Handlers
**Agent**: QA
**Estimated**: 4-5 hours

**Requirements**:
- Unit tests for DependencyPanel component
- Unit tests for NodeDetailsPanel component
- Unit tests for TimelineOverlay component
- Integration tests for GraphView with new panels/overlays
- E2E tests for user flows (open panel, edit node, view timeline)

**Test Cases to Cover**:
- Opening and closing panels/overlays
- Editing node details and saving
- Dependency highlighting and zoom
- Timeline navigation
- Error handling (API failures, missing data)
- Edge cases (nodes with no dependencies, empty timeline)

**Acceptance Criteria**:
- [ ] 80%+ coverage for new components
- [ ] Integration tests cover all new action handlers
- [ ] E2E tests cover happy path user flows
- [ ] Coverage report shows overall 80%+ for Phase 2.2 code

---

### Priority 3: UX Enhancements

#### Task 3.1: Keyboard Shortcuts
**Agent**: Developer
**Estimated**: 2-3 hours

**Requirements**:
- Add keyboard shortcuts for common actions
- Show keyboard shortcut hints in tooltips
- Support ESC to close panels/overlays
- Support arrow keys to navigate timeline

**Proposed Shortcuts**:
- `Esc` - Close active panel/overlay
- `D` - View dependencies of selected node
- `I` - View details (info) of selected node
- `T` - View timeline
- `C` - Add child to selected node
- `Space` - Mark selected node complete
- `←/→` - Navigate timeline items

**Files to Create/Modify**:
- Create `packages/web/src/hooks/useKeyboardShortcuts.ts`
- Modify `packages/web/src/components/GraphView.tsx` (use hook)

**Acceptance Criteria**:
- [ ] Keyboard shortcuts work as specified
- [ ] Tooltips show keyboard hints
- [ ] No conflicts with browser shortcuts
- [ ] Shortcuts documented in help panel (future)

---

#### Task 3.2: Animation Polish
**Agent**: Developer
**Estimated**: 2-3 hours

**Requirements**:
- Smooth panel/overlay open/close animations
- Fade in/out transitions for dependency highlights
- Subtle bounce animation for timeline item selection
- Loading states with spinners for async operations

**Files to Modify**:
- `packages/web/src/components/Panels/*.module.css`
- `packages/web/src/components/Overlays/*.module.css`

**Acceptance Criteria**:
- [ ] Panels slide in from right with ease-out timing
- [ ] Overlays fade in from transparent
- [ ] Dependency highlights pulse subtly
- [ ] Loading spinners appear after 200ms delay
- [ ] Animations respect user's `prefers-reduced-motion` setting

---

### Priority 4: Additional Action Handlers (Stretch Goal)

#### Task 4.1: AI Action Placeholders
**Agent**: Developer
**Estimated**: 1-2 hours

**Requirements**:
- Implement basic handlers for `security_scan`, `ask_ai`, `propose_features`
- Show "Coming in Phase 3" modal when clicked
- Track analytics for which AI actions users try to use

**Files to Modify**:
- `packages/web/src/components/GraphView.tsx` (add handlers)

**Acceptance Criteria**:
- [ ] Clicking AI actions shows "Coming Soon" modal
- [ ] Modal explains what the feature will do
- [ ] Modal has "Notify Me" button (future)

---

## Agent Assignments

### Architect Agent
**Tasks**:
- [ ] Decide dependency visualization approach (panel vs focus mode)
- [ ] Design timeline overlay architecture
- [ ] Review UX for keyboard shortcuts
- [ ] Plan Phase 2.3 features based on 2.2 learnings

**Deliverables**:
- Update `agents/architect/context.md` with decisions
- Update `agents/architect/memory.json` with rationale

---

### Developer Agent
**Tasks**:
- [ ] Implement DependencyPanel component
- [ ] Implement NodeDetailsPanel component
- [ ] Implement TimelineOverlay component
- [ ] Add keyboard shortcuts hook
- [ ] Polish animations and transitions
- [ ] Fix type errors in tests (pair with QA)

**Deliverables**:
- 3 new components with tests
- Updated GraphView with handlers
- Keyboard shortcut system
- Update `agents/developer/active-tasks.md` with progress

---

### QA Agent
**Tasks**:
- [ ] Fix type errors in existing tests
- [ ] Write unit tests for new components
- [ ] Write integration tests for GraphView + panels
- [ ] Write E2E tests for user flows
- [ ] Run coverage report and verify 80%+ target
- [ ] Document any new test issues

**Deliverables**:
- All tests passing without type errors
- 80%+ coverage for Phase 2.2 code
- Update `agents/qa/test-coverage.md` with results

---

### Security Agent
**Tasks**:
- [ ] Review new panel components for XSS risks
- [ ] Validate inline editing doesn't allow script injection
- [ ] Check timeline overlay for sensitive data exposure
- [ ] Audit keyboard shortcut conflicts

**Deliverables**:
- Security audit log entry
- Update `agents/security/audit-log.md` with findings

---

## Success Criteria

Phase 2.2 is complete when:

1. ✅ All view actions implemented and functional
   - `view_dependencies` shows DependencyPanel
   - `view_details` shows NodeDetailsPanel with editing
   - `view_timeline` shows TimelineOverlay with navigation

2. ✅ Test suite healthy
   - All existing tests pass (no type errors)
   - New components have 80%+ coverage
   - Overall project coverage 80%+

3. ✅ UX polished
   - Keyboard shortcuts working
   - Smooth animations
   - Loading states for async operations

4. ✅ Documentation updated
   - Agent memory files reflect Phase 2.2 completion
   - PHASE-2.2-INTEGRATION.md created (completion doc)
   - README updated with new features

5. ✅ Code quality
   - TypeScript strict mode passing
   - ESLint/Prettier passing
   - No console errors in browser

---

## Risks & Mitigations

### Risk 1: Dependency Visualization Complexity
**Risk**: Showing dependencies could clutter the canvas for complex graphs
**Mitigation**: Start with simple panel list, add focus mode in Phase 2.3
**Contingency**: If panel doesn't work, switch to modal dialog

### Risk 2: Timeline Data Not Available
**Risk**: Backend may not have timeline/date data for nodes
**Mitigation**: Use node creation timestamps as fallback
**Contingency**: Defer timeline to Phase 2.3, prioritize other views

### Risk 3: Test Fixing Takes Longer Than Expected
**Risk**: Type errors may be more widespread than estimated
**Mitigation**: Pair QA + Developer agents, tackle systematically
**Contingency**: Extend Phase 2.2 by 1 day if needed

---

## Next Steps After Phase 2.2

### Phase 2.3: Advanced Visualizations (Estimated 2-3 days)
- Dependency focus mode (dim non-related nodes)
- Timeline as separate view (not just overlay)
- Graph minimap for navigation
- Node grouping/clustering

### Phase 2.4: Sidebar Migration (Estimated 1-2 days)
- Move remaining sidebar actions to sibling nodes
- Make sidebar collapsible/optional
- Canvas becomes primary interaction surface

---

## Appendix: File Structure After Phase 2.2

```
packages/web/src/
├── components/
│   ├── GraphView.tsx                    # (modified) Added panel/overlay state & handlers
│   ├── Panels/
│   │   ├── DependencyPanel.tsx         # (new) Dependency visualization
│   │   ├── DependencyPanel.module.css
│   │   ├── NodeDetailsPanel.tsx        # (new) Node details with editing
│   │   └── NodeDetailsPanel.module.css
│   └── Overlays/
│       ├── TimelineOverlay.tsx         # (new) Timeline visualization
│       └── TimelineOverlay.module.css
├── hooks/
│   └── useKeyboardShortcuts.ts         # (new) Keyboard shortcut system
├── __tests__/
│   ├── GraphView.integration.test.tsx  # (modified) Added panel tests
│   ├── DependencyPanel.test.tsx        # (new)
│   ├── NodeDetailsPanel.test.tsx       # (new)
│   └── TimelineOverlay.test.tsx        # (new)
└── lib/
    └── initializeActions.ts             # (modified) Updated placeholders

tests/e2e/
└── action-handlers.spec.ts              # (new) E2E tests for view actions

docs/
└── PHASE-2.2-INTEGRATION.md             # (new) Completion documentation

agents/
├── memory/
│   └── project-state.json               # (updated) Phase 2.2 complete
├── architect/
│   ├── context.md                       # (updated) Phase 2.3 planning
│   └── memory.json                      # (updated) Decisions added
├── developer/
│   ├── active-tasks.md                  # (updated) Phase 2.2 tasks complete
│   └── memory.json                      # (updated) Code patterns added
├── qa/
│   ├── test-coverage.md                 # (updated) 80%+ coverage
│   └── memory.json                      # (updated) Test issues resolved
└── security/
    ├── audit-log.md                     # (updated) Phase 2.2 audit added
    └── memory.json                      # (updated) Security posture
```

---

**Status**: 📋 Ready to Begin
**Estimated Start**: After Phase 2.1 sign-off
**Estimated Completion**: 2-3 days from start

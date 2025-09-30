# Vislzr Development with Claude Code CLI

This guide explains how to build Vislzr using **Claude Code CLI** instead of Aider.

## Setup

### 1. Install Claude Code
```bash
# Using npm
npm install -g @anthropic-ai/claude-code

# Or using homebrew
brew install anthropic/tap/claude-code

# Authenticate with your Anthropic API key
claude-code auth
```

### 2. Initialize Project
```bash
cd /Users/danielconnolly/Desktop/VislzrUnified
./UNIFIED/quick-start.sh
cd vislzr-unified
```

## Agent Workflow with Claude Code

Instead of separate "agents," you'll give Claude Code specific **roles and contexts** for each task.

### Phase 0: Foundation & Cleanup

#### Task 0.1: Create Project Structure

```bash
claude-code "
Role: You are the Architect for the Vislzr project.

Context: Read docs/PRD-MASTER.md and docs/AGENT-SDK-SETUP.md

Task: Create the complete monorepo structure as specified in AGENT-SDK-SETUP.md:
- packages/api/ (FastAPI backend)
- packages/web/ (React frontend)  
- packages/shared/ (shared TypeScript types)
- Proper package.json with workspaces
- pnpm-workspace.yaml
- turbo.json for build orchestration

Ensure all configuration files are properly set up.
"
```

#### Task 0.2: Migrate Vislzr-main Code

```bash
claude-code "
Role: You are the Developer for the Vislzr project.

Context: 
- Source code is in ../Vislzr-main/
- Target is packages/api/ and packages/web/
- Read docs/PRD-MASTER.md to understand what should be kept

Task: Migrate the best code from Vislzr-main:
1. Copy backend API (FastAPI) to packages/api/
2. Copy frontend (React + D3.js) to packages/web/src/
3. Extract shared types to packages/shared/
4. Update all imports to use the new monorepo structure
5. Ensure all code compiles without errors

Only migrate code that aligns with the PRD.
"
```

#### Task 0.3: PRD Alignment Review

```bash
claude-code "
Role: You are the Architect for the Vislzr project.

Context: Read docs/PRD-MASTER.md thoroughly

Task: Perform a gap analysis:
1. Review all code in packages/web/src/ and packages/api/
2. Identify features in code that are NOT in the PRD
3. Identify features in PRD that are NOT in code
4. Create a detailed report in docs/gap-analysis.md with:
   - Features to remove (not in PRD)
   - Features to add (in PRD but missing)
   - Current completion percentage by phase

Format as markdown with clear sections and checkboxes.
"
```

#### Task 0.4: Remove Non-Aligned Features

```bash
claude-code "
Role: You are the Developer for the Vislzr project.

Context: Read docs/gap-analysis.md (just created)

Task: Remove all features marked as 'not in PRD':
1. Delete components/files not aligned with PRD
2. Remove unused imports
3. Clean up dead code
4. Update documentation to reflect changes
5. Ensure everything still compiles

Make clean, atomic git commits for each removal.
"
```

#### Task 0.5: Establish Baseline Tests

```bash
claude-code "
Role: You are the QA Engineer for the Vislzr project.

Context: 
- Read docs/PRD-MASTER.md
- Review packages/web/src/ and packages/api/

Task: Create baseline test suite:
1. Set up testing infrastructure:
   - Vitest for frontend
   - pytest for backend
   - Test configuration files
2. Write unit tests for core services:
   - packages/web/src/services/graphService.ts
   - packages/api/src/services/graph.py
3. Write integration tests for API endpoints
4. Create E2E test for basic workflow:
   - Load project
   - Create node
   - Update node
   - Delete node
5. Generate test coverage report

Target: >70% coverage for baseline.
"
```

### Phase 1: Sibling Nodes Core

#### Week 2: Design & Data Model

```bash
# Task 1.1: Design System
claude-code "
Role: You are the Architect for the Vislzr project.

Context: Read docs/PRD-MASTER.md Section 4.2 (Sibling Nodes)

Task: Create detailed design specification:
1. Create docs/design/sibling-nodes.md with:
   - Visual appearance specs (size, colors, positioning)
   - Animation specifications (fade-in/out, timing)
   - Positioning algorithm (arc layout, spacing)
   - Grouped menu system design
2. Create Mermaid diagrams for:
   - Component hierarchy
   - State flow
   - User interaction flow
3. Define all animation curves and timing

Make it detailed enough for a developer to implement without questions.
"

# Task 1.2: Data Model
claude-code "
Role: You are the Architect for the Vislzr project.

Context: 
- Read docs/PRD-MASTER.md Section 4.2
- Review packages/shared/src/types/

Task: Design and implement data models for sibling nodes:
1. Create packages/shared/src/types/sibling.ts with:
   - SiblingAction interface
   - ActionCategory enum
   - ActionRegistry type
   - ContextRule interface
2. Update packages/api/src/models/ with database schema if needed
3. Create packages/shared/src/registry/actions.ts with:
   - All action definitions from PRD Section 4.2.4
   - Context detection logic
   - Action metadata (icons, labels, categories)

Ensure full TypeScript type safety.
"

# Task 1.3: Action Registry
claude-code "
Role: You are the Developer for the Vislzr project.

Context: 
- Read docs/PRD-MASTER.md Section 4.2.4 (Action Categories)
- Review packages/shared/src/types/sibling.ts (just created)

Task: Implement the complete action registry:
1. In packages/shared/src/registry/actions.ts:
   - Define all foundational actions (View, Creation, State-Change)
   - Define all AI analysis actions (Scans, Optimization)
   - Define grouped actions with sub-menus
   - Implement context detection logic (based on node type & status)
2. Write comprehensive unit tests in actions.test.ts
3. Export a getActionsForNode(node) function

Should return appropriate actions based on node type and status.
"
```

#### Week 3: Implementation & Integration

```bash
# Task 1.4: Sibling Node Rendering
claude-code "
Role: You are the Developer for the Vislzr project.

Context:
- Read docs/design/sibling-nodes.md
- Review packages/web/src/components/GraphView.tsx

Task: Implement sibling node rendering:
1. Create packages/web/src/components/SiblingNodes.tsx:
   - D3.js-based positioning in arc layout
   - Fade-in/fade-out animations (CSS transitions)
   - Grouped menu rendering (expandable sub-menus)
   - Event handlers (click, hover)
2. Create packages/web/src/hooks/useSiblingNodes.ts:
   - Calculate positions based on selected node
   - Manage sibling visibility state
   - Handle action selection
3. Add comprehensive TypeScript types
4. Write unit tests with React Testing Library

Should render siblings that appear/fade smoothly on node selection.
"

# Task 1.5: Integrate with GraphView
claude-code "
Role: You are the Developer for the Vislzr project.

Context:
- Review packages/web/src/components/GraphView.tsx
- Review packages/web/src/components/SiblingNodes.tsx (just created)

Task: Integrate sibling nodes into the main graph:
1. Import and render SiblingNodes component in GraphView
2. Pass selected node to SiblingNodes
3. Handle sibling action clicks:
   - Dispatch appropriate actions
   - Update graph state
   - Call backend APIs as needed
4. Ensure siblings hide on deselection
5. Add loading states for async actions
6. Write integration tests

Should work seamlessly with existing node selection.
"

# Task 1.6: Migrate Sidebar Actions
claude-code "
Role: You are the Developer for the Vislzr project.

Context:
- Read docs/PRD-MASTER.md (canvas-centric UX)
- Review packages/web/src/components/SidePanel.tsx

Task: Migrate actions from SidePanel to SiblingNodes:
1. Identify all action buttons in SidePanel
2. Move each action to appropriate sibling action:
   - Mark Complete → sibling action
   - Update Progress → sibling action
   - Delete Node → sibling action
3. Refactor SidePanel to be info-only (read-only display)
4. Update all action handlers to work from siblings
5. Ensure no functionality is lost

Target: 80%+ of actions moved to siblings.
"

# Task 1.7: Testing & Polish
claude-code "
Role: You are the QA Engineer for the Vislzr project.

Context:
- Review all sibling node implementation
- Read docs/PRD-MASTER.md Phase 1 success criteria

Task: Comprehensive testing and polish:
1. Write unit tests:
   - Action registry (context detection)
   - Sibling positioning algorithm
   - Animation timing
2. Write component tests:
   - SiblingNodes rendering
   - Action selection
   - Grouped menus
3. Write integration tests:
   - Full workflow from selection to action
   - Multiple node types
   - Edge cases (no actions, many actions)
4. Write E2E tests:
   - User selects node → siblings appear
   - User clicks action → expected result
   - User deselects → siblings fade
5. Performance benchmarks (60fps requirement)
6. Create test report in docs/test-reports/phase1.md

Ensure >80% test coverage.
"
```

### Security Review Pattern

```bash
# After any major feature
claude-code "
Role: You are the Security Engineer for the Vislzr project.

Context: Review recent commits and changed files

Task: Security audit of recent changes:
1. Check for common vulnerabilities:
   - XSS (cross-site scripting)
   - SQL injection
   - CSRF tokens
   - Input validation
   - Authentication/authorization
2. Review API endpoints for security:
   - Proper authentication
   - Rate limiting
   - Input sanitization
3. Check dependencies for known CVEs
4. Review any AI integration for prompt injection
5. Create report in agents/security/audit-YYYY-MM-DD.md with:
   - Findings (categorized by severity)
   - Recommendations
   - Action items

Flag any HIGH severity issues immediately.
"
```

## Daily Workflow

### Morning Planning
```bash
claude-code "
Role: You are the Project Architect.

Context: Read docs/PROJECT-HEALTH.md and docs/IMPLEMENTATION-PLAN.md

Task: Review project status and plan today's work:
1. Check what was completed yesterday
2. Identify any blockers
3. Determine today's priorities based on current phase
4. Create today's task list in docs/daily/YYYY-MM-DD.md

Provide clear priorities (1-3 tasks max).
"
```

### Feature Implementation
```bash
# For each feature
claude-code "
Role: Developer

Context: [paste relevant spec or PRD section]

Task: [specific implementation task]

Requirements:
- Follow TypeScript/Python best practices
- Write tests alongside code
- Update documentation
- Make clean git commits
"
```

### Evening Review
```bash
claude-code "
Role: You are the Project Manager.

Context: Review today's git commits and changed files

Task: Create end-of-day summary:
1. What was completed today
2. What's in progress
3. Any blockers encountered
4. Plan for tomorrow
5. Update docs/PROJECT-HEALTH.md

Keep it concise (5-10 bullet points).
"
```

## Multi-Step Workflows

For complex tasks, you can chain Claude Code sessions:

```bash
# Step 1: Architect designs
claude-code "Architect role: Design the timeline overlay feature per PRD"

# Step 2: Developer implements  
claude-code "Developer role: Implement the timeline overlay per docs/design/timeline-overlay.md"

# Step 3: QA tests
claude-code "QA role: Write comprehensive tests for timeline overlay"

# Step 4: Security reviews
claude-code "Security role: Audit timeline overlay implementation"
```

## Tips for Claude Code

### 1. Be Specific About Context
```bash
# Good
claude-code "Read docs/PRD-MASTER.md Section 4.2, then implement..."

# Better
claude-code "
Role: Developer
Context: Read docs/PRD-MASTER.md Section 4.2 and docs/design/sibling-nodes.md
Task: Implement SiblingNodes component with D3.js positioning
Requirements: TypeScript, tests, documentation
"
```

### 2. Break Down Large Tasks
```bash
# Instead of:
"Implement entire Phase 1"

# Do:
"Implement sibling node data model"
# then
"Implement sibling node rendering"
# then
"Integrate with GraphView"
```

### 3. Verify After Each Step
```bash
# After Claude Code completes a task
npm run test
npm run lint
git status

# Then proceed to next task
```

### 4. Use Git Effectively
```bash
# Claude Code can make commits
# Review them before pushing
git log
git diff HEAD~1

# If something went wrong
git reset --hard HEAD~1
```

## Common Commands

```bash
# Start interactive session
claude-code

# Run specific task
claude-code "Task description here"

# Continue previous conversation
claude-code --continue

# Review what Claude did
claude-code history

# Check Claude Code version
claude-code --version

# Get help
claude-code --help
```

## Example: Complete Phase 0

Here's how you'd complete Phase 0 using Claude Code:

```bash
cd /Users/danielconnolly/Desktop/VislzrUnified/vislzr-unified

# Task 1: Structure
claude-code "Architect: Create monorepo structure per docs/AGENT-SDK-SETUP.md"

# Verify
ls -la packages/

# Task 2: Migrate
claude-code "Developer: Migrate Vislzr-main code to new structure per docs/IMPLEMENTATION-PLAN.md Task 0.2"

# Verify
npm run build

# Task 3: Gap Analysis
claude-code "Architect: Perform PRD alignment review and create docs/gap-analysis.md"

# Review
cat docs/gap-analysis.md

# Task 4: Cleanup
claude-code "Developer: Remove non-aligned features listed in docs/gap-analysis.md"

# Verify
npm run build
npm run lint

# Task 5: Tests
claude-code "QA: Create baseline test suite with >70% coverage"

# Verify
npm run test

# Done!
git log --oneline
```

## Troubleshooting

### Claude Code Not Working?
```bash
# Check authentication
claude-code auth

# Update to latest version
npm update -g @anthropic-ai/claude-code

# Check API key
echo $ANTHROPIC_API_KEY
```

### Claude Made Wrong Changes?
```bash
# Undo last commit
git reset --hard HEAD~1

# Try again with more specific instructions
claude-code "More specific task description..."
```

### Need to Pause/Resume?
```bash
# Claude Code saves context
# Just stop it (Ctrl+C) and restart later
claude-code --continue
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start | `claude-code` |
| Give task | `claude-code "Task description"` |
| Continue | `claude-code --continue` |
| History | `claude-code history` |
| Help | `claude-code --help` |

---

**Ready to start Phase 0 with Claude Code?**

```bash
cd /Users/danielconnolly/Desktop/VislzrUnified
./UNIFIED/quick-start.sh
cd vislzr-unified
claude-code "Architect role: Review docs/PRD-MASTER.md and create a detailed plan for Phase 0"
```

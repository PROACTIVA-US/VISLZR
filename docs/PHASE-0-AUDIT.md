# Phase 0: Codebase Audit & Migration Plan

**Date**: September 30, 2025
**Status**: Foundation Assessment Complete

---

## Executive Summary

**Vislzr-main** is a functional prototype with strong fundamentals but missing critical PRD features. The codebase is clean, well-structured, and ready for migration to the unified monorepo.

### Quick Stats
- **Frontend Files**: 29 TypeScript/TSX files
- **Backend Files**: 10 Python modules
- **Test Coverage**: 0% (no tests found)
- **PRD Alignment**: ~40% (foundation only)

---

## Codebase Assessment

### ✅ What's Working (Keep & Migrate)

#### Backend (FastAPI)
**Location**: `apps/api/app/`

**Modules**:
- `main.py` - FastAPI app setup, CORS, routing ✅
- `models.py` - SQLAlchemy models (Node, Edge, Project, Milestone) ✅
- `schemas.py` - Pydantic validation schemas ✅
- `crud.py` - Database CRUD operations ✅
- `routes.py` - REST API endpoints ✅
- `ws.py` - WebSocket real-time updates ✅
- `db.py` - SQLite database initialization ✅
- `config.py` - Environment configuration ✅
- `ai_service.py` - Google Gemini integration ✅

**Tech Stack**:
- FastAPI 0.115.0
- SQLAlchemy (via SQLModel 0.0.21)
- Google Generative AI 0.3.2
- WebSocket support
- SQLite (dev), PostgreSQL ready

**Verdict**: **EXCELLENT** - Clean architecture, ready to migrate as-is

---

#### Frontend (React + D3.js)
**Location**: `src/`

**Core Components**:
1. **GraphView.tsx** (Main canvas)
   - D3.js force-directed graph ✅
   - Zoom/pan controls ✅
   - Node drag & drop ✅
   - WebSocket real-time sync ✅
   - Context menus (basic) ✅

2. **SidePanel.tsx** (Node editor)
   - Node property editing ✅
   - Status, priority, progress, tags ✅
   - Simple UI ✅

3. **Timeline.tsx** (Milestone tracker)
   - Milestone CRUD ✅
   - Visual timeline at bottom ✅
   - Status indicators ✅

4. **AIPrompt.tsx** (AI generation)
   - Google Gemini integration ✅
   - Natural language graph generation ✅
   - Preview/apply workflow ✅

5. **ImportExport.tsx** (Data management)
   - JSON import/export ✅
   - File handling ✅

6. **NodeStyler.tsx** (Visual customization)
   - Priority (size) adjustment ✅
   - Status (color) selection ✅

7. **DocsViewer.tsx** (Documentation)
   - Built-in docs browser ✅

**Tech Stack**:
- React 19.1.1 ✅
- TypeScript 5.8.3 ✅
- D3.js 7.9.0 ✅
- TailwindCSS 4.1.13 ✅
- Vite 7.1.2 ✅

**Verdict**: **STRONG** - Solid foundation, well-architected

---

### ⚠️ What's Missing (Per PRD)

#### Critical Gaps (Phase 1-2 Priority)

**1. Sibling Nodes System** ⚠️ **MISSING**
- No canvas-centric interaction paradigm
- Still relies on sidebar panels
- Context menu is basic (not context-aware)
- No transient action nodes

**PRD Requirements**:
- Sibling node rendering (D3.js)
- Context-aware action registry
- Grouped sibling menus
- Smooth animations (appear/fade)
- 80% of actions moved to canvas

**Effort**: **HIGH** (2-3 weeks, Phase 1)

---

**2. Advanced Visualizations** ⚠️ **MISSING**

**Missing Features**:
- Dependency focus mode (dim unrelated nodes)
- Timeline overlay integration with canvas
- Mini-map navigator
- Multi-view modes (Tree, Matrix, Heat Map)
- Dependency chain highlighting
- Critical path visualization

**Current State**: Single force-graph view only

**Effort**: **MEDIUM** (2 weeks, Phase 2)

---

**3. Enhanced AI Capabilities** ⚠️ **PARTIAL**

**What Exists**:
- ✅ AI project generation (Gemini)
- ✅ Natural language prompts

**What's Missing**:
- Contextual AI assistant (per-node chat)
- Security scanning (CVE, vulnerabilities)
- Optimization scanning (code quality)
- Architectural scanning (best practices)
- Consensus agents (multi-model queries)
- AI-powered refactoring suggestions

**Effort**: **HIGH** (3-4 weeks, Phase 3)

---

**4. Code Integration** ⚠️ **MISSING**

**PRD Requirements**:
- In-canvas code viewer/editor
- Monaco editor integration
- File system sync (two-way)
- Git integration (commit, push, pull)
- Diff viewer
- Conflict resolution

**Current State**: None

**Effort**: **MEDIUM** (2 weeks, Phase 4)

---

**5. Node Type System** ⚠️ **INCOMPLETE**

**PRD Defines 14 Node Types**:
- ROOT, FOLDER, FILE, TASK, SERVICE, COMPONENT
- DEPENDENCY, MILESTONE, IDEA, NOTE, SECURITY
- AGENT, API_ENDPOINT, DATABASE

**Current Implementation**:
- Generic nodes only
- Status: ok, blocked, overdue, focus
- No specialized behavior per type

**Gap**: Type-specific actions, icons, and behaviors

**Effort**: **LOW-MEDIUM** (1 week, Phase 1)

---

**6. Visual Language Enhancements** ⚠️ **PARTIAL**

**What Exists**:
- ✅ Status colors (blue, red, yellow, gray)
- ✅ Priority sizing (1-4 scale)

**What's Missing**:
- Status icons (✓, ⚠, ●, ⏸, ⏱, ❌)
- Pulsing animations for urgent states
- Intelligent connection lines (blocked vs met dependencies)
- Color-coded edge types
- Teal root node highlighting

**Effort**: **LOW** (few days, Phase 1)

---

### ❌ What to Remove (Non-PRD Aligned)

**1. DocsViewer Component**
- Built-in documentation browser
- Not in PRD scope
- **Action**: Remove or move to external docs site

**2. NodeStyler as Separate Component**
- Manual styling UI
- **PRD Approach**: Sibling nodes handle styling
- **Action**: Migrate to sibling node action

**3. Basic Context Menus**
- Simple right-click menus
- **PRD Approach**: Sibling nodes replace context menus
- **Action**: Deprecate in favor of sibling system

---

## Technical Debt Assessment

### 🔴 Critical Issues

**1. No Test Coverage (0%)**
- **Risk**: High risk of regressions during migration
- **Action**: Create baseline tests before migration
- **Effort**: 1-2 days

**2. No TypeScript Shared Types**
- **Issue**: Types duplicated between frontend/backend
- **Action**: Create `packages/shared/` with common types
- **Effort**: Few hours

**3. Hardcoded Project ID**
- **Issue**: `projectId = "vislzr-demo"` in App.tsx
- **Action**: Multi-project support needed
- **Effort**: 1 day (Phase 5)

---

### 🟡 Medium Issues

**1. No Error Boundaries**
- React components lack error handling
- **Action**: Add error boundaries

**2. No Loading States**
- Some components lack proper loading UX
- **Action**: Standardize loading patterns

**3. GraphView.tsx is Large (~600+ lines)**
- **Action**: Refactor into smaller components

---

### 🟢 Minor Issues

**1. Inconsistent Naming**
- Some `NodeData` vs `NodeSchema` confusion
- **Action**: Standardize naming

**2. Missing JSDoc Comments**
- **Action**: Add documentation

---

## PRD Gap Analysis

### Alignment Score: **40%**

| Feature Category | PRD Status | Vislzr-main Status | Alignment |
|-----------------|------------|-------------------|-----------|
| **Core Graph Visualization** | Required | ✅ Complete | **100%** |
| **Node/Edge CRUD** | Required | ✅ Complete | **100%** |
| **Real-time Updates** | Required | ✅ Complete | **100%** |
| **Timeline/Milestones** | Required | ✅ Complete | **100%** |
| **AI Generation** | Required | ✅ Complete | **100%** |
| **Sibling Nodes** | **CRITICAL** | ❌ Missing | **0%** |
| **Advanced Visualizations** | High Priority | ❌ Missing | **0%** |
| **Context-Aware Actions** | **CRITICAL** | ❌ Missing | **0%** |
| **AI Analysis/Scans** | High Priority | ❌ Missing | **0%** |
| **Code Integration** | Medium Priority | ❌ Missing | **0%** |
| **Node Type System** | Required | ⚠️ Partial | **30%** |
| **Visual Language** | Required | ⚠️ Partial | **50%** |
| **External Integrations** | Low Priority | ❌ Missing | **0%** |

---

## Migration Strategy

### Phase 0.1: Setup Unified Structure (Today)

**Tasks**:
1. ✅ Create monorepo structure
2. Configure PNPM workspaces
3. Setup Turborepo build system
4. Initialize package directories

**Time**: 2-3 hours

---

### Phase 0.2: Migrate Backend (Tomorrow)

**Tasks**:
1. Copy `apps/api/` → `packages/api/`
2. Update imports and paths
3. Add `package.json` for API package
4. Test all endpoints working

**Files to Migrate**:
- `main.py`, `models.py`, `schemas.py`
- `crud.py`, `routes.py`, `ws.py`
- `db.py`, `config.py`, `ai_service.py`
- `requirements.txt`

**Time**: 3-4 hours

---

### Phase 0.3: Migrate Frontend (Day 3)

**Tasks**:
1. Copy `src/` → `packages/web/src/`
2. Migrate components (keep all for now)
3. Update imports for shared types
4. Test full app working

**Files to Migrate**:
- All 7 components
- `App.tsx`, `main.tsx`
- `services/`, `hooks/`
- `types/graph.ts`

**Time**: 4-5 hours

---

### Phase 0.4: Shared Types (Day 3)

**Tasks**:
1. Create `packages/shared/src/types/`
2. Extract common types from frontend/backend
3. Update imports in both packages

**Types to Extract**:
- `NodeData`, `EdgeData`, `GraphData`
- `Milestone`, `ProjectInfo`
- Enums: `NodeStatus`, `NodeType`, `EdgeType`

**Time**: 2-3 hours

---

### Phase 0.5: Testing & Documentation (Day 4-5)

**Tasks**:
1. Create baseline test suite
   - API endpoint tests (pytest)
   - Component tests (Vitest + React Testing Library)
   - E2E tests (Playwright - basic)
2. Update README.md
3. Create development guide

**Time**: 1 day

---

## Migration Checklist

### Backend Migration
- [ ] Copy all Python modules
- [ ] Create `packages/api/package.json`
- [ ] Update imports (relative paths)
- [ ] Test database initialization
- [ ] Test all REST endpoints
- [ ] Test WebSocket connection
- [ ] Test AI generation
- [ ] Add pytest baseline tests

### Frontend Migration
- [ ] Copy all components
- [ ] Create `packages/web/package.json`
- [ ] Update imports (shared types)
- [ ] Test graph rendering
- [ ] Test all CRUD operations
- [ ] Test WebSocket sync
- [ ] Test AI generation UI
- [ ] Add Vitest component tests

### Shared Types
- [ ] Create `packages/shared/`
- [ ] Extract Node types
- [ ] Extract Edge types
- [ ] Extract Graph types
- [ ] Extract Milestone types
- [ ] Update backend imports
- [ ] Update frontend imports

### Infrastructure
- [ ] Configure PNPM workspaces
- [ ] Setup Turborepo
- [ ] Create Docker Compose
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Add ESLint/Prettier config
- [ ] Add TypeScript config (root)

---

## Success Criteria (Phase 0 Complete)

✅ **All code migrated** to monorepo structure
✅ **All features working** as they were in Vislzr-main
✅ **Tests passing** (minimum 40% coverage)
✅ **Documentation updated** (README, dev guide)
✅ **Gap analysis complete** (this document)
✅ **Phase 1 ready** (clear plan for sibling nodes)

---

## Key Findings

### Strengths
1. **Clean architecture** - Backend and frontend well-separated
2. **Modern stack** - Latest React, FastAPI, D3.js
3. **Working prototype** - All core features functional
4. **Good foundation** - Solid base to build PRD features on

### Weaknesses
1. **No tests** - Critical gap, must fix first
2. **Missing differentiators** - Sibling nodes are the key innovation
3. **Limited AI** - Only generation, not analysis/scanning
4. **Single view mode** - PRD requires multiple visualization modes

### Opportunities
1. **Fast migration** - Code is well-structured
2. **Incremental enhancement** - Can add PRD features iteratively
3. **Strong AI foundation** - Gemini integration already working
4. **Clean slate for tests** - Can establish good patterns from start

### Threats
1. **Over-engineering** - Risk of adding too much complexity
2. **Scope creep** - Must stay focused on PRD priorities
3. **Performance** - D3.js may struggle with 500+ nodes (need testing)

---

## Recommendations

### Immediate (This Week)
1. ✅ Complete this audit (DONE)
2. **Migrate backend** (tomorrow)
3. **Migrate frontend** (day 3)
4. **Add baseline tests** (day 4-5)
5. **Document gaps** (this document)

### Next Week (Phase 1 Start)
1. **Design sibling node system** (UI/UX spec)
2. **Extend data models** (action registry)
3. **Build sibling renderer** (D3.js)
4. **Integrate with GraphView**

### Month 1 Goal
- Phase 0 complete ✅
- Phase 1 (Sibling Nodes) 80% complete
- 60% test coverage
- Demo-ready prototype

---

## Questions for Resolution

1. **Database**: Stay with SQLite or move to PostgreSQL now?
   - **Recommendation**: SQLite for dev, PostgreSQL in Phase 5

2. **AI Provider**: Stick with Gemini or add Claude/GPT-4 now?
   - **Recommendation**: Keep Gemini, add others in Phase 3

3. **Testing Framework**: What level of coverage to target?
   - **Recommendation**: 80% by end of Phase 1

4. **Monorepo Tool**: PNPM + Turborepo or alternatives?
   - **Recommendation**: Stay with PNPM + Turborepo (PRD aligned)

---

## Next Steps

**Tomorrow** (Day 1 of migration):
```bash
# 1. Setup monorepo tooling
cd vislzr-unified
pnpm init

# 2. Start backend migration
mkdir -p packages/api
cp -r ../Vislzr-main/apps/api/* packages/api/

# 3. Test backend works
cd packages/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**This Week**:
- Complete all migration tasks
- Baseline tests passing
- Documentation updated
- Ready for Phase 1 (Sibling Nodes)

---

**Status**: ✅ Audit Complete
**Next**: Begin Migration (Phase 0.2)
**Owner**: Daniel + Claude Code
**Updated**: September 30, 2025

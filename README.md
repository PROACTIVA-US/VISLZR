# Vislzr Unified

**AI-native interactive canvas for software project visualization and management.**

The canvas IS the UI. Built for developers who think in graphs, not lists.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **Python** 3.12+
- **pnpm** (installed automatically via `npm install -g pnpm`)
- **Docker** (optional, for containerized development)

### Option 1: Local Development (Recommended)

```bash
# 1. Clone and navigate
cd vislzr-unified

# 2. Install dependencies
pnpm install

# 3. Setup Python backend
cd packages/api
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY (optional for AI features)

# 5. Start backend (in packages/api/)
uvicorn app.main:app --reload --port 8000

# 6. Start frontend (in new terminal, from root)
cd packages/web
pnpm dev

# 7. Open browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

### Option 2: Docker Development

```bash
# Start all services
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# PostgreSQL: localhost:5432
```

---

## 📚 Documentation

### Core Documents (Read in Order)
1. **[PRD-MASTER.md](docs/PRD-MASTER.md)** - Product vision & complete feature spec
2. **[PHASE-0-AUDIT.md](docs/PHASE-0-AUDIT.md)** - Codebase audit & migration assessment
3. **[IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)** - 12-week development roadmap
4. **[AGENT-SDK-SETUP.md](docs/AGENT-SDK-SETUP.md)** - Agent-based development workflow

### Development Guides
- **[CLAUDE-CODE-GUIDE.md](docs/CLAUDE-CODE-GUIDE.md)** - Using Claude Code CLI
- **[ROADMAP-VISUAL.md](docs/ROADMAP-VISUAL.md)** - Visual development timeline

---

## 🏗️ Project Structure

```
vislzr-unified/
├── docs/                          # Documentation hub
│   ├── PRD-MASTER.md             # Product requirements (25k+ words)
│   ├── PHASE-0-AUDIT.md          # Migration audit & findings
│   ├── IMPLEMENTATION-PLAN.md    # 12-week roadmap
│   ├── AGENT-SDK-SETUP.md        # Agent coordination guide
│   └── sprints/                  # Weekly sprint planning
├── packages/
│   ├── api/                      # FastAPI backend
│   │   ├── app/                  # Application code
│   │   │   ├── main.py          # FastAPI app entry
│   │   │   ├── models.py        # SQLAlchemy models
│   │   │   ├── routes.py        # API endpoints
│   │   │   ├── ws.py            # WebSocket handlers
│   │   │   └── ai_service.py    # AI integration (Gemini)
│   │   ├── tests/               # Backend tests
│   │   └── requirements.txt     # Python dependencies
│   ├── web/                      # React frontend
│   │   ├── src/
│   │   │   ├── components/      # React components
│   │   │   │   ├── GraphView.tsx     # Main canvas (D3.js)
│   │   │   │   ├── SidePanel.tsx     # Node editor
│   │   │   │   ├── Timeline.tsx      # Milestone tracker
│   │   │   │   ├── AIPrompt.tsx      # AI generation UI
│   │   │   │   └── ...
│   │   │   ├── services/        # API clients
│   │   │   └── App.tsx          # Main app
│   │   └── package.json
│   └── shared/                   # Shared TypeScript types
│       └── src/types/index.ts   # Node, Edge, Graph types
├── agents/                       # Agent context files
│   ├── architect/               # Architecture planning
│   ├── developer/               # Implementation work
│   ├── security/                # Security reviews
│   └── qa/                      # Testing & quality
├── docker-compose.yml           # Multi-service orchestration
├── pnpm-workspace.yaml          # PNPM monorepo config
└── turbo.json                   # Turborepo build config
```

---

## 🎯 Current Status: Phase 0 Complete ✅

### ✅ Completed
- Monorepo structure created
- Backend migrated from Vislzr-main
- Frontend migrated with all components
- Shared types package created
- Docker compose setup
- Dependencies installed
- PRD gap analysis documented

### 🎯 Next: Phase 1 (Sibling Nodes)
**Weeks 2-3**: Implement canvas-centric interaction paradigm

**Key Features**:
- Sibling node rendering (D3.js)
- Context-aware action registry
- Animated transient UI elements
- 80% of actions moved from sidebar to canvas

See [IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) Phase 1 for details.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript 5.8**
- **D3.js 7.9** (force-directed graphs)
- **TailwindCSS 4** (styling)
- **Vite 7** (build tool)
- **Vitest** (testing)

### Backend
- **FastAPI 0.115** (Python web framework)
- **SQLAlchemy 2.0** (ORM)
- **WebSocket** (real-time updates)
- **Google Gemini API** (AI generation)
- **pytest** (testing)

### Infrastructure
- **PNPM** (package management)
- **Turborepo** (monorepo builds)
- **Docker Compose** (local dev)
- **PostgreSQL** (production DB)
- **SQLite** (dev/test DB)

---

## 📊 Features

### ✅ Current Features (Vislzr-main)
- Interactive D3.js force-directed graph
- Node & edge CRUD operations
- Real-time WebSocket updates
- Timeline with milestones
- AI project generation (Google Gemini)
- JSON import/export
- Node styling (status colors, priority sizes)

### 🚧 In Development (Phase 1)
- **Sibling Nodes** - Canvas-centric actions
- **Context-aware UI** - Intelligent action suggestions
- **Enhanced node types** - 14 node types per PRD

### 🔮 Roadmap (Phases 2-5)
- Dependency focus mode & advanced visualizations
- AI scans (security, optimization, architecture)
- Contextual AI assistant on every node
- In-canvas code viewer/editor
- Git integration & file sync
- External integrations (GitHub, Docker, Cloud)

---

## 🧪 Testing

### Backend Tests
```bash
cd packages/api
source .venv/bin/activate
pytest
```

### Frontend Tests
```bash
cd packages/web
pnpm test
```

### All Tests (via Turbo)
```bash
pnpm test
```

---

## 🔧 Development Workflow

### Using Claude Agents (Recommended)

```bash
# Architecture planning
aider --architect --read docs/PRD-MASTER.md --message "Plan Phase 1"

# Implementation
aider --developer --file packages/web/src/components/SiblingNodes.tsx

# Testing
aider --qa --message "Create tests for sibling nodes"

# Security review
aider --security --message "Review today's changes"
```

### Manual Development

```bash
# Start backend
cd packages/api && uvicorn app.main:app --reload

# Start frontend (new terminal)
cd packages/web && pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build

# Lint
pnpm lint
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Should be 3.12+

# Reinstall dependencies
cd packages/api
pip install --force-reinstall -r requirements.txt

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Frontend won't build
```bash
# Clear node_modules and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install

# Check Node version
node --version  # Should be 20+
```

### Database issues
```bash
# Reset SQLite database
rm packages/api/vislzr.db

# Reinitialize
cd packages/api && python
>>> from app.db import init_db
>>> init_db()
```

---

## 🤝 Contributing

This is a personal project currently in active development (Phase 0 → Phase 1).

**Development Phases**:
- **Phase 0** (Week 1): ✅ Foundation complete
- **Phase 1** (Weeks 2-3): Sibling Nodes
- **Phase 2** (Weeks 4-5): Advanced Visualizations
- **Phase 3** (Weeks 6-8): AI Deep Integration
- **Phase 4** (Weeks 9-10): Code Integration
- **Phase 5** (Weeks 11-12): Polish & Launch

See [IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) for detailed tasks.

---

## 📝 License

MIT License

---

## 🎉 What Makes Vislzr Unique

1. **Canvas-Centric UX** - The visualization IS the interface
2. **Sibling Nodes** - Transient, context-aware actions on canvas
3. **AI-Native** - AI integrated throughout, not bolted on
4. **Developer-First** - Built for how developers think
5. **Visual Intelligence** - Color, size, animation convey meaning

---

## 📞 Getting Help

### Documentation Issues
Check `docs/` directory for comprehensive guides

### Development Questions
See `docs/IMPLEMENTATION-PLAN.md` for phase-specific guidance

### API Reference
Backend API docs: http://localhost:8000/docs (when running)

---

**Built with ❤️ using React, TypeScript, D3.js, and FastAPI**

**Status**: Phase 0 Complete ✅ | Next: Phase 1 (Sibling Nodes)

**Last Updated**: September 30, 2025

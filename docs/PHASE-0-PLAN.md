# PHASE 0: Foundation & Infrastructure Setup
**Vislzr - Detailed Implementation Plan**

**Duration**: Weeks -4 to 0 (Pre-Phase 1)
**Status**: Planning
**Priority**: CRITICAL

---

## Executive Summary

Phase 0 establishes the foundational technical infrastructure and architectural patterns required before building visualization features. This phase ensures a solid development environment, core API functionality, and basic canvas rendering capability.

**Key Deliverable**: A working monorepo with frontend/backend communication, WebSocket real-time updates, and basic D3.js graph rendering.

---

## Objectives

1. **Establish Technical Foundation**: Monorepo structure, development environment, tooling
2. **Implement Core APIs**: RESTful endpoints for graph operations (stubs)
3. **Enable Real-time Communication**: WebSocket infrastructure
4. **Basic Canvas Rendering**: D3.js force simulation with nodes/edges
5. **Testing & CI/CD**: Automated testing and deployment pipeline
6. **Documentation**: Setup guides and architectural documentation

---

## 1. Project Initialization & Environment Setup

### 1.1 Repository Structure
**Tasks:**
- [ ] Initialize Git repository
- [ ] Create monorepo directory structure:
  ```
  vislzr-unified/
  ├── frontend/              # React + TypeScript
  │   ├── src/
  │   │   ├── components/    # React components
  │   │   ├── hooks/         # Custom hooks
  │   │   ├── api/           # API client
  │   │   ├── types/         # TypeScript types
  │   │   ├── utils/         # Utilities
  │   │   ├── App.tsx
  │   │   └── main.tsx
  │   ├── public/
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── vite.config.ts
  │   └── tailwind.config.js
  │
  ├── backend/               # FastAPI Python
  │   ├── app/
  │   │   ├── api/           # API routes
  │   │   ├── models/        # SQLAlchemy models
  │   │   ├── schemas/       # Pydantic schemas
  │   │   ├── services/      # Business logic
  │   │   ├── db/            # Database config
  │   │   ├── main.py        # FastAPI app
  │   │   └── config.py      # Configuration
  │   ├── tests/
  │   ├── alembic/           # Database migrations
  │   ├── requirements.txt
  │   └── .env.example
  │
  ├── shared/                # Shared types/constants
  ├── docs/                  # Documentation
  │   ├── PRD-MASTER.md
  │   ├── PHASE-0-PLAN.md
  │   ├── ARCHITECTURE.md
  │   ├── API.md
  │   ├── DEVELOPMENT.md
  │   └── CONTRIBUTING.md
  │
  ├── scripts/               # Build/deploy automation
  ├── .github/               # GitHub Actions
  │   └── workflows/
  │       └── ci.yml
  ├── .gitignore
  └── README.md
  ```

- [ ] Create `.gitignore`:
  ```
  # Dependencies
  node_modules/
  __pycache__/
  *.pyc
  .venv/
  venv/

  # Environment
  .env
  .env.local
  .env.production

  # Build outputs
  dist/
  build/
  *.egg-info/

  # IDEs
  .vscode/
  .idea/
  *.swp
  *.swo

  # Database
  *.db
  *.sqlite3

  # OS
  .DS_Store
  Thumbs.db
  ```

**Acceptance Criteria:**
- Directory structure matches specification
- `.gitignore` prevents sensitive files from being committed
- Repository is initialized with initial commit

---

### 1.2 Frontend Foundation

#### 1.2.1 Initialize React + TypeScript + Vite
**Tasks:**
- [ ] Run `npm create vite@latest frontend -- --template react-ts`
- [ ] Configure `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"],
        "@/components/*": ["./src/components/*"],
        "@/hooks/*": ["./src/hooks/*"],
        "@/api/*": ["./src/api/*"],
        "@/types/*": ["./src/types/*"],
        "@/utils/*": ["./src/utils/*"]
      }
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```

- [ ] Update `vite.config.ts` with path aliases:
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/api': path.resolve(__dirname, './src/api'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://localhost:8000',
          ws: true,
        },
      },
    },
  })
  ```

#### 1.2.2 Install Core Dependencies
**Tasks:**
- [ ] Install dependencies:
  ```bash
  cd frontend
  npm install react@19 react-dom@19
  npm install -D typescript @types/react @types/react-dom
  npm install d3 @types/d3
  npm install tailwindcss@next postcss autoprefixer
  npm install zustand  # State management
  npm install react-router-dom @types/react-router-dom
  npm install axios
  ```

#### 1.2.3 Configure TailwindCSS 4
**Tasks:**
- [ ] Initialize Tailwind: `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js`:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Node status colors (per PRD Section 4.1)
          'node-error': '#EF4444',      // Red (pulsing)
          'node-warning': '#F59E0B',     // Yellow
          'node-active': '#3B82F6',      // Blue
          'node-success': '#10B981',     // Green
          'node-idle': '#6366F1',        // Indigo
          'node-neutral': '#6B7280',     // Gray
          'node-root': '#14B8A6',        // Teal
        },
        animation: {
          'pulse-error': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
    },
    plugins: [],
  }
  ```

- [ ] Add Tailwind directives to `src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer components {
    .node-ring {
      @apply rounded-full border-4 transition-colors duration-300;
    }

    .node-ring-error {
      @apply border-node-error animate-pulse-error;
    }

    .node-ring-warning {
      @apply border-node-warning;
    }

    .node-ring-active {
      @apply border-node-active;
    }

    .node-ring-success {
      @apply border-node-success;
    }

    .node-ring-idle {
      @apply border-node-idle;
    }

    .node-ring-neutral {
      @apply border-node-neutral;
    }

    .node-ring-root {
      @apply border-node-root;
    }
  }
  ```

#### 1.2.4 ESLint & Prettier
**Tasks:**
- [ ] Install dev dependencies:
  ```bash
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  npm install -D prettier eslint-config-prettier eslint-plugin-prettier
  npm install -D husky lint-staged
  ```

- [ ] Create `.eslintrc.json`:
  ```json
  {
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint", "react", "prettier"],
    "rules": {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    }
  }
  ```

- [ ] Create `.prettierrc`:
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

- [ ] Set up Husky pre-commit hooks:
  ```bash
  npx husky init
  echo "npx lint-staged" > .husky/pre-commit
  ```

- [ ] Add to `package.json`:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx}": [
        "eslint --fix",
        "prettier --write"
      ]
    }
  }
  ```

**Acceptance Criteria:**
- `npm run dev` starts Vite dev server on port 5173
- TypeScript compilation works with strict mode
- Path aliases resolve correctly
- TailwindCSS styles apply
- Linting and formatting run on commit

---

### 1.3 Backend Foundation

#### 1.3.1 Initialize FastAPI Project
**Tasks:**
- [ ] Create Python virtual environment:
  ```bash
  cd backend
  python3 -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```

- [ ] Create `requirements.txt`:
  ```
  fastapi==0.115.0
  uvicorn[standard]==0.30.0
  sqlalchemy==2.0.32
  alembic==1.13.2
  pydantic==2.9.0
  pydantic-settings==2.5.0
  python-dotenv==1.0.1
  websockets==13.0
  httpx==0.27.0
  python-multipart==0.0.9

  # Development
  pytest==8.3.2
  pytest-asyncio==0.24.0
  pytest-cov==5.0.0
  black==24.8.0
  flake8==7.1.1
  mypy==1.11.2
  ```

- [ ] Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

#### 1.3.2 Create Project Structure
**Tasks:**
- [ ] Create `app/__init__.py`
- [ ] Create `app/main.py`:
  ```python
  from fastapi import FastAPI
  from fastapi.middleware.cors import CORSMiddleware
  from app.api import projects, nodes, edges, milestones, websocket
  from app.config import settings

  app = FastAPI(
      title="Vislzr API",
      description="AI-native interactive canvas for software project visualization",
      version="0.1.0"
  )

  # CORS
  app.add_middleware(
      CORSMiddleware,
      allow_origins=settings.CORS_ORIGINS,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )

  # Health check
  @app.get("/health")
  async def health_check():
      return {"status": "healthy"}

  # Include routers
  app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
  app.include_router(nodes.router, prefix="/api/projects/{project_id}/nodes", tags=["nodes"])
  app.include_router(edges.router, prefix="/api/projects/{project_id}/edges", tags=["edges"])
  app.include_router(milestones.router, prefix="/api/projects/{project_id}/milestones", tags=["milestones"])
  app.include_router(websocket.router, tags=["websocket"])

  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)
  ```

- [ ] Create `app/config.py`:
  ```python
  from pydantic_settings import BaseSettings
  from typing import List

  class Settings(BaseSettings):
      DATABASE_URL: str = "sqlite:///./vislzr.db"
      CORS_ORIGINS: List[str] = ["http://localhost:5173"]

      # AI API Keys (not used in Phase 0, but prepared)
      GEMINI_API_KEY: str = ""
      ANTHROPIC_API_KEY: str = ""
      OPENAI_API_KEY: str = ""

      class Config:
          env_file = ".env"

  settings = Settings()
  ```

- [ ] Create `.env.example`:
  ```
  DATABASE_URL=sqlite:///./vislzr.db
  CORS_ORIGINS=["http://localhost:5173"]

  # AI API Keys (Phase 4+)
  GEMINI_API_KEY=your_key_here
  ANTHROPIC_API_KEY=your_key_here
  OPENAI_API_KEY=your_key_here
  ```

#### 1.3.3 Linting & Formatting
**Tasks:**
- [ ] Create `pyproject.toml`:
  ```toml
  [tool.black]
  line-length = 100
  target-version = ['py311']

  [tool.mypy]
  python_version = "3.11"
  warn_return_any = true
  warn_unused_configs = true
  disallow_untyped_defs = true

  [tool.pytest.ini_options]
  asyncio_mode = "auto"
  testpaths = ["tests"]
  ```

- [ ] Create `.flake8`:
  ```ini
  [flake8]
  max-line-length = 100
  extend-ignore = E203, W503
  exclude = .git,__pycache__,venv,.venv
  ```

**Acceptance Criteria:**
- `uvicorn app.main:app --reload` starts server on port 8000
- `/health` endpoint returns `{"status": "healthy"}`
- CORS allows frontend origin
- Code formatting with `black` works
- Linting with `flake8` passes
- Type checking with `mypy` passes

---

### 1.4 Database Setup

#### 1.4.1 SQLAlchemy Models
**Tasks:**
- [ ] Create `app/db/base.py`:
  ```python
  from sqlalchemy import create_engine
  from sqlalchemy.ext.declarative import declarative_base
  from sqlalchemy.orm import sessionmaker
  from app.config import settings

  engine = create_engine(
      settings.DATABASE_URL, connect_args={"check_same_thread": False}
  )
  SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

  Base = declarative_base()

  def get_db():
      db = SessionLocal()
      try:
          yield db
      finally:
          db.close()
  ```

- [ ] Create `app/models/project.py`:
  ```python
  from sqlalchemy import Column, String, DateTime
  from sqlalchemy.sql import func
  from app.db.base import Base
  import uuid

  class Project(Base):
      __tablename__ = "projects"

      id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
      name = Column(String, nullable=False)
      description = Column(String, nullable=True)
      created_at = Column(DateTime(timezone=True), server_default=func.now())
      updated_at = Column(DateTime(timezone=True), onupdate=func.now())
  ```

- [ ] Create `app/models/node.py`:
  ```python
  from sqlalchemy import Column, String, Integer, JSON, ForeignKey, DateTime
  from sqlalchemy.sql import func
  from app.db.base import Base
  import uuid

  class Node(Base):
      __tablename__ = "nodes"

      id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
      project_id = Column(String, ForeignKey("projects.id"), nullable=False)
      label = Column(String, nullable=False)
      type = Column(String, nullable=False)  # ROOT, FOLDER, FILE, TASK, etc.
      status = Column(String, nullable=False, default="IDLE")
      priority = Column(Integer, default=2)
      progress = Column(Integer, default=0)
      parent_id = Column(String, ForeignKey("nodes.id"), nullable=True)
      metadata = Column(JSON, default={})
      created_at = Column(DateTime(timezone=True), server_default=func.now())
      updated_at = Column(DateTime(timezone=True), onupdate=func.now())
  ```

- [ ] Create `app/models/edge.py`:
  ```python
  from sqlalchemy import Column, String, ForeignKey, JSON, DateTime
  from sqlalchemy.sql import func
  from app.db.base import Base
  import uuid

  class Edge(Base):
      __tablename__ = "edges"

      id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
      project_id = Column(String, ForeignKey("projects.id"), nullable=False)
      source = Column(String, ForeignKey("nodes.id"), nullable=False)
      target = Column(String, ForeignKey("nodes.id"), nullable=False)
      type = Column(String, nullable=False)  # parent, dependency, reference
      status = Column(String, default="active")  # active, blocked, met
      metadata = Column(JSON, default={})
      created_at = Column(DateTime(timezone=True), server_default=func.now())
  ```

- [ ] Create `app/models/milestone.py`:
  ```python
  from sqlalchemy import Column, String, Date, ForeignKey, JSON, DateTime
  from sqlalchemy.sql import func
  from app.db.base import Base
  import uuid

  class Milestone(Base):
      __tablename__ = "milestones"

      id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
      project_id = Column(String, ForeignKey("projects.id"), nullable=False)
      title = Column(String, nullable=False)
      date = Column(Date, nullable=False)
      status = Column(String, default="planned")  # planned, pending, done
      description = Column(String, nullable=True)
      linked_nodes = Column(JSON, default=[])  # List of node IDs
      created_at = Column(DateTime(timezone=True), server_default=func.now())
  ```

#### 1.4.2 Alembic Migrations
**Tasks:**
- [ ] Initialize Alembic:
  ```bash
  alembic init alembic
  ```

- [ ] Update `alembic.ini`:
  ```ini
  sqlalchemy.url = sqlite:///./vislzr.db
  ```

- [ ] Update `alembic/env.py` to import models:
  ```python
  from app.db.base import Base
  from app.models.project import Project
  from app.models.node import Node
  from app.models.edge import Edge
  from app.models.milestone import Milestone

  target_metadata = Base.metadata
  ```

- [ ] Create initial migration:
  ```bash
  alembic revision --autogenerate -m "Initial schema"
  alembic upgrade head
  ```

**Acceptance Criteria:**
- Database tables created: `projects`, `nodes`, `edges`, `milestones`
- Migrations can be applied and rolled back
- Foreign key constraints work
- UUIDs generate correctly

---

## 2. Core Data Models & Type System

### 2.1 TypeScript Type Definitions
**Tasks:**
- [ ] Create `frontend/src/types/graph.ts`:
  ```typescript
  // Per PRD Section 5.3

  export type NodeType =
    | 'ROOT'
    | 'FOLDER'
    | 'FILE'
    | 'TASK'
    | 'SERVICE'
    | 'COMPONENT'
    | 'DEPENDENCY'
    | 'MILESTONE'
    | 'IDEA'
    | 'NOTE'
    | 'SECURITY'
    | 'AGENT'
    | 'API_ENDPOINT'
    | 'DATABASE';

  export type NodeStatus =
    | 'IDLE'
    | 'PLANNED'
    | 'IN_PROGRESS'
    | 'AT_RISK'
    | 'OVERDUE'
    | 'BLOCKED'
    | 'COMPLETED'
    | 'RUNNING'
    | 'ERROR'
    | 'STOPPED';

  export interface NodeMetadata {
    created_at?: string;
    updated_at?: string;
    due_date?: string;
    assignee?: string;
    estimated_hours?: number;
    actual_hours?: number;
    code?: string;
    description?: string;
    links?: string[];
  }

  export interface NodeData {
    id: string;
    label: string;
    type: NodeType;
    status: NodeStatus;
    priority: 1 | 2 | 3 | 4;
    progress: number; // 0-100
    tags: string[];
    parent_id: string | null;
    dependencies: string[];
    metadata: NodeMetadata;
  }

  export type EdgeType = 'parent' | 'dependency' | 'reference';
  export type EdgeStatus = 'active' | 'blocked' | 'met';

  export interface EdgeData {
    id: string;
    source: string;
    target: string;
    type: EdgeType;
    status: EdgeStatus;
    metadata?: {
      label?: string;
      weight?: number;
    };
  }

  export type MilestoneStatus = 'planned' | 'pending' | 'done';

  export interface Milestone {
    id: string;
    project_id: string;
    title: string;
    date: string;
    status: MilestoneStatus;
    description?: string;
    linked_nodes: string[];
  }

  export interface GraphData {
    nodes: NodeData[];
    edges: EdgeData[];
  }
  ```

### 2.2 Pydantic Schemas
**Tasks:**
- [ ] Create `backend/app/schemas/node.py`:
  ```python
  from pydantic import BaseModel, Field
  from typing import Optional, List, Literal
  from datetime import datetime

  NodeType = Literal[
      'ROOT', 'FOLDER', 'FILE', 'TASK', 'SERVICE', 'COMPONENT',
      'DEPENDENCY', 'MILESTONE', 'IDEA', 'NOTE', 'SECURITY',
      'AGENT', 'API_ENDPOINT', 'DATABASE'
  ]

  NodeStatus = Literal[
      'IDLE', 'PLANNED', 'IN_PROGRESS', 'AT_RISK', 'OVERDUE',
      'BLOCKED', 'COMPLETED', 'RUNNING', 'ERROR', 'STOPPED'
  ]

  class NodeMetadata(BaseModel):
      created_at: Optional[datetime] = None
      updated_at: Optional[datetime] = None
      due_date: Optional[str] = None
      assignee: Optional[str] = None
      estimated_hours: Optional[int] = None
      actual_hours: Optional[int] = None
      code: Optional[str] = None
      description: Optional[str] = None
      links: Optional[List[str]] = None

  class NodeCreate(BaseModel):
      label: str
      type: NodeType
      status: NodeStatus = "IDLE"
      priority: Literal[1, 2, 3, 4] = 2
      progress: int = Field(0, ge=0, le=100)
      tags: List[str] = []
      parent_id: Optional[str] = None
      dependencies: List[str] = []
      metadata: NodeMetadata = NodeMetadata()

  class NodeUpdate(BaseModel):
      label: Optional[str] = None
      type: Optional[NodeType] = None
      status: Optional[NodeStatus] = None
      priority: Optional[Literal[1, 2, 3, 4]] = None
      progress: Optional[int] = Field(None, ge=0, le=100)
      tags: Optional[List[str]] = None
      parent_id: Optional[str] = None
      dependencies: Optional[List[str]] = None
      metadata: Optional[NodeMetadata] = None

  class NodeResponse(NodeCreate):
      id: str
      project_id: str

      class Config:
          from_attributes = True
  ```

- [ ] Create `backend/app/schemas/edge.py`:
  ```python
  from pydantic import BaseModel
  from typing import Optional, Literal

  EdgeType = Literal['parent', 'dependency', 'reference']
  EdgeStatus = Literal['active', 'blocked', 'met']

  class EdgeMetadata(BaseModel):
      label: Optional[str] = None
      weight: Optional[int] = None

  class EdgeCreate(BaseModel):
      source: str
      target: str
      type: EdgeType
      status: EdgeStatus = "active"
      metadata: Optional[EdgeMetadata] = None

  class EdgeResponse(EdgeCreate):
      id: str
      project_id: str

      class Config:
          from_attributes = True
  ```

- [ ] Create `backend/app/schemas/project.py`:
  ```python
  from pydantic import BaseModel
  from typing import Optional
  from datetime import datetime

  class ProjectCreate(BaseModel):
      name: str
      description: Optional[str] = None

  class ProjectUpdate(BaseModel):
      name: Optional[str] = None
      description: Optional[str] = None

  class ProjectResponse(BaseModel):
      id: str
      name: str
      description: Optional[str] = None
      created_at: datetime
      updated_at: Optional[datetime] = None

      class Config:
          from_attributes = True
  ```

**Acceptance Criteria:**
- TypeScript types match PRD specifications (Section 5.3)
- Pydantic schemas mirror TypeScript types
- Type validation works (catches invalid data)

---

## 3. API Foundation

### 3.1 API Endpoints (Stub Implementation)
**Tasks:**
- [ ] Create `backend/app/api/projects.py`:
  ```python
  from fastapi import APIRouter, Depends, HTTPException
  from sqlalchemy.orm import Session
  from typing import List
  from app.db.base import get_db
  from app.models.project import Project
  from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

  router = APIRouter()

  @router.get("/", response_model=List[ProjectResponse])
  def list_projects(db: Session = Depends(get_db)):
      projects = db.query(Project).all()
      return projects

  @router.post("/", response_model=ProjectResponse, status_code=201)
  def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
      db_project = Project(**project.dict())
      db.add(db_project)
      db.commit()
      db.refresh(db_project)
      return db_project

  @router.get("/{project_id}", response_model=ProjectResponse)
  def get_project(project_id: str, db: Session = Depends(get_db)):
      project = db.query(Project).filter(Project.id == project_id).first()
      if not project:
          raise HTTPException(status_code=404, detail="Project not found")
      return project

  @router.delete("/{project_id}", status_code=204)
  def delete_project(project_id: str, db: Session = Depends(get_db)):
      project = db.query(Project).filter(Project.id == project_id).first()
      if not project:
          raise HTTPException(status_code=404, detail="Project not found")
      db.delete(project)
      db.commit()
      return None
  ```

- [ ] Create `backend/app/api/nodes.py`:
  ```python
  from fastapi import APIRouter, Depends, HTTPException
  from sqlalchemy.orm import Session
  from typing import List
  from app.db.base import get_db
  from app.models.node import Node
  from app.schemas.node import NodeCreate, NodeUpdate, NodeResponse

  router = APIRouter()

  @router.post("/", response_model=NodeResponse, status_code=201)
  def create_node(project_id: str, node: NodeCreate, db: Session = Depends(get_db)):
      db_node = Node(**node.dict(), project_id=project_id)
      db.add(db_node)
      db.commit()
      db.refresh(db_node)
      return db_node

  @router.patch("/{node_id}", response_model=NodeResponse)
  def update_node(
      project_id: str,
      node_id: str,
      node_update: NodeUpdate,
      db: Session = Depends(get_db)
  ):
      db_node = db.query(Node).filter(
          Node.id == node_id, Node.project_id == project_id
      ).first()
      if not db_node:
          raise HTTPException(status_code=404, detail="Node not found")

      update_data = node_update.dict(exclude_unset=True)
      for key, value in update_data.items():
          setattr(db_node, key, value)

      db.commit()
      db.refresh(db_node)
      return db_node

  @router.delete("/{node_id}", status_code=204)
  def delete_node(project_id: str, node_id: str, db: Session = Depends(get_db)):
      db_node = db.query(Node).filter(
          Node.id == node_id, Node.project_id == project_id
      ).first()
      if not db_node:
          raise HTTPException(status_code=404, detail="Node not found")
      db.delete(db_node)
      db.commit()
      return None
  ```

- [ ] Create `backend/app/api/edges.py`:
  ```python
  from fastapi import APIRouter, Depends, HTTPException
  from sqlalchemy.orm import Session
  from app.db.base import get_db
  from app.models.edge import Edge
  from app.schemas.edge import EdgeCreate, EdgeResponse

  router = APIRouter()

  @router.post("/", response_model=EdgeResponse, status_code=201)
  def create_edge(project_id: str, edge: EdgeCreate, db: Session = Depends(get_db)):
      db_edge = Edge(**edge.dict(), project_id=project_id)
      db.add(db_edge)
      db.commit()
      db.refresh(db_edge)
      return db_edge

  @router.delete("/{edge_id}", status_code=204)
  def delete_edge(project_id: str, edge_id: str, db: Session = Depends(get_db)):
      db_edge = db.query(Edge).filter(
          Edge.id == edge_id, Edge.project_id == project_id
      ).first()
      if not db_edge:
          raise HTTPException(status_code=404, detail="Edge not found")
      db.delete(db_edge)
      db.commit()
      return None
  ```

- [ ] Create `backend/app/api/graph.py`:
  ```python
  from fastapi import APIRouter, Depends
  from sqlalchemy.orm import Session
  from typing import List
  from app.db.base import get_db
  from app.models.node import Node
  from app.models.edge import Edge
  from app.schemas.node import NodeResponse
  from app.schemas.edge import EdgeResponse
  from pydantic import BaseModel

  router = APIRouter()

  class GraphResponse(BaseModel):
      nodes: List[NodeResponse]
      edges: List[EdgeResponse]

  @router.get("/{project_id}/graph", response_model=GraphResponse)
  def get_graph(project_id: str, db: Session = Depends(get_db)):
      nodes = db.query(Node).filter(Node.project_id == project_id).all()
      edges = db.query(Edge).filter(Edge.project_id == project_id).all()
      return {"nodes": nodes, "edges": edges}
  ```

- [ ] Update `app/main.py` to include graph router

**Acceptance Criteria:**
- All endpoints respond with correct status codes
- CRUD operations work for projects, nodes, edges
- `/api/projects/{pid}/graph` returns complete graph
- FastAPI auto-generated docs at `/docs` work

---

### 3.2 Frontend API Client
**Tasks:**
- [ ] Create `frontend/src/api/client.ts`:
  ```typescript
  import axios, { AxiosInstance } from 'axios';

  class ApiClient {
    private client: AxiosInstance;

    constructor() {
      this.client = axios.create({
        baseURL: import.meta.env.VITE_API_URL || '/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request interceptor
      this.client.interceptors.request.use(
        (config) => {
          // Can add auth tokens here later
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor
      this.client.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error('API Error:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    }

    getClient() {
      return this.client;
    }
  }

  export const apiClient = new ApiClient().getClient();
  ```

- [ ] Create `frontend/src/api/projects.ts`:
  ```typescript
  import { apiClient } from './client';
  import type { NodeData, EdgeData, GraphData } from '@/types/graph';

  export interface Project {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at?: string;
  }

  export const projectsApi = {
    list: async (): Promise<Project[]> => {
      const response = await apiClient.get('/projects');
      return response.data;
    },

    create: async (data: { name: string; description?: string }): Promise<Project> => {
      const response = await apiClient.post('/projects', data);
      return response.data;
    },

    get: async (projectId: string): Promise<Project> => {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response.data;
    },

    delete: async (projectId: string): Promise<void> => {
      await apiClient.delete(`/projects/${projectId}`);
    },

    getGraph: async (projectId: string): Promise<GraphData> => {
      const response = await apiClient.get(`/projects/${projectId}/graph`);
      return response.data;
    },

    createNode: async (projectId: string, node: Partial<NodeData>): Promise<NodeData> => {
      const response = await apiClient.post(`/projects/${projectId}/nodes`, node);
      return response.data;
    },

    updateNode: async (
      projectId: string,
      nodeId: string,
      updates: Partial<NodeData>
    ): Promise<NodeData> => {
      const response = await apiClient.patch(`/projects/${projectId}/nodes/${nodeId}`, updates);
      return response.data;
    },

    deleteNode: async (projectId: string, nodeId: string): Promise<void> => {
      await apiClient.delete(`/projects/${projectId}/nodes/${nodeId}`);
    },

    createEdge: async (projectId: string, edge: Partial<EdgeData>): Promise<EdgeData> => {
      const response = await apiClient.post(`/projects/${projectId}/edges`, edge);
      return response.data;
    },

    deleteEdge: async (projectId: string, edgeId: string): Promise<void> => {
      await apiClient.delete(`/projects/${projectId}/edges/${edgeId}`);
    },
  };
  ```

**Acceptance Criteria:**
- API client successfully calls backend endpoints
- TypeScript types match API responses
- Error handling works (shows errors in console)
- All CRUD operations functional from frontend

---

## 4. WebSocket Infrastructure

### 4.1 Backend WebSocket
**Tasks:**
- [ ] Create `backend/app/api/websocket.py`:
  ```python
  from fastapi import APIRouter, WebSocket, WebSocketDisconnect
  from typing import Dict, Set
  import json

  router = APIRouter()

  class ConnectionManager:
      def __init__(self):
          self.active_connections: Dict[str, Set[WebSocket]] = {}

      async def connect(self, websocket: WebSocket, project_id: str):
          await websocket.accept()
          if project_id not in self.active_connections:
              self.active_connections[project_id] = set()
          self.active_connections[project_id].add(websocket)

      def disconnect(self, websocket: WebSocket, project_id: str):
          if project_id in self.active_connections:
              self.active_connections[project_id].discard(websocket)

      async def broadcast(self, project_id: str, message: dict):
          if project_id in self.active_connections:
              disconnected = set()
              for connection in self.active_connections[project_id]:
                  try:
                      await connection.send_json(message)
                  except:
                      disconnected.add(connection)
              # Clean up disconnected websockets
              self.active_connections[project_id] -= disconnected

  manager = ConnectionManager()

  @router.websocket("/ws")
  async def websocket_endpoint(websocket: WebSocket, project_id: str):
      await manager.connect(websocket, project_id)
      try:
          while True:
              data = await websocket.receive_text()
              # Echo back for now (Phase 0 stub)
              await websocket.send_json({
                  "type": "echo",
                  "data": data
              })
      except WebSocketDisconnect:
          manager.disconnect(websocket, project_id)
  ```

- [ ] Add broadcast helper in API routes:
  ```python
  # In app/api/nodes.py, after creating/updating node:
  from app.api.websocket import manager

  # After db.commit():
  await manager.broadcast(project_id, {
      "type": "node_updated",
      "data": db_node
  })
  ```

### 4.2 Frontend WebSocket Hook
**Tasks:**
- [ ] Create `frontend/src/hooks/useWebSocket.ts`:
  ```typescript
  import { useEffect, useRef, useState } from 'react';

  export type WebSocketMessage =
    | { type: 'node_updated'; data: any }
    | { type: 'edge_created'; data: any }
    | { type: 'edge_deleted'; data: any }
    | { type: 'graph_changed'; data: any }
    | { type: 'scan_complete'; data: any };

  export const useWebSocket = (
    projectId: string | null,
    onMessage?: (message: WebSocketMessage) => void
  ) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (!projectId) return;

      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      const connect = () => {
        const ws = new WebSocket(`${wsUrl}/ws?project_id=${projectId}`);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            onMessage?.(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Auto-reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Reconnecting...');
            connect();
          }, 3000);
        };

        wsRef.current = ws;
      };

      connect();

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
      };
    }, [projectId, onMessage]);

    return { isConnected };
  };
  ```

**Acceptance Criteria:**
- WebSocket connection establishes successfully
- Messages sent from backend reach frontend
- Auto-reconnection works after disconnect
- Multiple clients can connect to same project

---

## 5. Basic Canvas Rendering (D3.js)

### 5.1 D3 Force Simulation Setup
**Tasks:**
- [ ] Create `frontend/src/components/Canvas/Canvas.tsx`:
  ```typescript
  import React, { useEffect, useRef } from 'react';
  import * as d3 from 'd3';
  import type { NodeData, EdgeData } from '@/types/graph';

  interface CanvasProps {
    nodes: NodeData[];
    edges: EdgeData[];
    onNodeClick?: (node: NodeData) => void;
    onNodeDrag?: (nodeId: string, x: number, y: number) => void;
  }

  export const Canvas: React.FC<CanvasProps> = ({ nodes, edges, onNodeClick, onNodeDrag }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      // Clear previous render
      svg.selectAll('*').remove();

      // Create container groups
      const g = svg.append('g');
      const edgesGroup = g.append('g').attr('class', 'edges');
      const nodesGroup = g.append('g').attr('class', 'nodes');

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom);

      // Force simulation
      const simulation = d3.forceSimulation(nodes as any)
        .force('link', d3.forceLink(edges as any)
          .id((d: any) => d.id)
          .distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50));

      // Render edges
      const edgeElements = edgesGroup
        .selectAll('line')
        .data(edges)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6);

      // Render nodes
      const nodeElements = nodesGroup
        .selectAll('g')
        .data(nodes)
        .join('g')
        .call(d3.drag<any, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            onNodeDrag?.(d.id, event.x, event.y);
          }));

      // Node circles
      nodeElements
        .append('circle')
        .attr('r', (d) => 20 + d.priority * 5)
        .attr('fill', (d) => getNodeColor(d.status))
        .attr('stroke', (d) => getNodeBorderColor(d.status))
        .attr('stroke-width', 3)
        .on('click', (event, d) => {
          event.stopPropagation();
          onNodeClick?.(d);
        });

      // Node labels
      nodeElements
        .append('text')
        .text((d) => d.label)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none');

      // Update positions on tick
      simulation.on('tick', () => {
        edgeElements
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      return () => {
        simulation.stop();
      };
    }, [nodes, edges, onNodeClick, onNodeDrag]);

    return (
      <svg
        ref={svgRef}
        className="w-full h-full bg-gray-900"
        style={{ cursor: 'grab' }}
      />
    );
  };

  // Helper functions
  function getNodeColor(status: string): string {
    const colorMap: Record<string, string> = {
      ERROR: '#EF4444',
      AT_RISK: '#F59E0B',
      IN_PROGRESS: '#3B82F6',
      COMPLETED: '#10B981',
      IDLE: '#6366F1',
      RUNNING: '#10B981',
    };
    return colorMap[status] || '#6B7280';
  }

  function getNodeBorderColor(status: string): string {
    return getNodeColor(status);
  }
  ```

- [ ] Create `frontend/src/components/Canvas/index.ts`:
  ```typescript
  export { Canvas } from './Canvas';
  ```

**Acceptance Criteria:**
- Canvas renders nodes as circles with labels
- Edges render as lines connecting nodes
- Zoom and pan work smoothly
- Drag to reposition nodes works
- Node colors match status (per PRD Section 4.1)
- Force simulation prevents node overlap

---

## 6. Development Tooling

### 6.1 Testing Infrastructure

#### Frontend Tests
**Tasks:**
- [ ] Install Vitest:
  ```bash
  cd frontend
  npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
  ```

- [ ] Add test script to `package.json`:
  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest --coverage"
    }
  }
  ```

- [ ] Create `frontend/src/api/__tests__/client.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { apiClient } from '../client';

  describe('API Client', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
    });
  });
  ```

#### Backend Tests
**Tasks:**
- [ ] Create `backend/tests/conftest.py`:
  ```python
  import pytest
  from sqlalchemy import create_engine
  from sqlalchemy.orm import sessionmaker
  from app.db.base import Base, get_db
  from app.main import app

  SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

  @pytest.fixture(scope="function")
  def db():
      engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
      TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
      Base.metadata.create_all(bind=engine)

      db = TestingSessionLocal()
      try:
          yield db
      finally:
          db.close()
          Base.metadata.drop_all(bind=engine)

  @pytest.fixture(scope="function")
  def client(db):
      def override_get_db():
          try:
              yield db
          finally:
              db.close()

      app.dependency_overrides[get_db] = override_get_db
      from fastapi.testclient import TestClient
      with TestClient(app) as c:
          yield c
      app.dependency_overrides.clear()
  ```

- [ ] Create `backend/tests/test_projects.py`:
  ```python
  import pytest

  def test_create_project(client):
      response = client.post("/api/projects", json={"name": "Test Project"})
      assert response.status_code == 201
      data = response.json()
      assert data["name"] == "Test Project"
      assert "id" in data

  def test_list_projects(client):
      response = client.get("/api/projects")
      assert response.status_code == 200
      assert isinstance(response.json(), list)

  def test_get_project(client):
      # Create project
      create_response = client.post("/api/projects", json={"name": "Test"})
      project_id = create_response.json()["id"]

      # Get project
      response = client.get(f"/api/projects/{project_id}")
      assert response.status_code == 200
      assert response.json()["id"] == project_id
  ```

### 6.2 CI/CD Pipeline
**Tasks:**
- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    frontend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '20'

        - name: Install dependencies
          working-directory: ./frontend
          run: npm ci

        - name: Lint
          working-directory: ./frontend
          run: npm run lint

        - name: Type check
          working-directory: ./frontend
          run: npx tsc --noEmit

        - name: Test
          working-directory: ./frontend
          run: npm test

        - name: Build
          working-directory: ./frontend
          run: npm run build

    backend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Setup Python
          uses: actions/setup-python@v4
          with:
            python-version: '3.11'

        - name: Install dependencies
          working-directory: ./backend
          run: |
            python -m pip install --upgrade pip
            pip install -r requirements.txt

        - name: Lint
          working-directory: ./backend
          run: |
            flake8 app
            black --check app

        - name: Type check
          working-directory: ./backend
          run: mypy app

        - name: Test
          working-directory: ./backend
          run: pytest --cov=app tests/
  ```

**Acceptance Criteria:**
- `npm test` runs frontend tests successfully
- `pytest` runs backend tests successfully
- CI pipeline runs on every PR
- All linting and type checks pass

---

## 7. Documentation

### 7.1 README
**Tasks:**
- [ ] Create root `README.md`:
  ```markdown
  # Vislzr - AI-Native Project Visualization Canvas

  An interactive canvas for software project visualization, management, and execution.

  ## Prerequisites

  - **Node.js**: v20+ (for frontend)
  - **Python**: 3.11+ (for backend)
  - **Git**: Latest version

  ## Quick Start

  ### 1. Clone Repository
  \`\`\`bash
  git clone <repo-url>
  cd vislzr-unified
  \`\`\`

  ### 2. Backend Setup
  \`\`\`bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  cp .env.example .env
  alembic upgrade head
  uvicorn app.main:app --reload
  \`\`\`

  Backend runs at: http://localhost:8000

  ### 3. Frontend Setup
  \`\`\`bash
  cd frontend
  npm install
  npm run dev
  \`\`\`

  Frontend runs at: http://localhost:5173

  ## Development

  ### Running Tests

  **Frontend:**
  \`\`\`bash
  cd frontend
  npm test
  \`\`\`

  **Backend:**
  \`\`\`bash
  cd backend
  pytest
  \`\`\`

  ### Linting & Formatting

  **Frontend:**
  \`\`\`bash
  npm run lint
  npx prettier --write .
  \`\`\`

  **Backend:**
  \`\`\`bash
  flake8 app
  black app
  mypy app
  \`\`\`

  ## Project Structure

  - `/frontend` - React + TypeScript + Vite
  - `/backend` - FastAPI + SQLAlchemy
  - `/docs` - Documentation
  - `/shared` - Shared types and constants

  ## Documentation

  - [Architecture](docs/ARCHITECTURE.md)
  - [API Documentation](docs/API.md)
  - [Development Guide](docs/DEVELOPMENT.md)
  - [Contributing](docs/CONTRIBUTING.md)

  ## License

  MIT
  ```

### 7.2 Architecture Documentation
**Tasks:**
- [ ] Create `docs/ARCHITECTURE.md`:
  ```markdown
  # Vislzr Architecture

  ## System Overview

  Vislzr is a full-stack application with:
  - **Frontend**: React 19 + TypeScript + D3.js
  - **Backend**: FastAPI + SQLAlchemy
  - **Database**: SQLite (dev) / PostgreSQL (prod)
  - **Real-time**: WebSocket connections

  ## Architecture Diagram

  \`\`\`
  ┌─────────────────┐
  │   Frontend      │
  │  React + D3.js  │
  │  Port: 5173     │
  └────────┬────────┘
           │ HTTP/WebSocket
  ┌────────▼────────┐
  │   Backend       │
  │   FastAPI       │
  │  Port: 8000     │
  └────────┬────────┘
           │
  ┌────────▼────────┐
  │   Database      │
  │  SQLite/Postgres│
  └─────────────────┘
  \`\`\`

  ## Data Flow

  1. User interacts with Canvas (D3.js)
  2. Frontend sends API request to Backend
  3. Backend processes request, updates Database
  4. Backend broadcasts change via WebSocket
  5. All connected clients receive update
  6. Canvas re-renders with new data

  ## Key Design Decisions

  ### Why D3.js?
  - Flexible force-directed graph layouts
  - Custom node/edge rendering
  - Built-in zoom/pan/drag interactions

  ### Why FastAPI?
  - Async support for WebSocket
  - Auto-generated API docs
  - Type validation with Pydantic

  ### Why SQLite (dev)?
  - Zero configuration
  - File-based (easy to reset)
  - Sufficient for Phase 0-1

  ## Security Considerations

  - API keys stored in environment variables (not committed)
  - CORS configured for known origins only
  - Input validation with Pydantic schemas
  - SQL injection prevention (SQLAlchemy ORM)

  ## Performance Considerations

  - WebSocket connection pooling per project
  - D3 force simulation optimization (collision detection)
  - Database indexing on foreign keys
  - Future: Canvas virtualization for 1000+ nodes
  ```

### 7.3 API Documentation
**Tasks:**
- [ ] Create `docs/API.md`:
  ```markdown
  # Vislzr API Documentation

  Base URL: `http://localhost:8000/api`

  ## Projects

  ### List Projects
  \`\`\`
  GET /projects
  Response: Project[]
  \`\`\`

  ### Create Project
  \`\`\`
  POST /projects
  Body: { name: string, description?: string }
  Response: Project
  \`\`\`

  ### Get Project
  \`\`\`
  GET /projects/{project_id}
  Response: Project
  \`\`\`

  ### Delete Project
  \`\`\`
  DELETE /projects/{project_id}
  Response: 204 No Content
  \`\`\`

  ## Graph

  ### Get Full Graph
  \`\`\`
  GET /projects/{project_id}/graph
  Response: { nodes: NodeData[], edges: EdgeData[] }
  \`\`\`

  ## Nodes

  ### Create Node
  \`\`\`
  POST /projects/{project_id}/nodes
  Body: NodeCreate
  Response: NodeData
  \`\`\`

  ### Update Node
  \`\`\`
  PATCH /projects/{project_id}/nodes/{node_id}
  Body: Partial<NodeData>
  Response: NodeData
  \`\`\`

  ### Delete Node
  \`\`\`
  DELETE /projects/{project_id}/nodes/{node_id}
  Response: 204 No Content
  \`\`\`

  ## Edges

  ### Create Edge
  \`\`\`
  POST /projects/{project_id}/edges
  Body: EdgeCreate
  Response: EdgeData
  \`\`\`

  ### Delete Edge
  \`\`\`
  DELETE /projects/{project_id}/edges/{edge_id}
  Response: 204 No Content
  \`\`\`

  ## WebSocket

  ### Connect
  \`\`\`
  WS /ws?project_id={project_id}
  \`\`\`

  ### Message Types
  - `node_updated`: Node was created/updated
  - `edge_created`: Edge was created
  - `edge_deleted`: Edge was deleted
  - `graph_changed`: Full graph changed

  For interactive API docs, visit: http://localhost:8000/docs
  ```

### 7.4 Development Guide
**Tasks:**
- [ ] Create `docs/DEVELOPMENT.md`:
  ```markdown
  # Development Guide

  ## Adding a New API Endpoint

  1. **Define Pydantic Schema** (`backend/app/schemas/`)
  2. **Create SQLAlchemy Model** (`backend/app/models/`)
  3. **Create Migration**: `alembic revision --autogenerate -m "description"`
  4. **Add Router** (`backend/app/api/`)
  5. **Add Frontend API Client** (`frontend/src/api/`)
  6. **Add TypeScript Types** (`frontend/src/types/`)

  ## Adding a New Component

  1. Create component file: `frontend/src/components/MyComponent/MyComponent.tsx`
  2. Export from index: `frontend/src/components/MyComponent/index.ts`
  3. Import in parent: `import { MyComponent } from '@/components/MyComponent'`

  ## Debugging Tips

  ### Backend
  - Use `print()` or `logging` for debug output
  - Check FastAPI logs in terminal
  - Visit `/docs` for API playground

  ### Frontend
  - Use React DevTools browser extension
  - Check Network tab for API calls
  - Use `console.log()` liberally

  ### WebSocket
  - Check WebSocket tab in browser DevTools
  - Watch for connection open/close events
  - Verify message payloads

  ## Common Issues

  ### "Module not found" (Frontend)
  - Check path alias in `vite.config.ts`
  - Restart dev server

  ### "Table does not exist" (Backend)
  - Run migrations: `alembic upgrade head`
  - Check database file exists

  ### WebSocket disconnects
  - Check CORS settings in backend
  - Verify WebSocket URL in frontend
  ```

### 7.5 Contributing Guide
**Tasks:**
- [ ] Create `docs/CONTRIBUTING.md`:
  ```markdown
  # Contributing to Vislzr

  ## Code Style

  ### Frontend
  - Use TypeScript strict mode
  - Prefer functional components with hooks
  - Use named exports (not default)
  - Format with Prettier before commit

  ### Backend
  - Follow PEP 8 style guide
  - Use type hints for all functions
  - Format with Black before commit
  - Add docstrings to public functions

  ## Commit Messages

  Use conventional commits:
  - `feat: add sibling node rendering`
  - `fix: websocket reconnection bug`
  - `docs: update API documentation`
  - `refactor: simplify force simulation`
  - `test: add node CRUD tests`

  ## Branching Strategy

  - `main` - Production-ready code
  - `develop` - Integration branch
  - `feature/name` - New features
  - `fix/name` - Bug fixes

  ## Pull Request Process

  1. Create feature branch from `develop`
  2. Make changes, commit frequently
  3. Run tests and linting
  4. Push branch and open PR
  5. Request review
  6. Address feedback
  7. Merge when approved

  ## Testing Requirements

  - All new features must have tests
  - Maintain >80% code coverage
  - All tests must pass before merge
  ```

**Acceptance Criteria:**
- All documentation files created
- README has clear setup instructions
- Architecture documented with diagrams
- API endpoints fully documented
- Development workflow documented

---

## 8. Basic UI Scaffolding

### 8.1 Layout Components
**Tasks:**
- [ ] Create `frontend/src/App.tsx`:
  ```typescript
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import { ProjectList } from '@/pages/ProjectList';
  import { ProjectCanvas } from '@/pages/ProjectCanvas';

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/project/:projectId" element={<ProjectCanvas />} />
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
  ```

- [ ] Create `frontend/src/pages/ProjectList.tsx`:
  ```typescript
  import { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { projectsApi, Project } from '@/api/projects';

  export const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      loadProjects();
    }, []);

    const loadProjects = async () => {
      try {
        const data = await projectsApi.list();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    const createProject = async () => {
      const name = prompt('Project name:');
      if (!name) return;

      try {
        const project = await projectsApi.create({ name });
        navigate(`/project/${project.id}`);
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Vislzr Projects</h1>
            <button
              onClick={createProject}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              New Project
            </button>
          </div>

          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-gray-800 p-6 rounded cursor-pointer hover:bg-gray-700"
              >
                <h2 className="text-xl font-semibold">{project.name}</h2>
                {project.description && (
                  <p className="text-gray-400 mt-2">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  ```

- [ ] Create `frontend/src/pages/ProjectCanvas.tsx`:
  ```typescript
  import { useEffect, useState } from 'react';
  import { useParams } from 'react-router-dom';
  import { Canvas } from '@/components/Canvas';
  import { useWebSocket } from '@/hooks/useWebSocket';
  import { projectsApi } from '@/api/projects';
  import type { GraphData, NodeData } from '@/types/graph';

  export const ProjectCanvas = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
    const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

    const { isConnected } = useWebSocket(projectId || null, (message) => {
      console.log('WebSocket message:', message);
      // Handle real-time updates
      if (message.type === 'node_updated') {
        loadGraph(); // Reload graph for simplicity in Phase 0
      }
    });

    useEffect(() => {
      if (projectId) {
        loadGraph();
      }
    }, [projectId]);

    const loadGraph = async () => {
      if (!projectId) return;
      try {
        const data = await projectsApi.getGraph(projectId);
        setGraphData(data);
      } catch (error) {
        console.error('Failed to load graph:', error);
      }
    };

    const handleNodeClick = (node: NodeData) => {
      setSelectedNode(node);
    };

    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Vislzr Canvas</h1>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1">
          <Canvas
            nodes={graphData.nodes}
            edges={graphData.edges}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Selected Node Panel (Simple sidebar) */}
        {selectedNode && (
          <div className="absolute right-0 top-16 w-80 bg-gray-800 text-white p-4 shadow-lg">
            <h2 className="text-lg font-bold mb-2">{selectedNode.label}</h2>
            <p className="text-sm text-gray-400">Type: {selectedNode.type}</p>
            <p className="text-sm text-gray-400">Status: {selectedNode.status}</p>
            <p className="text-sm text-gray-400">Progress: {selectedNode.progress}%</p>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 bg-red-600 px-3 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };
  ```

**Acceptance Criteria:**
- Project list page shows all projects
- "New Project" button creates project and navigates to canvas
- Canvas page loads and renders graph
- WebSocket connection status displays
- Clicking node shows details in sidebar

---

## 9. Environment Configuration

**Tasks:**
- [ ] Create `frontend/.env.example`:
  ```
  VITE_API_URL=http://localhost:8000/api
  VITE_WS_URL=ws://localhost:8000
  ```

- [ ] Create `frontend/.env.local`:
  ```
  VITE_API_URL=http://localhost:8000/api
  VITE_WS_URL=ws://localhost:8000
  ```

- [ ] Create `backend/.env.example`:
  ```
  DATABASE_URL=sqlite:///./vislzr.db
  CORS_ORIGINS=["http://localhost:5173"]

  # AI API Keys (Phase 4+)
  GEMINI_API_KEY=
  ANTHROPIC_API_KEY=
  OPENAI_API_KEY=
  ```

- [ ] Create `backend/.env`:
  ```
  DATABASE_URL=sqlite:///./vislzr.db
  CORS_ORIGINS=["http://localhost:5173"]
  ```

**Acceptance Criteria:**
- `.env.example` files committed (templates)
- `.env` and `.env.local` files in `.gitignore`
- Environment variables load correctly in both apps

---

## 10. AI API Preparation (Stubs)

### 10.1 Service Stubs
**Tasks:**
- [ ] Create `backend/app/services/gemini_service.py`:
  ```python
  from app.config import settings

  class GeminiService:
      def __init__(self):
          self.api_key = settings.GEMINI_API_KEY

      async def generate_project(self, prompt: str):
          """Generate project structure from prompt (Phase 4 implementation)"""
          return {"nodes": [], "edges": []}

      async def chat(self, context: dict, message: str):
          """Contextual AI chat (Phase 4 implementation)"""
          return {"response": "AI not implemented yet"}

      async def analyze(self, node_data: dict, scan_type: str):
          """Run analysis scan (Phase 4 implementation)"""
          return {"findings": []}

  gemini_service = GeminiService()
  ```

- [ ] Create `backend/app/api/ai.py`:
  ```python
  from fastapi import APIRouter
  from app.services.gemini_service import gemini_service

  router = APIRouter()

  @router.post("/{project_id}/ai/generate")
  async def generate_project(project_id: str, prompt: str):
      result = await gemini_service.generate_project(prompt)
      return result

  @router.post("/{project_id}/ai/chat")
  async def ai_chat(project_id: str, message: str):
      result = await gemini_service.chat({}, message)
      return result

  @router.post("/{project_id}/ai/analyze")
  async def ai_analyze(project_id: str, node_id: str, scan_type: str):
      result = await gemini_service.analyze({}, scan_type)
      return result
  ```

- [ ] Add AI router to `app/main.py`

**Acceptance Criteria:**
- AI endpoints exist and return stub responses
- No actual AI implementation (saves costs for Phase 0)
- API structure ready for Phase 4 implementation

---

## Final Deliverables Checklist

### Technical Infrastructure
- [ ] Monorepo structure with frontend + backend
- [ ] Frontend: React 19 + TypeScript + Vite + TailwindCSS
- [ ] Backend: FastAPI + SQLAlchemy + Alembic
- [ ] Database: SQLite with migrations
- [ ] Core API endpoints (projects, nodes, edges, graph)
- [ ] WebSocket real-time communication
- [ ] D3.js canvas with force simulation
- [ ] Node/edge rendering with zoom/pan/drag
- [ ] Basic state management (Zustand)
- [ ] Routing (react-router-dom)

### Development Tools
- [ ] ESLint + Prettier (frontend)
- [ ] Black + Flake8 + mypy (backend)
- [ ] Pre-commit hooks (Husky)
- [ ] Testing infrastructure (Vitest + pytest)
- [ ] CI/CD pipeline (GitHub Actions)

### Documentation
- [ ] README with setup instructions
- [ ] ARCHITECTURE.md
- [ ] API.md
- [ ] DEVELOPMENT.md
- [ ] CONTRIBUTING.md
- [ ] PHASE-0-PLAN.md (this document)

### Success Criteria
- [ ] Developer can clone and run locally in <10 minutes
- [ ] Frontend connects to backend successfully
- [ ] WebSocket connection works
- [ ] Canvas renders nodes and edges
- [ ] CRUD operations work for projects/nodes/edges
- [ ] All tests pass
- [ ] CI pipeline green
- [ ] Linting passes with no errors

---

## Timeline Summary

| Week | Focus Area | Key Tasks |
|------|-----------|-----------|
| **Week -4** | Project Setup | Initialize repo, frontend/backend scaffolding, tooling |
| **Week -3** | Backend Core | API endpoints, database models, migrations |
| **Week -2** | Real-time & Canvas | WebSocket setup, D3.js force simulation, rendering |
| **Week -1** | Testing & Docs | Tests, CI/CD, documentation, polish |
| **Week 0** | ✅ Phase 0 Complete | Ready to begin Phase 1 (advanced features) |

---

## Transition to Phase 1

Once Phase 0 is complete, **Phase 1** will build on this foundation:
- Advanced graph visualizations (dependency focus, multi-view modes)
- Enhanced node/edge CRUD UI (context menus, inline editing)
- Timeline component with milestone visualization
- JSON import/export
- Side panel editor improvements
- Status change animations

**Phase 0 prepares the infrastructure. Phase 1 delivers the user experience.**
# Vislzr API

FastAPI backend for Vislzr project visualization platform.

## Setup

### 1. Create Virtual Environment

```bash
cd packages/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed
```

### 4. Initialize Database

```bash
# Run migrations
alembic upgrade head
```

### 5. Run Server

```bash
uvicorn app.main:app --reload
```

Server will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

## Development

### Run Tests

```bash
pytest
```

### Format Code

```bash
black app
```

### Lint Code

```bash
flake8 app
```

### Type Check

```bash
mypy app
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{project_id}` - Get project
- `PATCH /api/projects/{project_id}` - Update project
- `DELETE /api/projects/{project_id}` - Delete project

### Graph
- `GET /api/projects/{project_id}/graph` - Get full graph (nodes + edges)

### Nodes
- `GET /api/projects/{project_id}/nodes` - List nodes
- `POST /api/projects/{project_id}/nodes` - Create node
- `GET /api/projects/{project_id}/nodes/{node_id}` - Get node
- `PATCH /api/projects/{project_id}/nodes/{node_id}` - Update node
- `DELETE /api/projects/{project_id}/nodes/{node_id}` - Delete node

### Edges
- `GET /api/projects/{project_id}/edges` - List edges
- `POST /api/projects/{project_id}/edges` - Create edge
- `GET /api/projects/{project_id}/edges/{edge_id}` - Get edge
- `DELETE /api/projects/{project_id}/edges/{edge_id}` - Delete edge

### Milestones
- `GET /api/projects/{project_id}/milestones` - List milestones
- `POST /api/projects/{project_id}/milestones` - Create milestone
- `GET /api/projects/{project_id}/milestones/{milestone_id}` - Get milestone
- `PATCH /api/projects/{project_id}/milestones/{milestone_id}` - Update milestone
- `DELETE /api/projects/{project_id}/milestones/{milestone_id}` - Delete milestone

### WebSocket
- `WS /ws?project_id={project_id}` - Real-time updates
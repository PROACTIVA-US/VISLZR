from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session, select, delete
from pydantic import BaseModel
from typing import Optional, List
from .db import get_session
from .models import Project, Node, Edge, Milestone
from .schemas import ProjectIn, GraphData, NodeData, EdgeData, Milestone as MilestoneSchema
from .crud import upsert_project, replace_graph, get_graph
from .ws import broadcast
from .ai_service import get_ai_service

class NodePatch(BaseModel):
    label: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    progress: Optional[float] = None
    tags: Optional[List[str]] = None

class MilestonePatch(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = None

class AIPromptRequest(BaseModel):
    prompt: str

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

@router.post("/projects", response_model=ProjectIn)
def create_or_update_project(p: ProjectIn, session: Session = Depends(get_session)):
    upsert_project(session, p)
    return p

@router.get("/projects")
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    return [{"id": p.id, "name": p.name, "description": p.description, "createdAt": p.created_at, "updatedAt": p.updated_at} for p in projects]

@router.get("/projects/{pid}")
def get_project(pid: str, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    return {"id": p.id, "name": p.name, "description": p.description, "createdAt": p.created_at, "updatedAt": p.updated_at}

@router.delete("/projects/{pid}")
def delete_project(pid: str, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    session.exec(delete(Node).where(Node.project_id == pid))
    session.exec(delete(Edge).where(Edge.project_id == pid))
    session.exec(delete(Milestone).where(Milestone.project_id == pid))
    session.delete(p)
    session.commit()
    return {"ok": True}

@router.get("/projects/{pid}/graph")
def get_project_graph(pid: str, session: Session = Depends(get_session)):
    proj, nodes, edges, miles = get_graph(session, pid)
    if not proj:
        raise HTTPException(404, "Not found")
    return {
        "project": {"id": proj.id, "name": proj.name, "description": proj.description, "createdAt": proj.created_at, "updatedAt": proj.updated_at},
        "nodes": [{"id": n.id, "label": n.label, "status": n.status, "priority": n.priority, "progress": n.progress, "tags": (n.tags or "").split(",") if n.tags else []} for n in nodes],
        "edges": [{"source": e.source, "target": e.target, "kind": e.kind, "weight": e.weight} for e in edges],
        "milestones": [{"id": m.id, "title": m.title, "date": m.date, "status": m.status} for m in miles],
    }

@router.put("/projects/{pid}/graph")
async def put_project_graph(pid: str, g: GraphData, session: Session = Depends(get_session)):
    if g.project.id != pid:
        raise HTTPException(400, "Project id mismatch")
    replace_graph(session, g)
    await broadcast(pid, "graph_changed", {"reason": "replace"})
    return {"ok": True}

@router.post("/projects/{pid}/nodes")
async def add_node(pid: str, node: NodeData, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    n = Node(id=node.id, project_id=pid, label=node.label, status=node.status, priority=node.priority, progress=node.progress, tags=",".join(node.tags or []))
    session.add(n)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "node_added", "node": node.id})
    return {"ok": True}

@router.patch("/projects/{pid}/nodes/{nid}")
async def patch_node(pid: str, nid: str, patch: NodePatch, session: Session = Depends(get_session)):
    n = session.get(Node, nid)
    if not n or n.project_id != pid:
        raise HTTPException(404, "Node not found")
    
    if patch.label is not None:
        n.label = patch.label
    if patch.status is not None:
        n.status = patch.status
    if patch.priority is not None:
        n.priority = patch.priority
    if patch.progress is not None:
        n.progress = patch.progress
    if patch.tags is not None:
        n.tags = ",".join(patch.tags)
    
    session.add(n)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "node_updated", "node": nid})
    return {"ok": True}

@router.delete("/projects/{pid}/nodes/{nid}")
async def del_node(pid: str, nid: str, session: Session = Depends(get_session)):
    n = session.get(Node, nid)
    if not n or n.project_id != pid:
        raise HTTPException(404, "Node not found")
    session.exec(delete(Edge).where((Edge.project_id == pid) & ((Edge.source == nid) | (Edge.target == nid))))
    session.delete(n)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "node_removed", "node": nid})
    return {"ok": True}

@router.post("/projects/{pid}/edges")
async def add_edge(pid: str, edge: EdgeData, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    session.add(Edge(project_id=pid, source=edge.source, target=edge.target, kind=edge.kind, weight=edge.weight))
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "edge_added", "source": edge.source, "target": edge.target})
    return {"ok": True}

@router.delete("/projects/{pid}/edges/{sid}/{tid}")
async def del_edge(pid: str, sid: str, tid: str, session: Session = Depends(get_session)):
    stmt = delete(Edge).where((Edge.project_id == pid) & (Edge.source == sid) & (Edge.target == tid))
    session.exec(stmt)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "edge_removed", "source": sid, "target": tid})
    return {"ok": True}

@router.get("/projects/{pid}/milestones")
def get_milestones(pid: str, session: Session = Depends(get_session)):
    miles = session.exec(select(Milestone).where(Milestone.project_id == pid)).all()
    return [{"id": m.id, "title": m.title, "date": m.date, "status": m.status} for m in miles]

@router.post("/projects/{pid}/milestones")
async def add_milestone(pid: str, m: MilestoneSchema, session: Session = Depends(get_session)):
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    ms = Milestone(id=m.id, project_id=pid, title=m.title, date=m.date, status=m.status)
    session.add(ms)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "milestone_added", "milestone": m.id})
    return {"ok": True}

@router.patch("/projects/{pid}/milestones/{mid}")
async def patch_milestone(pid: str, mid: str, patch: MilestonePatch, session: Session = Depends(get_session)):
    m = session.get(Milestone, mid)
    if not m or m.project_id != pid:
        raise HTTPException(404, "Milestone not found")
    
    if patch.title is not None:
        m.title = patch.title
    if patch.date is not None:
        m.date = patch.date
    if patch.status is not None:
        m.status = patch.status
    
    session.add(m)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "milestone_updated", "milestone": mid})
    return {"ok": True}

@router.delete("/projects/{pid}/milestones/{mid}")
async def delete_milestone(pid: str, mid: str, session: Session = Depends(get_session)):
    m = session.get(Milestone, mid)
    if not m or m.project_id != pid:
        raise HTTPException(404, "Milestone not found")
    
    session.delete(m)
    session.commit()
    await broadcast(pid, "graph_changed", {"reason": "milestone_deleted", "milestone": mid})
    return {"ok": True}

@router.post("/projects/{pid}/ai/generate")
async def generate_graph_from_ai(pid: str, request: AIPromptRequest, session: Session = Depends(get_session)):
    """Generate a graph structure from an AI prompt"""
    
    # Check if project exists
    p = session.get(Project, pid)
    if not p:
        raise HTTPException(404, "Project not found")
    
    # Get AI service
    ai = get_ai_service()
    if not ai:
        # If AI service is not available (no API key), use fallback
        from .ai_service import AIService
        service = AIService.__new__(AIService)
        graph_data = service._create_fallback_graph(request.prompt, pid)
    else:
        # Generate graph using AI
        try:
            graph_data = await ai.generate_graph_from_prompt(request.prompt, pid)
        except Exception as e:
            print(f"AI generation failed: {e}")
            # Use fallback on error
            from .ai_service import AIService
            service = AIService.__new__(AIService)
            graph_data = service._create_fallback_graph(request.prompt, pid)
    
    # Return the generated graph data
    return {
        "project": {"id": pid, "name": p.name},
        "nodes": [node.dict() for node in graph_data.nodes],
        "edges": [edge.dict() for edge in graph_data.edges],
        "milestones": []
    }

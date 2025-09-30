from pydantic import BaseModel
from typing import List, Optional, Literal

Status = Optional[Literal["ok", "blocked", "overdue", "focus"]]

class ProjectIn(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: str
    updatedAt: str

class ProjectOut(ProjectIn): pass

class NodeData(BaseModel):
    id: str
    label: str
    status: Status = None
    priority: Optional[int] = None
    progress: Optional[float] = None
    tags: Optional[list[str]] = None

class EdgeData(BaseModel):
    source: str
    target: str
    kind: Optional[Literal["depends", "relates", "subtask"]] = None
    weight: Optional[float] = None

class Milestone(BaseModel):
    id: str
    title: str
    date: str
    status: Literal["planned", "pending", "done"]

class GraphData(BaseModel):
    project: ProjectIn
    nodes: List[NodeData]
    edges: List[EdgeData]
    milestones: Optional[List[Milestone]] = None

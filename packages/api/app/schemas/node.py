from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


NodeType = Literal[
    "ROOT",
    "FOLDER",
    "FILE",
    "TASK",
    "SERVICE",
    "COMPONENT",
    "DEPENDENCY",
    "MILESTONE",
    "IDEA",
    "NOTE",
    "SECURITY",
    "AGENT",
    "API_ENDPOINT",
    "DATABASE",
]

NodeStatus = Literal[
    "IDLE",
    "PLANNED",
    "IN_PROGRESS",
    "AT_RISK",
    "OVERDUE",
    "BLOCKED",
    "COMPLETED",
    "RUNNING",
    "ERROR",
    "STOPPED",
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
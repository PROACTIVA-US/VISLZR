from pydantic import BaseModel
from typing import Optional, Literal


EdgeType = Literal["parent", "dependency", "reference"]
EdgeStatus = Literal["active", "blocked", "met"]


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
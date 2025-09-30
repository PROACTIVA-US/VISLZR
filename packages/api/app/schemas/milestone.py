from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import date, datetime


MilestoneStatus = Literal["planned", "pending", "done"]


class MilestoneCreate(BaseModel):
    title: str
    date: date
    status: MilestoneStatus = "planned"
    description: Optional[str] = None
    linked_nodes: List[str] = []


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    status: Optional[MilestoneStatus] = None
    description: Optional[str] = None
    linked_nodes: Optional[List[str]] = None


class MilestoneResponse(MilestoneCreate):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True
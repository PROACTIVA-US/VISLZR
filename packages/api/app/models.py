from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Project(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    created_at: str
    updated_at: str

    nodes: List["Node"] = Relationship(back_populates="project")
    edges: List["Edge"] = Relationship(back_populates="project")
    milestones: List["Milestone"] = Relationship(back_populates="project")

class Node(SQLModel, table=True):
    id: str = Field(primary_key=True)
    project_id: str = Field(foreign_key="project.id")
    label: str
    status: Optional[str] = None
    priority: Optional[int] = None
    progress: Optional[float] = None
    tags: Optional[str] = None  # comma-separated for simplicity

    project: Optional[Project] = Relationship(back_populates="nodes")

class Edge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: str = Field(foreign_key="project.id")
    source: str
    target: str
    kind: Optional[str] = None
    weight: Optional[float] = None

    project: Optional[Project] = Relationship(back_populates="edges")

class Milestone(SQLModel, table=True):
    id: str = Field(primary_key=True)
    project_id: str = Field(foreign_key="project.id")
    title: str
    date: str
    status: str

    project: Optional[Project] = Relationship(back_populates="milestones")

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
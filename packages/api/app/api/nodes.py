from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.node import Node
from app.schemas.node import NodeCreate, NodeUpdate, NodeResponse

router = APIRouter()


@router.get("/", response_model=List[NodeResponse])
def list_nodes(project_id: str, db: Session = Depends(get_db)):
    nodes = db.query(Node).filter(Node.project_id == project_id).all()
    return nodes


@router.post("/", response_model=NodeResponse, status_code=201)
def create_node(project_id: str, node: NodeCreate, db: Session = Depends(get_db)):
    db_node = Node(**node.dict(), project_id=project_id)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node


@router.get("/{node_id}", response_model=NodeResponse)
def get_node(project_id: str, node_id: str, db: Session = Depends(get_db)):
    node = (
        db.query(Node)
        .filter(Node.id == node_id, Node.project_id == project_id)
        .first()
    )
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.patch("/{node_id}", response_model=NodeResponse)
def update_node(
    project_id: str,
    node_id: str,
    node_update: NodeUpdate,
    db: Session = Depends(get_db),
):
    db_node = (
        db.query(Node)
        .filter(Node.id == node_id, Node.project_id == project_id)
        .first()
    )
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
    db_node = (
        db.query(Node)
        .filter(Node.id == node_id, Node.project_id == project_id)
        .first()
    )
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")
    db.delete(db_node)
    db.commit()
    return None
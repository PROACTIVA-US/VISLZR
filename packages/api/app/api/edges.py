from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.edge import Edge
from app.schemas.edge import EdgeCreate, EdgeResponse

router = APIRouter()


@router.get("/", response_model=List[EdgeResponse])
def list_edges(project_id: str, db: Session = Depends(get_db)):
    edges = db.query(Edge).filter(Edge.project_id == project_id).all()
    return edges


@router.post("/", response_model=EdgeResponse, status_code=201)
def create_edge(project_id: str, edge: EdgeCreate, db: Session = Depends(get_db)):
    db_edge = Edge(**edge.dict(), project_id=project_id)
    db.add(db_edge)
    db.commit()
    db.refresh(db_edge)
    return db_edge


@router.get("/{edge_id}", response_model=EdgeResponse)
def get_edge(project_id: str, edge_id: str, db: Session = Depends(get_db)):
    edge = (
        db.query(Edge)
        .filter(Edge.id == edge_id, Edge.project_id == project_id)
        .first()
    )
    if not edge:
        raise HTTPException(status_code=404, detail="Edge not found")
    return edge


@router.delete("/{edge_id}", status_code=204)
def delete_edge(project_id: str, edge_id: str, db: Session = Depends(get_db)):
    db_edge = (
        db.query(Edge)
        .filter(Edge.id == edge_id, Edge.project_id == project_id)
        .first()
    )
    if not db_edge:
        raise HTTPException(status_code=404, detail="Edge not found")
    db.delete(db_edge)
    db.commit()
    return None
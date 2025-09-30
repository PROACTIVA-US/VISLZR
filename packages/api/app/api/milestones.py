from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.milestone import Milestone
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate, MilestoneResponse

router = APIRouter()


@router.get("/", response_model=List[MilestoneResponse])
def list_milestones(project_id: str, db: Session = Depends(get_db)):
    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
    return milestones


@router.post("/", response_model=MilestoneResponse, status_code=201)
def create_milestone(
    project_id: str, milestone: MilestoneCreate, db: Session = Depends(get_db)
):
    db_milestone = Milestone(**milestone.dict(), project_id=project_id)
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone


@router.get("/{milestone_id}", response_model=MilestoneResponse)
def get_milestone(project_id: str, milestone_id: str, db: Session = Depends(get_db)):
    milestone = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.project_id == project_id)
        .first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return milestone


@router.patch("/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    project_id: str,
    milestone_id: str,
    milestone_update: MilestoneUpdate,
    db: Session = Depends(get_db),
):
    milestone = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.project_id == project_id)
        .first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    update_data = milestone_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(milestone, key, value)

    db.commit()
    db.refresh(milestone)
    return milestone


@router.delete("/{milestone_id}", status_code=204)
def delete_milestone(project_id: str, milestone_id: str, db: Session = Depends(get_db)):
    milestone = (
        db.query(Milestone)
        .filter(Milestone.id == milestone_id, Milestone.project_id == project_id)
        .first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(milestone)
    db.commit()
    return None
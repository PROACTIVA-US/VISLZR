from sqlalchemy import Column, String, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    label = Column(String, nullable=False)
    type = Column(String, nullable=False)  # ROOT, FOLDER, FILE, TASK, etc.
    status = Column(String, nullable=False, default="IDLE")
    priority = Column(Integer, default=2)
    progress = Column(Integer, default=0)
    parent_id = Column(String, ForeignKey("nodes.id"), nullable=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
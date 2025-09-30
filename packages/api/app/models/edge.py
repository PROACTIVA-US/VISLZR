from sqlalchemy import Column, String, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Edge(Base):
    __tablename__ = "edges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    source = Column(String, ForeignKey("nodes.id"), nullable=False)
    target = Column(String, ForeignKey("nodes.id"), nullable=False)
    type = Column(String, nullable=False)  # parent, dependency, reference
    status = Column(String, default="active")  # active, blocked, met
    metadata = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
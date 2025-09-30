from sqlalchemy import Column, String, Date, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, default="planned")  # planned, pending, done
    description = Column(String, nullable=True)
    linked_nodes = Column(JSON, default=[])  # List of node IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
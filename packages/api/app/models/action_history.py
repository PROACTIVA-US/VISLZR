"""
SQLAlchemy model for action history tracking.
"""
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class ActionHistory(Base):
    __tablename__ = "action_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    node_id = Column(String, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False)
    action_id = Column(String, nullable=False)
    user_id = Column(String, nullable=True)  # For future authentication
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, nullable=False, default="success")  # success, failed, pending
    result = Column(JSON, default={})
    error_message = Column(String, nullable=True)

    def __repr__(self):
        return f"<ActionHistory {self.id} - {self.action_id} on {self.node_id}>"

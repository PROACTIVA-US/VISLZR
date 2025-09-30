"""
Pydantic schemas for sibling actions and context rules.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum


class ActionType(str, Enum):
    VIEW = "view"
    CREATE = "create"
    STATE = "state"
    AI = "ai"
    GROUP = "group"


class ActionCategory(str, Enum):
    FOUNDATIONAL = "foundational"
    AI = "ai"
    GROUPED = "grouped"


class SiblingAction(BaseModel):
    """Schema for a sibling node action."""
    id: str
    label: str
    icon: str
    type: ActionType
    category: ActionCategory
    group: Optional[str] = None
    handler: str
    requires_context: bool = False
    ai_powered: bool = False
    priority: int = Field(default=100, ge=0, le=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "view-timeline",
                "label": "Timeline",
                "icon": "📊",
                "type": "view",
                "category": "foundational",
                "handler": "viewTimelineHandler",
                "requires_context": False,
                "ai_powered": False,
                "priority": 100
            }
        }


class SiblingActionResponse(SiblingAction):
    """Response schema for sibling actions."""
    pass


class ContextRule(BaseModel):
    """Schema for context-aware action rules."""
    id: str
    node_types: List[str]
    node_statuses: Optional[List[str]] = None
    actions: List[str]
    priority: int = Field(default=100, ge=0, le=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "task-in-progress",
                "node_types": ["TASK"],
                "node_statuses": ["IN_PROGRESS"],
                "actions": ["view-dependencies", "update-progress", "ask-ai"],
                "priority": 100
            }
        }


class ContextRuleResponse(ContextRule):
    """Response schema for context rules."""
    pass


class ActionExecutionRequest(BaseModel):
    """Request schema for executing an action."""
    params: Optional[dict] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {
            "example": {
                "params": {
                    "progress": 50,
                    "note": "Updated progress"
                }
            }
        }


class ActionExecutionStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"


class ActionExecutionResult(BaseModel):
    """Response schema for action execution."""
    status: ActionExecutionStatus
    action_id: str
    node_id: str
    result: Optional[dict] = None
    error_message: Optional[str] = None
    executed_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "action_id": "update-progress",
                "node_id": "node-123",
                "result": {
                    "old_progress": 25,
                    "new_progress": 50
                },
                "executed_at": "2025-09-30T12:00:00Z"
            }
        }

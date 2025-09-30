"""
API endpoints for sibling node actions.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.node import Node
from app.models.project import Project
from app.models.action_history import ActionHistory
from app.schemas.action import (
    SiblingActionResponse,
    ActionExecutionRequest,
    ActionExecutionResult
)
from app.services.context_detector import context_detector
from app.services.action_registry import action_registry
from app.services.action_handlers import action_handler_registry

router = APIRouter()


@router.get(
    "/{node_id}/actions",
    response_model=List[SiblingActionResponse],
    summary="Get available actions for a node"
)
def get_node_actions(
    project_id: str,
    node_id: str,
    db: Session = Depends(get_db)
):
    """
    Get list of available sibling actions for a specific node.
    Actions are determined by node type and status.
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get node
    node = db.query(Node).filter(
        Node.id == node_id,
        Node.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Detect actions
    actions = context_detector.detect_actions(node)

    return actions


@router.get(
    "/{node_id}/actions/{group_id}/expand",
    response_model=List[SiblingActionResponse],
    summary="Expand a grouped action"
)
def expand_group_actions(
    project_id: str,
    node_id: str,
    group_id: str,
    db: Session = Depends(get_db)
):
    """
    Get sub-actions for a grouped sibling node.
    Returns only actions that are valid for the node context.
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get node
    node = db.query(Node).filter(
        Node.id == node_id,
        Node.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Expand group
    actions = context_detector.expand_group(group_id, node)

    return actions


@router.post(
    "/{node_id}/actions/{action_id}",
    response_model=ActionExecutionResult,
    summary="Execute a sibling action"
)
async def execute_node_action(
    project_id: str,
    node_id: str,
    action_id: str,
    request: ActionExecutionRequest,
    db: Session = Depends(get_db)
):
    """
    Execute a sibling action on a node.
    Returns execution result with status and any return data.
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get node
    node = db.query(Node).filter(
        Node.id == node_id,
        Node.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Get action definition
    action = action_registry.get_action(action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    # Validate action is available for this node
    if not context_detector.validate_action(action_id, node):
        raise HTTPException(
            status_code=403,
            detail="Action not available for this node"
        )

    # Execute action
    result = await action_handler_registry.execute_action(
        action_id=action_id,
        handler_name=action.handler,
        node=node,
        db=db,
        params=request.params
    )

    # Save to action history
    history = ActionHistory(
        project_id=project_id,
        node_id=node_id,
        action_id=action_id,
        status=result.status.value,
        result=result.result,
        error_message=result.error_message
    )
    db.add(history)
    db.commit()

    return result


@router.get(
    "/{node_id}/actions/history",
    response_model=List[dict],
    summary="Get action history for a node"
)
def get_node_action_history(
    project_id: str,
    node_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get execution history of actions for a specific node.
    Returns most recent actions first.
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get node
    node = db.query(Node).filter(
        Node.id == node_id,
        Node.project_id == project_id
    ).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Query history
    history = (
        db.query(ActionHistory)
        .filter(ActionHistory.node_id == node_id)
        .order_by(ActionHistory.executed_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": h.id,
            "action_id": h.action_id,
            "executed_at": h.executed_at.isoformat(),
            "status": h.status,
            "result": h.result,
            "error_message": h.error_message
        }
        for h in history
    ]

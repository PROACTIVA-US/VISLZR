"""
Action handler registry and execution service.
"""
from typing import Callable, Dict, Optional, Any
from datetime import datetime
from app.models.node import Node
from app.schemas.action import ActionExecutionResult, ActionExecutionStatus
from sqlalchemy.orm import Session
import json


class ActionHandlerRegistry:
    """
    Registry for action handlers and execution service.
    """

    _instance = None
    _handlers: Dict[str, Callable] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ActionHandlerRegistry, cls).__new__(cls)
            cls._instance._init_default_handlers()
        return cls._instance

    def _init_default_handlers(self) -> None:
        """Initialize default action handlers."""
        # Register foundational handlers
        self.register_handler("viewTimelineHandler", self._handle_view_timeline)
        self.register_handler("viewStatusLogHandler", self._handle_view_status_log)
        self.register_handler("viewDependenciesHandler", self._handle_view_dependencies)
        self.register_handler("viewDetailsHandler", self._handle_view_details)
        self.register_handler("viewSchemaHandler", self._handle_view_schema)

        # Creation handlers
        self.register_handler("addTaskHandler", self._handle_add_task)
        self.register_handler("addNoteHandler", self._handle_add_note)
        self.register_handler("addChildHandler", self._handle_add_child)
        self.register_handler("addIdeaHandler", self._handle_add_idea)
        self.register_handler("addMilestoneHandler", self._handle_add_milestone)

        # State change handlers
        self.register_handler("markCompleteHandler", self._handle_mark_complete)
        self.register_handler("updateProgressHandler", self._handle_update_progress)
        self.register_handler("pauseResumeHandler", self._handle_pause_resume)
        self.register_handler("startTaskHandler", self._handle_start_task)

        # AI handlers (placeholders for Phase 4)
        self.register_handler("securityScanHandler", self._handle_security_scan)
        self.register_handler("askAIHandler", self._handle_ask_ai)
        self.register_handler("debugAIHandler", self._handle_debug_ai)
        self.register_handler("unblockAIHandler", self._handle_unblock_ai)
        self.register_handler("alternativesAIHandler", self._handle_alternatives_ai)

        # Group expansion handler
        self.register_handler("expandGroupHandler", self._handle_expand_group)

    def register_handler(
        self,
        handler_name: str,
        handler_func: Callable
    ) -> None:
        """Register a handler function."""
        self._handlers[handler_name] = handler_func

    def get_handler(self, handler_name: str) -> Optional[Callable]:
        """Get handler function by name."""
        return self._handlers.get(handler_name)

    async def execute_action(
        self,
        action_id: str,
        handler_name: str,
        node: Node,
        db: Session,
        params: Optional[Dict[str, Any]] = None
    ) -> ActionExecutionResult:
        """
        Execute an action handler.
        """
        handler = self.get_handler(handler_name)

        if not handler:
            return ActionExecutionResult(
                status=ActionExecutionStatus.FAILED,
                action_id=action_id,
                node_id=node.id,
                error_message=f"Handler not found: {handler_name}",
                executed_at=datetime.utcnow().isoformat()
            )

        try:
            # Execute handler
            result = await handler(node, db, params or {})

            return ActionExecutionResult(
                status=ActionExecutionStatus.SUCCESS,
                action_id=action_id,
                node_id=node.id,
                result=result,
                executed_at=datetime.utcnow().isoformat()
            )

        except Exception as e:
            return ActionExecutionResult(
                status=ActionExecutionStatus.FAILED,
                action_id=action_id,
                node_id=node.id,
                error_message=str(e),
                executed_at=datetime.utcnow().isoformat()
            )

    # ==================== Handler Implementations ====================

    async def _handle_view_timeline(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle view timeline action."""
        return {
            "action": "view-timeline",
            "message": "Timeline view requested",
            "node_id": node.id
        }

    async def _handle_view_status_log(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle view status log action."""
        return {
            "action": "view-status-log",
            "message": "Status log view requested",
            "node_id": node.id,
            "current_status": node.status
        }

    async def _handle_view_dependencies(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle view dependencies action."""
        # In future, query edges table for dependencies
        return {
            "action": "view-dependencies",
            "message": "Dependencies view requested",
            "node_id": node.id,
            "dependencies": node.metadata.get("dependencies", []) if node.metadata else []
        }

    async def _handle_view_details(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle view details action."""
        return {
            "action": "view-details",
            "node": {
                "id": node.id,
                "label": node.label,
                "type": node.type,
                "status": node.status,
                "priority": node.priority,
                "progress": node.progress,
                "metadata": node.metadata
            }
        }

    async def _handle_view_schema(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle view schema action (for DATABASE nodes)."""
        schema = node.metadata.get("schema", {}) if node.metadata else {}
        return {
            "action": "view-schema",
            "node_id": node.id,
            "schema": schema
        }

    async def _handle_add_task(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle add task action."""
        return {
            "action": "add-task",
            "message": "Task creation requested",
            "parent_node_id": node.id,
            "task_params": params
        }

    async def _handle_add_note(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle add note action."""
        return {
            "action": "add-note",
            "message": "Note creation requested",
            "parent_node_id": node.id,
            "note_content": params.get("content", "")
        }

    async def _handle_add_child(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle add child node action."""
        return {
            "action": "add-child",
            "message": "Child node creation requested",
            "parent_node_id": node.id,
            "child_params": params
        }

    async def _handle_add_idea(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle add idea action."""
        return {
            "action": "add-idea",
            "message": "Idea creation requested",
            "parent_node_id": node.id,
            "idea_params": params
        }

    async def _handle_add_milestone(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle add milestone action."""
        return {
            "action": "add-milestone",
            "message": "Milestone creation requested",
            "project_id": node.project_id,
            "milestone_params": params
        }

    async def _handle_mark_complete(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle mark complete action."""
        old_status = node.status
        node.status = "COMPLETED"
        node.progress = 100
        db.commit()

        return {
            "action": "mark-complete",
            "message": "Node marked as complete",
            "node_id": node.id,
            "old_status": old_status,
            "new_status": "COMPLETED"
        }

    async def _handle_update_progress(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle update progress action."""
        old_progress = node.progress
        new_progress = params.get("progress", old_progress)

        # Validate progress
        if not 0 <= new_progress <= 100:
            raise ValueError("Progress must be between 0 and 100")

        node.progress = new_progress

        # Update status based on progress
        if new_progress == 100:
            node.status = "COMPLETED"
        elif new_progress > 0:
            node.status = "IN_PROGRESS"

        db.commit()

        return {
            "action": "update-progress",
            "message": "Progress updated",
            "node_id": node.id,
            "old_progress": old_progress,
            "new_progress": new_progress
        }

    async def _handle_pause_resume(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle pause/resume action."""
        old_status = node.status

        if node.status == "IN_PROGRESS":
            node.status = "IDLE"
            action_taken = "paused"
        elif node.status == "IDLE":
            node.status = "IN_PROGRESS"
            action_taken = "resumed"
        else:
            raise ValueError(f"Cannot pause/resume from status: {node.status}")

        db.commit()

        return {
            "action": "pause-resume",
            "message": f"Node {action_taken}",
            "node_id": node.id,
            "old_status": old_status,
            "new_status": node.status
        }

    async def _handle_start_task(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle start task action."""
        old_status = node.status
        node.status = "IN_PROGRESS"
        db.commit()

        return {
            "action": "start-task",
            "message": "Task started",
            "node_id": node.id,
            "old_status": old_status,
            "new_status": "IN_PROGRESS"
        }

    async def _handle_security_scan(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle security scan action (placeholder for Phase 4)."""
        return {
            "action": "security-scan",
            "message": "Security scan requested (AI integration pending)",
            "node_id": node.id,
            "status": "pending"
        }

    async def _handle_ask_ai(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle ask AI action (placeholder for Phase 4)."""
        query = params.get("query", "")
        return {
            "action": "ask-ai",
            "message": "AI query requested (AI integration pending)",
            "node_id": node.id,
            "query": query,
            "status": "pending"
        }

    async def _handle_debug_ai(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle debug AI action (placeholder for Phase 4)."""
        return {
            "action": "debug-ai",
            "message": "AI debugging requested (AI integration pending)",
            "node_id": node.id,
            "status": "pending"
        }

    async def _handle_unblock_ai(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle unblock AI action (placeholder for Phase 4)."""
        return {
            "action": "unblock-ai",
            "message": "AI unblock suggestions requested (AI integration pending)",
            "node_id": node.id,
            "status": "pending"
        }

    async def _handle_alternatives_ai(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle alternatives AI action (placeholder for Phase 4)."""
        return {
            "action": "alternatives-ai",
            "message": "AI alternatives requested (AI integration pending)",
            "node_id": node.id,
            "status": "pending"
        }

    async def _handle_expand_group(
        self,
        node: Node,
        db: Session,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle expand group action."""
        group_id = params.get("group_id", "")
        return {
            "action": "expand-group",
            "message": "Group expansion requested",
            "node_id": node.id,
            "group_id": group_id
        }


# Singleton instance
action_handler_registry = ActionHandlerRegistry()

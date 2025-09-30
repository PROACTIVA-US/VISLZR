"""
Context detection service for determining available sibling actions.
"""
from typing import List, Optional
from app.models.node import Node
from app.schemas.action import SiblingAction
from app.services.action_registry import action_registry


class ContextDetector:
    """
    Service for detecting which sibling actions are available
    based on node type and status.
    """

    def __init__(self):
        self.registry = action_registry

    def detect_actions(self, node: Node) -> List[SiblingAction]:
        """
        Detect available actions for a given node.
        Returns actions sorted by priority.
        """
        return self.registry.get_actions_for_context(
            node_type=node.type,
            node_status=node.status
        )

    def expand_group(
        self,
        group_id: str,
        node: Node
    ) -> List[SiblingAction]:
        """
        Get sub-actions for a grouped sibling.
        Only returns actions that are valid for the node context.
        """
        # Get all actions in the group
        group_actions = self.registry.get_actions_by_group(group_id)

        # Filter by node context
        available_actions = self.detect_actions(node)
        available_ids = {action.id for action in available_actions}

        # Return only group actions that are also available for this node
        filtered_actions = [
            action for action in group_actions
            if action.id in available_ids
        ]

        # Sort by priority
        filtered_actions.sort(key=lambda a: a.priority)

        return filtered_actions

    def validate_action(
        self,
        action_id: str,
        node: Node
    ) -> bool:
        """
        Validate if an action is available for a given node.
        """
        return self.registry.validate_action(
            action_id=action_id,
            node_type=node.type,
            node_status=node.status
        )

    def filter_by_node_metadata(
        self,
        actions: List[SiblingAction],
        node: Node
    ) -> List[SiblingAction]:
        """
        Further filter actions based on node metadata.
        For example, only show 'view-code' if node has code.
        """
        filtered_actions = []

        for action in actions:
            # Check if action requires specific metadata
            if action.id == "view-code":
                # Only show if node has code
                if node.metadata and node.metadata.get("code"):
                    filtered_actions.append(action)
            elif action.id == "view-schema":
                # Only show for DATABASE nodes
                if node.type == "DATABASE":
                    filtered_actions.append(action)
            elif action.id == "check-updates":
                # Only show for DEPENDENCY nodes
                if node.type == "DEPENDENCY":
                    filtered_actions.append(action)
            else:
                # No special requirements
                filtered_actions.append(action)

        return filtered_actions

    def get_action_count_for_node(self, node: Node) -> int:
        """
        Get count of available actions for a node.
        Useful for UI indicators.
        """
        actions = self.detect_actions(node)
        return len(actions)

    def has_ai_actions(self, node: Node) -> bool:
        """
        Check if node has any AI-powered actions available.
        """
        actions = self.detect_actions(node)
        return any(action.ai_powered for action in actions)

    def get_primary_action(self, node: Node) -> Optional[SiblingAction]:
        """
        Get the primary (highest priority) action for a node.
        Useful for quick actions or keyboard shortcuts.
        """
        actions = self.detect_actions(node)
        return actions[0] if actions else None

    def get_actions_by_category(
        self,
        node: Node,
        category: str
    ) -> List[SiblingAction]:
        """
        Get actions filtered by category.
        """
        actions = self.detect_actions(node)
        return [
            action for action in actions
            if action.category.value == category
        ]


# Singleton instance
context_detector = ContextDetector()

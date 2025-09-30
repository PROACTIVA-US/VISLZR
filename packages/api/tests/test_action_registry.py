"""
Tests for action registry system.
"""
import pytest
from app.services.action_registry import ActionRegistry, action_registry
from app.schemas.action import SiblingAction, ContextRule, ActionType, ActionCategory


class TestActionRegistry:
    """Test ActionRegistry class."""

    def test_singleton_pattern(self):
        """Test that ActionRegistry is a singleton."""
        registry1 = ActionRegistry()
        registry2 = ActionRegistry()
        assert registry1 is registry2

    def test_default_actions_loaded(self):
        """Test that default actions are loaded on initialization."""
        actions = action_registry.get_all_actions()
        assert len(actions) > 0

        # Check for specific foundational actions
        assert action_registry.get_action("view-timeline") is not None
        assert action_registry.get_action("mark-complete") is not None
        assert action_registry.get_action("add-task") is not None

    def test_default_context_rules_loaded(self):
        """Test that default context rules are loaded."""
        rules = action_registry.get_all_context_rules()
        assert len(rules) > 0

        # Check for specific rules
        assert action_registry.get_context_rule("root-actions") is not None
        assert action_registry.get_context_rule("task-in-progress") is not None

    def test_register_custom_action(self):
        """Test registering a custom action."""
        custom_action = SiblingAction(
            id="custom-test-action",
            label="Test Action",
            icon="🧪",
            type=ActionType.VIEW,
            category=ActionCategory.FOUNDATIONAL,
            handler="testHandler"
        )

        action_registry.register_action(custom_action)
        retrieved = action_registry.get_action("custom-test-action")

        assert retrieved is not None
        assert retrieved.label == "Test Action"
        assert retrieved.icon == "🧪"

    def test_register_custom_context_rule(self):
        """Test registering a custom context rule."""
        custom_rule = ContextRule(
            id="custom-test-rule",
            node_types=["TEST_NODE"],
            actions=["custom-test-action"],
            priority=999
        )

        action_registry.register_context_rule(custom_rule)
        retrieved = action_registry.get_context_rule("custom-test-rule")

        assert retrieved is not None
        assert "TEST_NODE" in retrieved.node_types


class TestGetActionsForContext:
    """Test context-based action retrieval."""

    def test_get_actions_for_root_node(self):
        """Test getting actions for ROOT node."""
        actions = action_registry.get_actions_for_context("ROOT")
        action_ids = [a.id for a in actions]

        assert "view-timeline" in action_ids
        assert "view-status-log" in action_ids
        assert "scans-group" in action_ids

    def test_get_actions_for_task_in_progress(self):
        """Test getting actions for TASK with IN_PROGRESS status."""
        actions = action_registry.get_actions_for_context("TASK", "IN_PROGRESS")
        action_ids = [a.id for a in actions]

        assert "view-dependencies" in action_ids
        assert "update-progress" in action_ids
        assert "mark-complete" in action_ids
        assert "ask-ai" in action_ids

    def test_get_actions_for_task_blocked(self):
        """Test getting actions for TASK with BLOCKED status."""
        actions = action_registry.get_actions_for_context("TASK", "BLOCKED")
        action_ids = [a.id for a in actions]

        assert "view-dependencies" in action_ids
        assert "unblock-ai" in action_ids
        assert "add-note" in action_ids

    def test_get_actions_for_file_node(self):
        """Test getting actions for FILE node."""
        actions = action_registry.get_actions_for_context("FILE")
        action_ids = [a.id for a in actions]

        assert "view-details" in action_ids
        assert "ask-ai" in action_ids
        assert "refactor-code" in action_ids

    def test_get_actions_for_service_running(self):
        """Test getting actions for SERVICE with RUNNING status."""
        actions = action_registry.get_actions_for_context("SERVICE", "RUNNING")
        action_ids = [a.id for a in actions]

        assert "view-details" in action_ids
        assert "pause-resume" in action_ids
        assert "performance-scan" in action_ids

    def test_get_actions_for_service_error(self):
        """Test getting actions for SERVICE with ERROR status."""
        actions = action_registry.get_actions_for_context("SERVICE", "ERROR")
        action_ids = [a.id for a in actions]

        assert "debug-ai" in action_ids
        assert "view-details" in action_ids

    def test_get_actions_for_database(self):
        """Test getting actions for DATABASE node."""
        actions = action_registry.get_actions_for_context("DATABASE")
        action_ids = [a.id for a in actions]

        assert "view-schema" in action_ids
        assert "security-scan" in action_ids

    def test_actions_sorted_by_priority(self):
        """Test that actions are sorted by priority."""
        actions = action_registry.get_actions_for_context("TASK", "IN_PROGRESS")

        # Verify that priorities are in ascending order
        priorities = [action.priority for action in actions]
        assert priorities == sorted(priorities)


class TestGroupActions:
    """Test grouped action handling."""

    def test_get_actions_by_group(self):
        """Test retrieving actions by group ID."""
        scans_group_actions = action_registry.get_actions_by_group("scans-group")
        action_ids = [a.id for a in scans_group_actions]

        assert "security-scan" in action_ids
        assert "compliance-scan" in action_ids
        assert "optimization-scan" in action_ids
        assert "architectural-scan" in action_ids

    def test_ai_actions_group(self):
        """Test AI actions group."""
        ai_actions = action_registry.get_actions_by_group("ai-actions-group")
        action_ids = [a.id for a in ai_actions]

        assert "propose-features" in action_ids
        assert "refactor-code" in action_ids
        assert "generate-docs" in action_ids
        assert "generate-tests" in action_ids

    def test_group_action_exists(self):
        """Test that group actions themselves exist."""
        scans_group = action_registry.get_action("scans-group")
        assert scans_group is not None
        assert scans_group.type == ActionType.GROUP


class TestValidateAction:
    """Test action validation."""

    def test_validate_available_action(self):
        """Test validating an action that is available."""
        is_valid = action_registry.validate_action(
            "mark-complete",
            "TASK",
            "IN_PROGRESS"
        )
        assert is_valid

    def test_validate_unavailable_action(self):
        """Test validating an action that is not available."""
        is_valid = action_registry.validate_action(
            "view-schema",  # Only for DATABASE nodes
            "TASK",
            "IN_PROGRESS"
        )
        assert not is_valid

    def test_validate_nonexistent_action(self):
        """Test validating a non-existent action."""
        is_valid = action_registry.validate_action(
            "nonexistent-action",
            "TASK",
            "IN_PROGRESS"
        )
        assert not is_valid

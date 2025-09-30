"""
Central registry for sibling actions and context rules.
"""
from typing import List, Dict, Optional
from app.schemas.action import SiblingAction, ContextRule, ActionType, ActionCategory


class ActionRegistry:
    """
    Central registry for managing sibling actions and context rules.
    Singleton pattern to ensure global access.
    """

    _instance = None
    _actions: Dict[str, SiblingAction] = {}
    _context_rules: Dict[str, ContextRule] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ActionRegistry, cls).__new__(cls)
            cls._instance._init_default_actions()
            cls._instance._init_default_context_rules()
        return cls._instance

    def _init_default_actions(self) -> None:
        """Initialize default sibling actions."""
        default_actions = [
            # Foundational - View Siblings
            SiblingAction(
                id="view-timeline",
                label="Timeline",
                icon="📊",
                type=ActionType.VIEW,
                category=ActionCategory.FOUNDATIONAL,
                handler="viewTimelineHandler",
                priority=10
            ),
            SiblingAction(
                id="view-status-log",
                label="Status Log",
                icon="📝",
                type=ActionType.VIEW,
                category=ActionCategory.FOUNDATIONAL,
                handler="viewStatusLogHandler",
                priority=20
            ),
            SiblingAction(
                id="view-dependencies",
                label="Dependencies",
                icon="🔗",
                type=ActionType.VIEW,
                category=ActionCategory.FOUNDATIONAL,
                handler="viewDependenciesHandler",
                requires_context=True,
                priority=30
            ),
            SiblingAction(
                id="view-details",
                label="Details",
                icon="📄",
                type=ActionType.VIEW,
                category=ActionCategory.FOUNDATIONAL,
                handler="viewDetailsHandler",
                requires_context=True,
                priority=40
            ),
            SiblingAction(
                id="view-schema",
                label="Schema",
                icon="🗂",
                type=ActionType.VIEW,
                category=ActionCategory.FOUNDATIONAL,
                handler="viewSchemaHandler",
                requires_context=True,
                priority=50
            ),

            # Foundational - Creation Siblings
            SiblingAction(
                id="add-task",
                label="Add Task",
                icon="➕",
                type=ActionType.CREATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="addTaskHandler",
                requires_context=True,
                priority=60
            ),
            SiblingAction(
                id="add-note",
                label="Add Note",
                icon="➕",
                type=ActionType.CREATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="addNoteHandler",
                requires_context=True,
                priority=70
            ),
            SiblingAction(
                id="add-child",
                label="Add Child",
                icon="➕",
                type=ActionType.CREATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="addChildHandler",
                requires_context=True,
                priority=80
            ),
            SiblingAction(
                id="add-idea",
                label="Add Idea",
                icon="➕",
                type=ActionType.CREATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="addIdeaHandler",
                requires_context=True,
                priority=90
            ),
            SiblingAction(
                id="add-milestone",
                label="Add Milestone",
                icon="🏁",
                type=ActionType.CREATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="addMilestoneHandler",
                requires_context=True,
                priority=95
            ),

            # Foundational - State-Change Siblings
            SiblingAction(
                id="mark-complete",
                label="Complete",
                icon="✓",
                type=ActionType.STATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="markCompleteHandler",
                requires_context=True,
                priority=100
            ),
            SiblingAction(
                id="update-progress",
                label="Progress",
                icon="🔄",
                type=ActionType.STATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="updateProgressHandler",
                requires_context=True,
                priority=110
            ),
            SiblingAction(
                id="pause-resume",
                label="Pause/Resume",
                icon="⏸",
                type=ActionType.STATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="pauseResumeHandler",
                requires_context=True,
                priority=120
            ),
            SiblingAction(
                id="start-task",
                label="Start",
                icon="🏃",
                type=ActionType.STATE,
                category=ActionCategory.FOUNDATIONAL,
                handler="startTaskHandler",
                requires_context=True,
                priority=130
            ),

            # AI - Maintenance Scans
            SiblingAction(
                id="security-scan",
                label="Security Scan",
                icon="🔒",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="scans-group",
                handler="securityScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=200
            ),
            SiblingAction(
                id="compliance-scan",
                label="Compliance",
                icon="📋",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="scans-group",
                handler="complianceScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=210
            ),
            SiblingAction(
                id="check-updates",
                label="Check Updates",
                icon="⬆️",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="checkUpdatesHandler",
                requires_context=True,
                ai_powered=True,
                priority=220
            ),
            SiblingAction(
                id="dependency-audit",
                label="Dependency Audit",
                icon="🔍",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="dependencyAuditHandler",
                requires_context=True,
                ai_powered=True,
                priority=230
            ),

            # AI - Optimization Scans
            SiblingAction(
                id="optimization-scan",
                label="Optimization",
                icon="⚡",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="scans-group",
                handler="optimizationScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=240
            ),
            SiblingAction(
                id="architectural-scan",
                label="Architecture",
                icon="🏗",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="scans-group",
                handler="architecturalScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=250
            ),
            SiblingAction(
                id="performance-scan",
                label="Performance",
                icon="💾",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="performanceScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=260
            ),
            SiblingAction(
                id="code-quality-scan",
                label="Code Quality",
                icon="♻️",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="codeQualityScanHandler",
                requires_context=True,
                ai_powered=True,
                priority=270
            ),

            # AI - Generative & Exploratory
            SiblingAction(
                id="propose-features",
                label="Propose Features",
                icon="💡",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="ai-actions-group",
                handler="proposeFeaturesHandler",
                requires_context=True,
                ai_powered=True,
                priority=300
            ),
            SiblingAction(
                id="ask-ai",
                label="Ask AI",
                icon="❓",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="askAIHandler",
                requires_context=True,
                ai_powered=True,
                priority=310
            ),
            SiblingAction(
                id="refactor-code",
                label="Refactor",
                icon="🔄",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="ai-actions-group",
                handler="refactorCodeHandler",
                requires_context=True,
                ai_powered=True,
                priority=320
            ),
            SiblingAction(
                id="generate-docs",
                label="Generate Docs",
                icon="📝",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="ai-actions-group",
                handler="generateDocsHandler",
                requires_context=True,
                ai_powered=True,
                priority=330
            ),
            SiblingAction(
                id="generate-tests",
                label="Generate Tests",
                icon="🧪",
                type=ActionType.AI,
                category=ActionCategory.AI,
                group="ai-actions-group",
                handler="generateTestsHandler",
                requires_context=True,
                ai_powered=True,
                priority=340
            ),

            # Special Actions
            SiblingAction(
                id="unblock-ai",
                label="Unblock",
                icon="🔓",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="unblockAIHandler",
                requires_context=True,
                ai_powered=True,
                priority=400
            ),
            SiblingAction(
                id="debug-ai",
                label="Debug",
                icon="🐛",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="debugAIHandler",
                requires_context=True,
                ai_powered=True,
                priority=410
            ),
            SiblingAction(
                id="alternatives-ai",
                label="Alternatives",
                icon="🔄",
                type=ActionType.AI,
                category=ActionCategory.AI,
                handler="alternativesAIHandler",
                requires_context=True,
                ai_powered=True,
                priority=420
            ),

            # Grouped Actions
            SiblingAction(
                id="scans-group",
                label="Scans",
                icon="🔍",
                type=ActionType.GROUP,
                category=ActionCategory.GROUPED,
                handler="expandGroupHandler",
                priority=500
            ),
            SiblingAction(
                id="ai-actions-group",
                label="AI Actions",
                icon="🤖",
                type=ActionType.GROUP,
                category=ActionCategory.GROUPED,
                handler="expandGroupHandler",
                priority=510
            ),
            SiblingAction(
                id="integrations-group",
                label="Integrations",
                icon="🔗",
                type=ActionType.GROUP,
                category=ActionCategory.GROUPED,
                handler="expandGroupHandler",
                priority=520
            ),
        ]

        for action in default_actions:
            self._actions[action.id] = action

    def _init_default_context_rules(self) -> None:
        """Initialize default context rules."""
        default_rules = [
            # ROOT node
            ContextRule(
                id="root-actions",
                node_types=["ROOT"],
                actions=[
                    "view-timeline",
                    "view-status-log",
                    "scans-group",
                    "add-milestone",
                    "ai-actions-group"
                ],
                priority=10
            ),

            # TASK - IN_PROGRESS
            ContextRule(
                id="task-in-progress",
                node_types=["TASK"],
                node_statuses=["IN_PROGRESS"],
                actions=[
                    "view-dependencies",
                    "update-progress",
                    "add-note",
                    "ask-ai",
                    "mark-complete",
                    "pause-resume"
                ],
                priority=20
            ),

            # TASK - IDLE
            ContextRule(
                id="task-idle",
                node_types=["TASK"],
                node_statuses=["IDLE", "PLANNED"],
                actions=[
                    "view-dependencies",
                    "view-details",
                    "start-task",
                    "add-note",
                    "ask-ai"
                ],
                priority=30
            ),

            # TASK - BLOCKED
            ContextRule(
                id="task-blocked",
                node_types=["TASK"],
                node_statuses=["BLOCKED"],
                actions=[
                    "view-dependencies",
                    "unblock-ai",
                    "add-note",
                    "ask-ai"
                ],
                priority=40
            ),

            # TASK - OVERDUE
            ContextRule(
                id="task-overdue",
                node_types=["TASK"],
                node_statuses=["OVERDUE"],
                actions=[
                    "view-dependencies",
                    "update-progress",
                    "mark-complete",
                    "add-note"
                ],
                priority=50
            ),

            # TASK - COMPLETED
            ContextRule(
                id="task-completed",
                node_types=["TASK"],
                node_statuses=["COMPLETED"],
                actions=[
                    "view-details",
                    "view-dependencies",
                    "add-note"
                ],
                priority=60
            ),

            # FILE node
            ContextRule(
                id="file-actions",
                node_types=["FILE"],
                actions=[
                    "view-details",
                    "add-note",
                    "ask-ai",
                    "refactor-code",
                    "generate-tests",
                    "code-quality-scan"
                ],
                priority=70
            ),

            # SERVICE - RUNNING
            ContextRule(
                id="service-running",
                node_types=["SERVICE"],
                node_statuses=["RUNNING"],
                actions=[
                    "view-details",
                    "pause-resume",
                    "performance-scan",
                    "security-scan",
                    "add-note"
                ],
                priority=80
            ),

            # SERVICE - ERROR
            ContextRule(
                id="service-error",
                node_types=["SERVICE"],
                node_statuses=["ERROR"],
                actions=[
                    "view-details",
                    "debug-ai",
                    "pause-resume",
                    "ask-ai",
                    "add-note"
                ],
                priority=90
            ),

            # SERVICE - STOPPED
            ContextRule(
                id="service-stopped",
                node_types=["SERVICE"],
                node_statuses=["STOPPED"],
                actions=[
                    "view-details",
                    "start-task",
                    "add-note"
                ],
                priority=100
            ),

            # DATABASE
            ContextRule(
                id="database-actions",
                node_types=["DATABASE"],
                actions=[
                    "view-schema",
                    "view-details",
                    "security-scan",
                    "performance-scan",
                    "add-note"
                ],
                priority=110
            ),

            # SECURITY node (vulnerability)
            ContextRule(
                id="security-actions",
                node_types=["SECURITY"],
                actions=[
                    "view-details",
                    "add-task",
                    "ask-ai",
                    "add-note"
                ],
                priority=120
            ),

            # DEPENDENCY
            ContextRule(
                id="dependency-actions",
                node_types=["DEPENDENCY"],
                actions=[
                    "view-details",
                    "check-updates",
                    "security-scan",
                    "alternatives-ai",
                    "add-note"
                ],
                priority=130
            ),

            # FOLDER
            ContextRule(
                id="folder-actions",
                node_types=["FOLDER"],
                actions=[
                    "view-details",
                    "add-child",
                    "add-note",
                    "architectural-scan"
                ],
                priority=140
            ),

            # COMPONENT
            ContextRule(
                id="component-actions",
                node_types=["COMPONENT"],
                actions=[
                    "view-details",
                    "view-dependencies",
                    "add-note",
                    "ask-ai",
                    "refactor-code",
                    "generate-tests",
                    "code-quality-scan"
                ],
                priority=150
            ),

            # API_ENDPOINT
            ContextRule(
                id="api-endpoint-actions",
                node_types=["API_ENDPOINT"],
                actions=[
                    "view-details",
                    "view-dependencies",
                    "security-scan",
                    "performance-scan",
                    "generate-tests",
                    "add-note"
                ],
                priority=160
            ),

            # MILESTONE
            ContextRule(
                id="milestone-actions",
                node_types=["MILESTONE"],
                actions=[
                    "view-details",
                    "view-dependencies",
                    "view-timeline",
                    "add-note"
                ],
                priority=170
            ),

            # IDEA
            ContextRule(
                id="idea-actions",
                node_types=["IDEA"],
                actions=[
                    "view-details",
                    "add-task",
                    "ask-ai",
                    "propose-features",
                    "add-note"
                ],
                priority=180
            ),

            # NOTE
            ContextRule(
                id="note-actions",
                node_types=["NOTE"],
                actions=[
                    "view-details",
                    "add-note"
                ],
                priority=190
            ),

            # AGENT
            ContextRule(
                id="agent-actions",
                node_types=["AGENT"],
                actions=[
                    "view-details",
                    "pause-resume",
                    "view-status-log",
                    "add-note"
                ],
                priority=200
            ),
        ]

        for rule in default_rules:
            self._context_rules[rule.id] = rule

    def register_action(self, action: SiblingAction) -> None:
        """Register a new action."""
        self._actions[action.id] = action

    def register_context_rule(self, rule: ContextRule) -> None:
        """Register a new context rule."""
        self._context_rules[rule.id] = rule

    def get_action(self, action_id: str) -> Optional[SiblingAction]:
        """Get action by ID."""
        return self._actions.get(action_id)

    def get_all_actions(self) -> List[SiblingAction]:
        """Get all registered actions."""
        return list(self._actions.values())

    def get_actions_by_group(self, group_id: str) -> List[SiblingAction]:
        """Get all actions belonging to a group."""
        return [
            action for action in self._actions.values()
            if action.group == group_id
        ]

    def get_context_rule(self, rule_id: str) -> Optional[ContextRule]:
        """Get context rule by ID."""
        return self._context_rules.get(rule_id)

    def get_all_context_rules(self) -> List[ContextRule]:
        """Get all registered context rules."""
        return list(self._context_rules.values())

    def get_actions_for_context(
        self,
        node_type: str,
        node_status: Optional[str] = None
    ) -> List[SiblingAction]:
        """
        Get applicable actions for a given node type and status.
        Returns actions sorted by priority.
        """
        applicable_action_ids = set()

        # Find matching context rules
        for rule in self._context_rules.values():
            if node_type in rule.node_types:
                # If rule has status requirements, check them
                if rule.node_statuses:
                    if node_status and node_status in rule.node_statuses:
                        applicable_action_ids.update(rule.actions)
                else:
                    # Rule applies to all statuses
                    applicable_action_ids.update(rule.actions)

        # Convert action IDs to action objects
        actions = [
            self._actions[action_id]
            for action_id in applicable_action_ids
            if action_id in self._actions
        ]

        # Sort by priority (lower number = higher priority)
        actions.sort(key=lambda a: a.priority)

        return actions

    def validate_action(
        self,
        action_id: str,
        node_type: str,
        node_status: Optional[str] = None
    ) -> bool:
        """
        Validate if an action is available for a given node context.
        """
        available_actions = self.get_actions_for_context(node_type, node_status)
        return action_id in [action.id for action in available_actions]


# Singleton instance
action_registry = ActionRegistry()

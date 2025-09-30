"""
Tests for actions API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.models.node import Node


class TestGetNodeActions:
    """Test GET /api/projects/{pid}/nodes/{nid}/actions endpoint."""

    def test_get_actions_for_root_node(self, client, sample_project):
        """Test getting actions for a ROOT node."""
        # Create ROOT node
        node = Node(
            id="root-node-1",
            project_id=sample_project.id,
            label="Project Root",
            type="ROOT",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        # Get actions
        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/root-node-1/actions"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        # Check for expected actions
        action_ids = [action["id"] for action in data]
        assert "view-timeline" in action_ids
        assert "view-status-log" in action_ids

    def test_get_actions_for_task_in_progress(self, client, sample_project):
        """Test getting actions for TASK node with IN_PROGRESS status."""
        # Create TASK node
        node = Node(
            id="task-node-1",
            project_id=sample_project.id,
            label="Test Task",
            type="TASK",
            status="IN_PROGRESS",
            progress=50
        )
        client.db.add(node)
        client.db.commit()

        # Get actions
        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/task-node-1/actions"
        )

        assert response.status_code == 200
        data = response.json()

        action_ids = [action["id"] for action in data]
        assert "update-progress" in action_ids
        assert "mark-complete" in action_ids
        assert "view-dependencies" in action_ids

    def test_get_actions_for_task_blocked(self, client, sample_project):
        """Test getting actions for TASK node with BLOCKED status."""
        node = Node(
            id="blocked-task-1",
            project_id=sample_project.id,
            label="Blocked Task",
            type="TASK",
            status="BLOCKED"
        )
        client.db.add(node)
        client.db.commit()

        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/blocked-task-1/actions"
        )

        assert response.status_code == 200
        data = response.json()

        action_ids = [action["id"] for action in data]
        assert "unblock-ai" in action_ids

    def test_get_actions_for_file_node(self, client, sample_project):
        """Test getting actions for FILE node."""
        node = Node(
            id="file-node-1",
            project_id=sample_project.id,
            label="main.py",
            type="FILE",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/file-node-1/actions"
        )

        assert response.status_code == 200
        data = response.json()

        action_ids = [action["id"] for action in data]
        assert "refactor-code" in action_ids
        assert "generate-tests" in action_ids

    def test_get_actions_nonexistent_project(self, client):
        """Test getting actions for non-existent project."""
        response = client.get(
            "/api/projects/nonexistent/nodes/some-node/actions"
        )
        assert response.status_code == 404
        assert "Project not found" in response.json()["detail"]

    def test_get_actions_nonexistent_node(self, client, sample_project):
        """Test getting actions for non-existent node."""
        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/nonexistent/actions"
        )
        assert response.status_code == 404
        assert "Node not found" in response.json()["detail"]


class TestExpandGroupActions:
    """Test GET /api/projects/{pid}/nodes/{nid}/actions/{group_id}/expand."""

    def test_expand_scans_group(self, client, sample_project):
        """Test expanding the scans group."""
        node = Node(
            id="node-for-group-1",
            project_id=sample_project.id,
            label="Test Node",
            type="FILE",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/node-for-group-1/actions/scans-group/expand"
        )

        assert response.status_code == 200
        data = response.json()

        action_ids = [action["id"] for action in data]
        # FILE nodes should have code-quality-scan from scans group
        assert "code-quality-scan" in action_ids

    def test_expand_ai_actions_group(self, client, sample_project):
        """Test expanding the AI actions group."""
        node = Node(
            id="node-for-ai-1",
            project_id=sample_project.id,
            label="Component",
            type="COMPONENT",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/node-for-ai-1/actions/ai-actions-group/expand"
        )

        assert response.status_code == 200
        data = response.json()

        action_ids = [action["id"] for action in data]
        assert "refactor-code" in action_ids
        assert "generate-tests" in action_ids


class TestExecuteAction:
    """Test POST /api/projects/{pid}/nodes/{nid}/actions/{action_id}."""

    def test_execute_mark_complete(self, client, sample_project):
        """Test executing mark-complete action."""
        node = Node(
            id="task-to-complete",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IN_PROGRESS",
            progress=90
        )
        client.db.add(node)
        client.db.commit()

        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-to-complete/actions/mark-complete",
            json={"params": {}}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action_id"] == "mark-complete"

        # Verify node was updated
        client.db.refresh(node)
        assert node.status == "COMPLETED"
        assert node.progress == 100

    def test_execute_update_progress(self, client, sample_project):
        """Test executing update-progress action."""
        node = Node(
            id="task-update-progress",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IN_PROGRESS",
            progress=25
        )
        client.db.add(node)
        client.db.commit()

        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-update-progress/actions/update-progress",
            json={"params": {"progress": 75}}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["result"]["old_progress"] == 25
        assert data["result"]["new_progress"] == 75

        # Verify node was updated
        client.db.refresh(node)
        assert node.progress == 75

    def test_execute_start_task(self, client, sample_project):
        """Test executing start-task action."""
        node = Node(
            id="task-to-start",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-to-start/actions/start-task",
            json={"params": {}}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

        # Verify node was updated
        client.db.refresh(node)
        assert node.status == "IN_PROGRESS"

    def test_execute_pause_resume(self, client, sample_project):
        """Test executing pause-resume action."""
        node = Node(
            id="task-to-pause",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IN_PROGRESS"
        )
        client.db.add(node)
        client.db.commit()

        # Pause
        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-to-pause/actions/pause-resume",
            json={"params": {}}
        )

        assert response.status_code == 200
        client.db.refresh(node)
        assert node.status == "IDLE"

        # Resume
        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-to-pause/actions/pause-resume",
            json={"params": {}}
        )

        assert response.status_code == 200
        client.db.refresh(node)
        assert node.status == "IN_PROGRESS"

    def test_execute_action_not_available(self, client, sample_project):
        """Test executing an action that's not available for the node."""
        node = Node(
            id="task-no-schema",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        # Try to execute view-schema (only for DATABASE nodes)
        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-no-schema/actions/view-schema",
            json={"params": {}}
        )

        assert response.status_code == 403
        assert "not available" in response.json()["detail"].lower()

    def test_execute_nonexistent_action(self, client, sample_project):
        """Test executing a non-existent action."""
        node = Node(
            id="task-bad-action",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.post(
            f"/api/projects/{sample_project.id}/nodes/task-bad-action/actions/nonexistent-action",
            json={"params": {}}
        )

        assert response.status_code == 404


class TestActionHistory:
    """Test GET /api/projects/{pid}/nodes/{nid}/actions/history."""

    def test_get_action_history(self, client, sample_project):
        """Test getting action history for a node."""
        node = Node(
            id="task-with-history",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        # Execute several actions
        client.post(
            f"/api/projects/{sample_project.id}/nodes/task-with-history/actions/start-task",
            json={"params": {}}
        )
        client.post(
            f"/api/projects/{sample_project.id}/nodes/task-with-history/actions/update-progress",
            json={"params": {"progress": 50}}
        )

        # Get history
        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/task-with-history/actions/history"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

        # Most recent first
        assert data[0]["action_id"] == "update-progress"
        assert data[1]["action_id"] == "start-task"

    def test_get_action_history_empty(self, client, sample_project):
        """Test getting action history for a node with no history."""
        node = Node(
            id="task-no-history",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IDLE"
        )
        client.db.add(node)
        client.db.commit()

        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/task-no-history/actions/history"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_action_history_with_limit(self, client, sample_project):
        """Test getting action history with limit parameter."""
        node = Node(
            id="task-many-actions",
            project_id=sample_project.id,
            label="Task",
            type="TASK",
            status="IN_PROGRESS"
        )
        client.db.add(node)
        client.db.commit()

        # Execute many actions
        for i in range(10):
            client.post(
                f"/api/projects/{sample_project.id}/nodes/task-many-actions/actions/update-progress",
                json={"params": {"progress": i * 10}}
            )

        # Get with limit
        response = client.get(
            f"/api/projects/{sample_project.id}/nodes/task-many-actions/actions/history?limit=5"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5

"""Tests for Nodes API endpoints."""
import pytest


class TestCreateNode:
    def test_create_node(self, client, sample_project):
        """Test creating a node."""
        payload = {
            "label": "New Task",
            "type": "TASK",
            "status": "IDLE",
            "priority": 3,
            "progress": 0,
            "tags": ["test"],
            "dependencies": [],
            "metadata": {},
        }
        response = client.post(f"/api/projects/{sample_project.id}/nodes", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["label"] == "New Task"
        assert data["type"] == "TASK"
        assert data["project_id"] == sample_project.id

    def test_create_node_with_defaults(self, client, sample_project):
        """Test creating a node with default values."""
        payload = {"label": "Minimal", "type": "FILE", "status": "IDLE"}
        response = client.post(f"/api/projects/{sample_project.id}/nodes", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == 2
        assert data["progress"] == 0


class TestGetNode:
    def test_get_node(self, client, sample_node):
        """Test getting a node by ID."""
        response = client.get(
            f"/api/projects/{sample_node.project_id}/nodes/{sample_node.id}"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_node.id
        assert data["label"] == sample_node.label

    def test_get_nonexistent_node(self, client, sample_project):
        """Test getting a node that doesn't exist."""
        response = client.get(f"/api/projects/{sample_project.id}/nodes/nonexistent")

        assert response.status_code == 404


class TestUpdateNode:
    def test_update_node_status(self, client, sample_node):
        """Test updating a node's status."""
        payload = {"status": "IN_PROGRESS"}
        response = client.patch(
            f"/api/projects/{sample_node.project_id}/nodes/{sample_node.id}",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "IN_PROGRESS"

    def test_update_node_progress(self, client, sample_node):
        """Test updating a node's progress."""
        payload = {"progress": 50}
        response = client.patch(
            f"/api/projects/{sample_node.project_id}/nodes/{sample_node.id}",
            json=payload,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["progress"] == 50


class TestDeleteNode:
    def test_delete_node(self, client, sample_node):
        """Test deleting a node."""
        response = client.delete(
            f"/api/projects/{sample_node.project_id}/nodes/{sample_node.id}"
        )

        assert response.status_code == 204

    def test_delete_nonexistent_node(self, client, sample_project):
        """Test deleting a node that doesn't exist."""
        response = client.delete(f"/api/projects/{sample_project.id}/nodes/nonexistent")

        assert response.status_code == 404
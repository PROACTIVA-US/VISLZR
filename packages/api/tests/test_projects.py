"""Tests for Projects API endpoints."""
import pytest


class TestListProjects:
    def test_list_empty_projects(self, client):
        """Test listing projects when none exist."""
        response = client.get("/api/projects")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_projects(self, client, sample_project):
        """Test listing projects."""
        response = client.get("/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_project.id
        assert data[0]["name"] == sample_project.name


class TestCreateProject:
    def test_create_project(self, client):
        """Test creating a new project."""
        payload = {"name": "New Project", "description": "Test description"}
        response = client.post("/api/projects", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "Test description"
        assert "id" in data
        assert "created_at" in data

    def test_create_project_minimal(self, client):
        """Test creating a project with only required fields."""
        payload = {"name": "Minimal Project"}
        response = client.post("/api/projects", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Project"
        assert data["description"] is None

    def test_create_project_missing_name(self, client):
        """Test creating a project without a name fails."""
        payload = {"description": "No name"}
        response = client.post("/api/projects", json=payload)

        assert response.status_code == 422  # Validation error


class TestGetProject:
    def test_get_project(self, client, sample_project):
        """Test getting a project by ID."""
        response = client.get(f"/api/projects/{sample_project.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_project.id
        assert data["name"] == sample_project.name

    def test_get_nonexistent_project(self, client):
        """Test getting a project that doesn't exist."""
        response = client.get("/api/projects/nonexistent-id")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestUpdateProject:
    def test_update_project_name(self, client, sample_project):
        """Test updating a project's name."""
        payload = {"name": "Updated Name"}
        response = client.patch(f"/api/projects/{sample_project.id}", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["id"] == sample_project.id

    def test_update_project_description(self, client, sample_project):
        """Test updating a project's description."""
        payload = {"description": "New description"}
        response = client.patch(f"/api/projects/{sample_project.id}", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "New description"

    def test_update_project_partial(self, client, sample_project):
        """Test partial update (only some fields)."""
        original_name = sample_project.name
        payload = {"description": "Only description updated"}
        response = client.patch(f"/api/projects/{sample_project.id}", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == original_name  # Unchanged
        assert data["description"] == "Only description updated"

    def test_update_nonexistent_project(self, client):
        """Test updating a project that doesn't exist."""
        payload = {"name": "Won't work"}
        response = client.patch("/api/projects/nonexistent-id", json=payload)

        assert response.status_code == 404


class TestDeleteProject:
    def test_delete_project(self, client, sample_project):
        """Test deleting a project."""
        response = client.delete(f"/api/projects/{sample_project.id}")

        assert response.status_code == 204

        # Verify it's actually deleted
        get_response = client.get(f"/api/projects/{sample_project.id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_project(self, client):
        """Test deleting a project that doesn't exist."""
        response = client.delete("/api/projects/nonexistent-id")

        assert response.status_code == 404
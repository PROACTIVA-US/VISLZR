"""Tests for Graph API endpoint."""
import pytest


class TestGetGraph:
    def test_get_empty_graph(self, client, sample_project):
        """Test getting a graph with no nodes or edges."""
        response = client.get(f"/api/projects/{sample_project.id}/graph")

        assert response.status_code == 200
        data = response.json()
        assert data["nodes"] == []
        assert data["edges"] == []

    def test_get_graph_with_nodes(self, client, sample_graph):
        """Test getting a graph with nodes and edges."""
        project_id = sample_graph["project"].id
        response = client.get(f"/api/projects/{project_id}/graph")

        assert response.status_code == 200
        data = response.json()
        assert len(data["nodes"]) == 3
        assert len(data["edges"]) == 2

    def test_get_graph_structure(self, client, sample_graph):
        """Test that graph response has correct structure."""
        project_id = sample_graph["project"].id
        response = client.get(f"/api/projects/{project_id}/graph")

        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert isinstance(data["nodes"], list)
        assert isinstance(data["edges"], list)

        # Check node structure
        if len(data["nodes"]) > 0:
            node = data["nodes"][0]
            assert "id" in node
            assert "label" in node
            assert "type" in node
            assert "status" in node

        # Check edge structure
        if len(data["edges"]) > 0:
            edge = data["edges"][0]
            assert "id" in edge
            assert "source" in edge
            assert "target" in edge
            assert "type" in edge
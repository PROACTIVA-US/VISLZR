"""Tests for SQLAlchemy database models."""
import pytest
from app.models import Project, Node, Edge, Milestone
from datetime import date


class TestProjectModel:
    def test_create_project(self, test_db):
        """Test creating a project."""
        project = Project(name="Test Project", description="Test Description")
        test_db.add(project)
        test_db.commit()

        assert project.id is not None
        assert project.name == "Test Project"
        assert project.description == "Test Description"
        assert project.created_at is not None

    def test_project_id_is_uuid(self, test_db):
        """Test that project ID is a valid UUID string."""
        project = Project(name="Test")
        test_db.add(project)
        test_db.commit()

        assert isinstance(project.id, str)
        assert len(project.id) == 36  # UUID length with hyphens

    def test_project_without_description(self, test_db):
        """Test creating a project without description."""
        project = Project(name="Minimal Project")
        test_db.add(project)
        test_db.commit()

        assert project.description is None


class TestNodeModel:
    def test_create_node(self, test_db, sample_project):
        """Test creating a node."""
        node = Node(
            project_id=sample_project.id,
            label="Test Node",
            type="TASK",
            status="IDLE",
            priority=2,
            progress=0,
            metadata={"key": "value"},
        )
        test_db.add(node)
        test_db.commit()

        assert node.id is not None
        assert node.label == "Test Node"
        assert node.type == "TASK"
        assert node.status == "IDLE"
        assert node.priority == 2
        assert node.progress == 0
        assert node.metadata == {"key": "value"}

    def test_node_defaults(self, test_db, sample_project):
        """Test node default values."""
        node = Node(
            project_id=sample_project.id, label="Default Node", type="FILE", status="IDLE"
        )
        test_db.add(node)
        test_db.commit()

        assert node.priority == 2
        assert node.progress == 0
        assert node.metadata == {}

    def test_node_with_parent(self, test_db, sample_project):
        """Test creating a node with a parent."""
        parent = Node(
            project_id=sample_project.id, label="Parent", type="FOLDER", status="IDLE"
        )
        test_db.add(parent)
        test_db.commit()

        child = Node(
            project_id=sample_project.id,
            label="Child",
            type="FILE",
            status="IDLE",
            parent_id=parent.id,
        )
        test_db.add(child)
        test_db.commit()

        assert child.parent_id == parent.id


class TestEdgeModel:
    def test_create_edge(self, test_db, sample_project):
        """Test creating an edge."""
        node1 = Node(
            project_id=sample_project.id, label="Node 1", type="TASK", status="IDLE"
        )
        node2 = Node(
            project_id=sample_project.id, label="Node 2", type="TASK", status="IDLE"
        )
        test_db.add_all([node1, node2])
        test_db.commit()

        edge = Edge(
            project_id=sample_project.id,
            source=node1.id,
            target=node2.id,
            type="dependency",
            status="active",
            metadata={"weight": 5},
        )
        test_db.add(edge)
        test_db.commit()

        assert edge.id is not None
        assert edge.source == node1.id
        assert edge.target == node2.id
        assert edge.type == "dependency"
        assert edge.status == "active"
        assert edge.metadata == {"weight": 5}

    def test_edge_defaults(self, test_db, sample_edge):
        """Test edge default values."""
        assert sample_edge["edge"].status == "met"
        assert sample_edge["edge"].metadata == {}


class TestMilestoneModel:
    def test_create_milestone(self, test_db, sample_project):
        """Test creating a milestone."""
        milestone = Milestone(
            project_id=sample_project.id,
            title="V1.0 Release",
            date=date(2025, 12, 31),
            status="planned",
            description="First major release",
            linked_nodes=["node-id-1", "node-id-2"],
        )
        test_db.add(milestone)
        test_db.commit()

        assert milestone.id is not None
        assert milestone.title == "V1.0 Release"
        assert milestone.date == date(2025, 12, 31)
        assert milestone.status == "planned"
        assert milestone.linked_nodes == ["node-id-1", "node-id-2"]

    def test_milestone_defaults(self, test_db, sample_project):
        """Test milestone default values."""
        milestone = Milestone(
            project_id=sample_project.id, title="Minimal", date=date(2025, 1, 1)
        )
        test_db.add(milestone)
        test_db.commit()

        assert milestone.status == "planned"
        assert milestone.description is None
        assert milestone.linked_nodes == []
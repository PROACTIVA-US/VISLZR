import pytest
from app.models import Project, Node, Edge, Milestone
from datetime import date


@pytest.fixture
def sample_project(test_db):
    """Create a sample project for testing."""
    project = Project(name="Test Project", description="A test project")
    test_db.add(project)
    test_db.commit()
    test_db.refresh(project)
    return project


@pytest.fixture
def sample_node(test_db, sample_project):
    """Create a sample node for testing."""
    node = Node(
        project_id=sample_project.id,
        label="Test Node",
        type="TASK",
        status="IDLE",
        priority=2,
        progress=0,
        metadata={},
    )
    test_db.add(node)
    test_db.commit()
    test_db.refresh(node)
    return node


@pytest.fixture
def sample_edge(test_db, sample_project):
    """Create sample nodes and an edge connecting them."""
    node1 = Node(
        project_id=sample_project.id,
        label="Node 1",
        type="TASK",
        status="COMPLETED",
        priority=2,
        progress=100,
        metadata={},
    )
    node2 = Node(
        project_id=sample_project.id,
        label="Node 2",
        type="TASK",
        status="IN_PROGRESS",
        priority=3,
        progress=50,
        metadata={},
    )
    test_db.add_all([node1, node2])
    test_db.commit()
    test_db.refresh(node1)
    test_db.refresh(node2)

    edge = Edge(
        project_id=sample_project.id,
        source=node1.id,
        target=node2.id,
        type="dependency",
        status="met",
        metadata={},
    )
    test_db.add(edge)
    test_db.commit()
    test_db.refresh(edge)

    return {"edge": edge, "node1": node1, "node2": node2}


@pytest.fixture
def sample_graph(test_db, sample_project):
    """Create a complete sample graph with multiple nodes and edges."""
    # Create nodes
    root = Node(
        project_id=sample_project.id,
        label="Root",
        type="ROOT",
        status="IDLE",
        priority=1,
        progress=0,
        metadata={},
    )
    task1 = Node(
        project_id=sample_project.id,
        label="Task 1",
        type="TASK",
        status="COMPLETED",
        priority=2,
        progress=100,
        metadata={},
    )
    task2 = Node(
        project_id=sample_project.id,
        label="Task 2",
        type="TASK",
        status="IN_PROGRESS",
        priority=3,
        progress=50,
        metadata={},
    )
    test_db.add_all([root, task1, task2])
    test_db.commit()
    test_db.refresh(root)
    test_db.refresh(task1)
    test_db.refresh(task2)

    # Create edges
    edge1 = Edge(
        project_id=sample_project.id,
        source=root.id,
        target=task1.id,
        type="parent",
        status="active",
        metadata={},
    )
    edge2 = Edge(
        project_id=sample_project.id,
        source=task1.id,
        target=task2.id,
        type="dependency",
        status="met",
        metadata={},
    )
    test_db.add_all([edge1, edge2])
    test_db.commit()

    return {
        "project": sample_project,
        "nodes": [root, task1, task2],
        "edges": [edge1, edge2],
    }


@pytest.fixture
def sample_milestone(test_db, sample_project):
    """Create a sample milestone for testing."""
    milestone = Milestone(
        project_id=sample_project.id,
        title="Test Milestone",
        date=date(2025, 12, 31),
        status="planned",
        description="A test milestone",
        linked_nodes=[],
    )
    test_db.add(milestone)
    test_db.commit()
    test_db.refresh(milestone)
    return milestone
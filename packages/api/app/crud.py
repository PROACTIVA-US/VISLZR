from sqlmodel import Session, select, delete
from .models import Project, Node, Edge, Milestone
from .schemas import GraphData, ProjectIn

def upsert_project(session: Session, p: ProjectIn):
    proj = session.get(Project, p.id)
    if proj is None:
        proj = Project(id=p.id, name=p.name, description=p.description or None, created_at=p.createdAt, updated_at=p.updatedAt)
        session.add(proj)
    else:
        proj.name = p.name
        proj.description = p.description or None
        proj.updated_at = p.updatedAt
    session.commit()
    return proj

def replace_graph(session: Session, g: GraphData):
    proj = upsert_project(session, g.project)
    # Clear current graph
    session.exec(delete(Node).where(Node.project_id == proj.id))
    session.exec(delete(Edge).where(Edge.project_id == proj.id))
    session.exec(delete(Milestone).where(Milestone.project_id == proj.id))
    session.commit()

    for n in g.nodes:
        session.add(Node(id=n.id, project_id=proj.id, label=n.label, status=n.status, priority=n.priority, progress=n.progress, tags=",".join(n.tags or [])))
    for e in g.edges:
        session.add(Edge(project_id=proj.id, source=e.source, target=e.target, kind=e.kind, weight=e.weight))
    for m in (g.milestones or []):
        session.add(Milestone(id=m.id, project_id=proj.id, title=m.title, date=m.date, status=m.status))

    session.commit()
    return proj

def get_graph(session: Session, project_id: str):
    proj = session.get(Project, project_id)
    if not proj:
        return None, [], [], []
    nodes = session.exec(select(Node).where(Node.project_id == project_id)).all()
    edges = session.exec(select(Edge).where(Edge.project_id == project_id)).all()
    miles = session.exec(select(Milestone).where(Milestone.project_id == project_id)).all()
    return proj, nodes, edges, miles

from .base import Base, get_db, engine

def init_db():
    """Initialize database tables"""
    import app.models  # Import models to register them
    Base.metadata.create_all(bind=engine)

__all__ = ["Base", "get_db", "init_db", "engine"]

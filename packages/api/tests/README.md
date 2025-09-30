# Backend Testing Guide

## Running Tests

### Run all tests
```bash
cd packages/api
pytest
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html --cov-report=term
```

### Run specific test file
```bash
pytest tests/test_projects.py
```

### Run specific test
```bash
pytest tests/test_projects.py::TestCreateProject::test_create_project
```

### Run in watch mode (with pytest-watch)
```bash
pip install pytest-watch
ptw
```

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Root fixtures (test_db, client)
├── fixtures/
│   ├── __init__.py
│   └── data.py              # Data fixtures (sample_project, sample_node, etc.)
├── test_models.py           # SQLAlchemy model tests
├── test_projects.py         # Projects API tests
├── test_nodes.py            # Nodes API tests
├── test_edges.py            # Edges API tests
├── test_graph.py            # Graph API tests
└── test_websocket.py        # WebSocket tests (if implemented)
```

## Writing Tests

### Using Fixtures

```python
def test_example(client, sample_project):
    """Test using fixtures."""
    response = client.get(f"/api/projects/{sample_project.id}")
    assert response.status_code == 200
```

### Available Fixtures

- `test_db` - In-memory SQLite database
- `client` - FastAPI TestClient
- `sample_project` - A test project
- `sample_node` - A test node
- `sample_edge` - Test nodes with an edge
- `sample_graph` - Complete graph (nodes + edges)
- `sample_milestone` - A test milestone

### Test Classes

Group related tests in classes:

```python
class TestCreateProject:
    def test_create_project(self, client):
        # Test code here
        pass

    def test_create_project_minimal(self, client):
        # Test code here
        pass
```

### Async Tests

For async code, use pytest-asyncio:

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result == expected
```

## Coverage Requirements

- **Minimum Coverage**: 70% (enforced in CI/CD)
- **Target Coverage**: >80%

### View HTML Coverage Report

```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html  # macOS
```

### Coverage by Module

```bash
pytest --cov=app --cov-report=term-missing
```

## Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** - `test_create_project_with_invalid_name`
3. **AAA pattern** - Arrange, Act, Assert
4. **Use fixtures** - Don't repeat setup code
5. **Test edge cases** - Empty lists, null values, errors
6. **Test error handling** - 404s, validation errors

## Common Patterns

### Testing API Endpoints

```python
def test_endpoint(client):
    # Arrange
    payload = {"name": "Test"}

    # Act
    response = client.post("/api/endpoint", json=payload)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test"
```

### Testing Database Models

```python
def test_model(test_db):
    # Create
    model = Model(field="value")
    test_db.add(model)
    test_db.commit()

    # Assert
    assert model.id is not None
    assert model.field == "value"
```

### Testing Validation Errors

```python
def test_validation_error(client):
    payload = {}  # Missing required field
    response = client.post("/api/endpoint", json=payload)
    assert response.status_code == 422
```

## Troubleshooting

### Tests fail with database errors
- Check that migrations are up to date
- Ensure `conftest.py` creates/drops tables correctly

### Import errors
- Verify `PYTHONPATH` includes project root
- Check that `__init__.py` files exist

### Slow tests
- Use `pytest --durations=10` to find slow tests
- Consider mocking external dependencies
- Use in-memory database (already configured)

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

See `.github/workflows/test.yml` for CI/CD configuration.
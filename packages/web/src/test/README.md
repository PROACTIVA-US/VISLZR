# Frontend Testing Guide

## Running Tests

### Run all tests
```bash
cd packages/web
npm test
```

### Run with UI
```bash
npm run test:ui
```

### Run with coverage
```bash
npm run test:coverage
```

### Run once (CI mode)
```bash
npm run test:run
```

### Run specific test file
```bash
npm test -- src/api/__tests__/projects.test.ts
```

### Watch mode (default)
```bash
npm test
# Tests will re-run on file changes
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts             # Test setup (jest-dom, cleanup)
│   ├── utils.tsx            # Test utilities (renderWithRouter)
│   ├── mocks.ts             # Mock data and factories
│   └── README.md            # This file
├── api/__tests__/
│   ├── client.test.ts
│   └── projects.test.ts
├── hooks/__tests__/
│   └── useWebSocket.test.ts
├── components/
│   └── Canvas/__tests__/
│       └── Canvas.test.tsx
├── utils/__tests__/
│   └── nodeColors.test.ts
└── pages/__tests__/         # (To be added)
    ├── ProjectList.test.tsx
    └── ProjectCanvas.test.tsx
```

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Router

```typescript
import { render } from '@/test/utils';  // Uses renderWithRouter

render(<ComponentThatUsesRouter />);
```

### Testing with User Interactions

```typescript
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';

it('handles click', async () => {
  const user = userEvent.setup();
  render(<Button />);

  await user.click(screen.getByRole('button'));

  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### Testing API Calls

```typescript
import { vi } from 'vitest';
import { projectsApi } from '../projects';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

it('fetches projects', async () => {
  vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

  const result = await projectsApi.list();

  expect(apiClient.get).toHaveBeenCalledWith('/projects');
  expect(result).toEqual([]);
});
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';

it('updates state', async () => {
  const { result } = renderHook(() => useCustomHook());

  expect(result.current.value).toBe(0);

  act(() => {
    result.current.increment();
  });

  await waitFor(() => {
    expect(result.current.value).toBe(1);
  });
});
```

## Test Utilities

### Mock Factories

```typescript
import { createMockProject, createMockNode } from '@/test/mocks';

const project = createMockProject({ name: 'Custom Name' });
const node = createMockNode({ status: 'COMPLETED' });
```

### Custom Render

```typescript
import { render } from '@/test/utils';

// Automatically wraps with BrowserRouter
render(<Component />);
```

## Coverage Requirements

- **Minimum Coverage**: 70% (enforced in CI/CD)
- **Target Coverage**: >80%

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html  # macOS
```

### Coverage Thresholds

Set in `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  }
}
```

## Mocking

### Mock Modules

```typescript
vi.mock('../module', () => ({
  exportedFunction: vi.fn(),
}));
```

### Mock Timers

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('uses timers', () => {
  vi.advanceTimersByTime(1000);
  // ...
});
```

### Mock WebSocket

```typescript
import { MockWebSocket } from '@/test/mocks';

global.WebSocket = MockWebSocket as any;
```

## Best Practices

1. **Test behavior, not implementation**
2. **Use data-testid sparingly** - prefer accessible queries
3. **Avoid testing library internals** (D3.js internals, etc.)
4. **Mock external dependencies**
5. **Keep tests isolated** - no shared state
6. **Test edge cases** - loading, error, empty states

## Query Priority (React Testing Library)

1. `getByRole` - Best for accessibility
2. `getByLabelText` - Forms
3. `getByPlaceholderText` - Forms
4. `getByText` - Non-interactive elements
5. `getByDisplayValue` - Form values
6. `getByAltText` - Images
7. `getByTitle` - Title attribute
8. `getByTestId` - Last resort

## Common Patterns

### Testing Loading States

```typescript
it('shows loading state', () => {
  render(<Component loading={true} />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('shows error', () => {
  render(<Component error="Failed to load" />);
  expect(screen.getByText('Failed to load')).toBeInTheDocument();
});
```

### Testing Forms

```typescript
it('submits form', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<Form onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Name'), 'Test Name');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(onSubmit).toHaveBeenCalledWith({ name: 'Test Name' });
});
```

### Testing Async Data Fetching

```typescript
it('loads data', async () => {
  render(<DataComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Tests timeout
- Increase timeout: `{ timeout: 10000 }`
- Check for unresolved promises
- Verify async operations complete

### "Not wrapped in act(...)" warning
- Use `await` with async operations
- Use `waitFor` for state updates
- Import `act` from `@testing-library/react`

### Module not found
- Check path aliases in `vitest.config.ts`
- Verify imports match file structure

### D3/Canvas tests failing
- Mock D3.js (complex visualization testing)
- Test props and callbacks, not rendering

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

See `.github/workflows/test.yml` for CI/CD configuration.

## Additional Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom matchers](https://github.com/testing-library/jest-dom)
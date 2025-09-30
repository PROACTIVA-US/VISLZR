# Vislzr Web

React + TypeScript + D3.js frontend for Vislzr project visualization platform.

## Features

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast development
- **D3.js** - Force-directed graph visualization
- **TailwindCSS 4** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **WebSocket** - Real-time updates

## Setup

### 1. Install Dependencies

```bash
cd packages/web
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if backend URL is different
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── client.ts     # Axios instance
│   └── projects.ts   # Projects API
├── components/       # React components
│   └── Canvas/       # D3.js Canvas component
├── hooks/            # Custom React hooks
│   └── useWebSocket.ts
├── pages/            # Page components
│   ├── ProjectList.tsx
│   └── ProjectCanvas.tsx
├── types/            # TypeScript types
│   ├── graph.ts      # Node/Edge types
│   ├── project.ts    # Project types
│   └── websocket.ts  # WebSocket message types
├── utils/            # Utility functions
│   └── nodeColors.ts # Node color mappings
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles (Tailwind)
```

## Architecture

### Canvas Component (D3.js)

The Canvas component uses D3.js force simulation for graph layout:

- **Force-directed layout** - Nodes repel, edges attract
- **Zoom & Pan** - Interactive navigation
- **Drag nodes** - Reposition manually
- **Visual encoding** - Color by status, size by priority
- **Status indicators** - Small circles show current state

### Color System (Per PRD)

Node colors indicate status:
- 🔴 **Red** - ERROR, OVERDUE, BLOCKED
- 🟡 **Yellow** - AT_RISK
- 🔵 **Blue** - IN_PROGRESS
- 🟢 **Green** - COMPLETED, RUNNING
- 🟣 **Indigo** - IDLE, STOPPED
- ⚪ **Gray** - PLANNED

### WebSocket Hook

Real-time updates via WebSocket:
- Auto-reconnect with exponential backoff
- Max 5 reconnection attempts
- Project-scoped connections
- Message type handling

### API Client

Axios-based client with:
- Request/response interceptors
- Error handling
- TypeScript types
- Environment-based URL

## Integration with Backend

The frontend expects the backend API at:
- **REST API**: http://localhost:8000/api
- **WebSocket**: ws://localhost:8000/ws

Configure via `.env` file:
```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

## TypeScript Configuration

### Path Aliases

```typescript
import { Canvas } from '@/components/Canvas';
import { useWebSocket } from '@/hooks';
import { projectsApi } from '@/api';
import type { NodeData } from '@/types';
```

### Strict Mode

TypeScript strict mode enabled:
- No implicit any
- Strict null checks
- No unused locals/parameters
- No fallthrough cases

## Styling with TailwindCSS

Custom color palette for nodes:
```css
colors: {
  'node-error': '#EF4444',
  'node-warning': '#F59E0B',
  'node-active': '#3B82F6',
  'node-success': '#10B981',
  'node-idle': '#6366F1',
  'node-neutral': '#6B7280',
  'node-root': '#14B8A6',
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance

- **Vite HMR**: Instant hot module replacement
- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Remove unused code
- **Optimized D3**: Efficient force simulation

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use different port
npm run dev -- --port 5174
```

### Backend Connection Failed
1. Check backend is running: http://localhost:8000/health
2. Verify CORS settings in backend
3. Check `.env` file has correct URLs

### D3.js Nodes Not Rendering
1. Check browser console for errors
2. Verify graph data structure matches types
3. Check SVG container has dimensions

## Next Steps

See `docs/PHASE-0-PLAN.md` for:
- Testing setup (Vitest)
- State management (if needed beyond local state)
- Advanced D3 features (dependency focus, multi-view)
- Sibling nodes system (Phase 2)
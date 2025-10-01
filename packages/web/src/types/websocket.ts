import type { NodeData, EdgeData } from '@vislzr/shared';

export type WebSocketMessage =
  | { type: 'node_updated'; data: NodeData }
  | { type: 'edge_created'; data: EdgeData }
  | { type: 'edge_deleted'; data: { id: string } }
  | { type: 'graph_changed'; data: unknown }
  | { type: 'scan_complete'; data: unknown }
  | { type: 'echo'; data: string };
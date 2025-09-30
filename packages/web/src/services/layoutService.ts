/**
 * Helpers for persisting/restoring node coordinates so layout feels stable.
 */
import type { GraphData } from "./schema";
import { storage } from "./storageService";

const KEY = "vislzr:layout:";

export function saveLayout(g: GraphData, coords: Record<string, { x: number; y: number }>) {
  storage.set(KEY + g.project.id, coords);
}

export function loadLayout(g: GraphData): Record<string, { x: number; y: number }> {
  return storage.get(KEY + g.project.id, {} as Record<string, { x: number; y: number }>);
}

export function applyLayout(g: GraphData, coords: Record<string, { x: number; y: number }>) {
  // This function doesn't mutate graph; it just returns a convenience view
  return g.nodes.map(n => ({
    id: n.id,
    x: coords[n.id]?.x ?? 0,
    y: coords[n.id]?.y ?? 0,
  }));
}

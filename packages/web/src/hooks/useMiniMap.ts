import { useMemo } from "react";
import type { GraphData } from "@/types/graph";
export function useMiniMap(graph: GraphData | null, layout: { width: number; height: number; }, scale = 0.15) {
  return useMemo(() => {
    if (!graph) return { nodes: [], edges: [], scale, viewBox: `0 0 ${layout.width} ${layout.height}` };
    return { nodes: graph.nodes, edges: graph.edges, scale, viewBox: `0 0 ${layout.width} ${layout.height}` };
  }, [graph, layout.width, layout.height, scale]);
}

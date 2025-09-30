import { useMemo } from "react";
import type { GraphData } from "@/types/graph";
export function useTimeline(graph: GraphData | null) {
  return useMemo(() => {
    const ms = (graph?.milestones ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
    const past = ms.filter(m => m.status === "done");
    const pending = ms.filter(m => m.status !== "done");
    return { milestones: ms, past, pending };
  }, [graph]);
}

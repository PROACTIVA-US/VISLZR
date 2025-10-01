import { useEffect, useState } from "react";
import type { GraphData } from "@vislzr/shared";

/**
 * Robust loader:
 * - mode "bundle": try dynamic import, fallback to fetch("/data/mockProject.json")
 * - mode "public": always fetch("/data/mockProject.json")
 */
export function useGraphData(mode: "bundle" | "public" = "bundle") {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        let data: GraphData | null = null;

        if (mode === "bundle") {
          try {
            const mod = await import("@/data/mockProject.json");
            data = (mod as any).default as GraphData;
          } catch {
            // fall through to fetch
          }
        }
        if (!data) {
          const res = await fetch("/data/mockProject.json", { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = (await res.json()) as GraphData;
        }
        if (!cancelled) setGraph(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load graph");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mode]);

  return { graph, error, loading, reload: () => {} } as const;
}

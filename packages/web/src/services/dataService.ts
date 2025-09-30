import { isGraphData, GraphData } from "./schema";

export async function loadGraphFromPublic(path = "/data/mockProject.json"): Promise<GraphData> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  if (!isGraphData(j)) throw new Error("Invalid graph schema");
  return j as GraphData;
}

export async function loadGraphFromBundle(): Promise<GraphData> {
  const mod = await import("@/data/mockProject.json");
  const j = (mod as any).default;
  if (!isGraphData(j)) throw new Error("Invalid graph schema (bundle)");
  return j as GraphData;
}

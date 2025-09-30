const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type NodeData = { id: string; label: string; status?: string; priority?: number; progress?: number; tags?: string[] };
export type EdgeData = { source: string; target: string; kind?: "depends"|"relates"|"subtask"; weight?: number };

export async function getGraph(projectId: string) {
  const r = await fetch(`${BASE}/projects/${projectId}/graph`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET graph ${r.status}`);
  return r.json();
}

export async function putGraph(graph: any) {
  const r = await fetch(`${BASE}/projects/${graph.project.id}/graph`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(graph),
  });
  if (!r.ok) throw new Error(`PUT graph ${r.status}`);
  return r.json();
}

export async function addNode(projectId: string, node: NodeData) {
  const r = await fetch(`${BASE}/projects/${projectId}/nodes`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(node)
  });
  if (!r.ok) throw new Error(`POST node ${r.status}`);
  return r.json();
}

export async function addEdge(projectId: string, edge: EdgeData) {
  const r = await fetch(`${BASE}/projects/${projectId}/edges`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edge)
  });
  if (!r.ok) throw new Error(`POST edge ${r.status}`);
  return r.json();
}

export async function patchNode(projectId: string, nodeId: string, patch: Partial<NodeData>) {
  const r = await fetch(`${BASE}/projects/${projectId}/nodes/${nodeId}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch)
  });
  if (!r.ok) throw new Error(`PATCH node ${r.status}`);
  return r.json();
}

export async function deleteNode(projectId: string, nodeId: string) {
  const r = await fetch(`${BASE}/projects/${projectId}/nodes/${nodeId}`, {
    method: "DELETE"
  });
  if (!r.ok) throw new Error(`DELETE node ${r.status}`);
  return r.json();
}

export async function deleteEdge(projectId: string, source: string, target: string) {
  const r = await fetch(`${BASE}/projects/${projectId}/edges/${source}/${target}`, {
    method: "DELETE"
  });
  if (!r.ok) throw new Error(`DELETE edge ${r.status}`);
  return r.json();
}

export async function addMilestone(projectId: string, milestone: any) {
  const r = await fetch(`${BASE}/projects/${projectId}/milestones`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(milestone)
  });
  if (!r.ok) throw new Error(`POST milestone ${r.status}`);
  return r.json();
}

export async function patchMilestone(projectId: string, milestoneId: string, patch: any) {
  const r = await fetch(`${BASE}/projects/${projectId}/milestones/${milestoneId}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch)
  });
  if (!r.ok) throw new Error(`PATCH milestone ${r.status}`);
  return r.json();
}

export async function deleteMilestone(projectId: string, milestoneId: string) {
  const r = await fetch(`${BASE}/projects/${projectId}/milestones/${milestoneId}`, {
    method: "DELETE"
  });
  if (!r.ok) throw new Error(`DELETE milestone ${r.status}`);
  return r.json();
}

export async function generateGraphFromPrompt(projectId: string, prompt: string) {
  const r = await fetch(`${BASE}/projects/${projectId}/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!r.ok) throw new Error(`AI generate ${r.status}`);
  return r.json();
}

export function ws(projectId: string): WebSocket {
  const url = (BASE.replace("http", "ws")) + `/ws?project_id=${encodeURIComponent(projectId)}`;
  return new WebSocket(url);
}

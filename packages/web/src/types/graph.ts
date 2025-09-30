export type NodeID = string;
export interface NodeData { id: NodeID; label: string; status?: "ok"|"blocked"|"overdue"|"focus"; priority?: number; progress?: number; tags?: string[]; }
export interface EdgeData { source: NodeID; target: NodeID; kind?: "depends"|"relates"|"subtask"; weight?: number; }
export interface Milestone { id: string; title: string; date: string; status: "planned"|"pending"|"done"; }
export interface ProjectInfo { id: string; name: string; createdAt: string; updatedAt: string; description?: string; }
export interface GraphData { project: ProjectInfo; nodes: NodeData[]; edges: EdgeData[]; milestones?: Milestone[]; history?: Array<Record<string, unknown>>; }

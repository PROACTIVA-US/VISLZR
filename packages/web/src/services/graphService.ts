import type { GraphData, NodeData, EdgeData } from "./schema";
import { isValidGraphData } from "./schema";

export const graphOps = {
  addNode(g: GraphData, node: NodeData) {
    if (g.nodes.find(n => n.id === node.id)) throw new Error("Node id exists");
    g.nodes.push(node);
  },
  removeNode(g: GraphData, nodeId: string) {
    g.nodes = g.nodes.filter(n => n.id !== nodeId);
    g.edges = g.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
  },
  addEdge(g: GraphData, edge: EdgeData) {
    if (g.edges.find(e => e.source === edge.source && e.target === edge.target)) return;
    g.edges.push(edge);
  },
  removeEdge(g: GraphData, s: string, t: string) {
    g.edges = g.edges.filter(e => !(e.source === s && e.target === t));
  },
  setNodeStatus(g: GraphData, id: string, status: NodeData["status"]) {
    const n = g.nodes.find(n => n.id === id);
    if (n) n.status = status;
  },
  setNodeProgress(g: GraphData, id: string, progress: number) {
    const n = g.nodes.find(n => n.id === id);
    if (n) n.progress = Math.max(0, Math.min(1, progress));
  },
  
  exportToJSON(g: GraphData): string {
    return JSON.stringify(g, null, 2);
  },
  
  importFromJSON(jsonString: string): GraphData {
    try {
      const data = JSON.parse(jsonString);
      if (!isValidGraphData(data)) {
        throw new Error("Invalid graph data structure");
      }
      return data;
    } catch (e) {
      throw new Error(`Failed to import JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  },
  
  downloadAsJSON(g: GraphData, filename: string = "graph-export.json") {
    const json = this.exportToJSON(g);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

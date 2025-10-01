import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphData } from "@vislzr/shared";
export interface LayoutNode extends d3.SimulationNodeDatum { id: string; x: number; y: number; fx?: number | null; fy?: number | null; }
export interface LayoutLink extends d3.SimulationLinkDatum<LayoutNode> { source: string | LayoutNode; target: string | LayoutNode; weight?: number; }
export function useGraphLayout(data: GraphData | null, opts?: { width?: number; height?: number; charge?: number; linkDistance?: number; }) {
  const { width = 1200, height = 800, charge = -300, linkDistance = 120 } = opts || {};
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const [links, setLinks] = useState<LayoutLink[]>([]);
  const simRef = useRef<d3.Simulation<LayoutNode, LayoutLink> | null>(null);
  const initial = useMemo(() => {
    if (!data) return { n: [], l: [] };
    const n = data.nodes.map((n, i) => ({
      id: n.id,
      x: (Math.cos(i) * 0.4 + 0.5) * width,
      y: (Math.sin(i) * 0.4 + 0.5) * height,
    })) as LayoutNode[];
    const l = data.edges.map(e => ({ source: e.source, target: e.target, weight: e.weight ?? 1 })) as LayoutLink[];
    return { n, l };
  }, [data, width, height]);
  useEffect(() => {
    if (!data) return;
    const sim = d3.forceSimulation<LayoutNode>(initial.n)
      .force("charge", d3.forceManyBody().strength(charge))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink<LayoutNode, LayoutLink>(initial.l).id((d:any) => d.id).distance(linkDistance).strength((l:any) => Math.min(1, (l.weight ?? 1) * 0.7)))
      .force("collision", d3.forceCollide(40));
    sim.on("tick", () => {
      setNodes([...sim.nodes()]);
      setLinks((sim.force("link") as d3.ForceLink<LayoutNode, LayoutLink>).links());
    });
    simRef.current = sim as any;
    return () => { sim.stop(); };
  }, [data, initial.n, initial.l, width, height, charge, linkDistance]);
  return { nodes, links, simulation: simRef.current };
}

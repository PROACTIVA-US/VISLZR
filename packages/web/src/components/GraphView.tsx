import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { getGraph, ws, addNode, addEdge, patchNode, deleteNode, putGraph } from "../services/apiClient";
import { SiblingNodes } from "./Canvas/SiblingNodes";
import { NodeDetailsPanel, DependencyPanel, TimelineOverlay } from "./Panels";
import { actionRegistry } from "../lib/ActionRegistry";
import { ContextDetector } from "../lib/ContextDetector";
import { initializeActions } from "../lib/initializeActions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import type { NodeData, EdgeData, GraphData, SiblingAction } from "@vislzr/shared";

interface GraphViewProps {
  projectId: string;
  onNodeSelect?: (node: NodeData | null) => void;
  onGraphLoad?: (graph: GraphData) => void;
  importedGraph?: GraphData | null;
}

export function GraphView({ projectId, onNodeSelect, onGraphLoad, importedGraph }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: NodeData } | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [siblingActions, setSiblingActions] = useState<SiblingAction[]>([]);
  const simulationRef = useRef<d3.Simulation<NodeData, EdgeData> | null>(null);

  // Phase 2.2: Panel and overlay state
  const [dependencyPanelOpen, setDependencyPanelOpen] = useState(false);
  const [detailsPanelNode, setDetailsPanelNode] = useState<NodeData | null>(null);
  const [timelineOverlayOpen, setTimelineOverlayOpen] = useState(false);

  // Initialize default actions on mount
  useEffect(() => {
    initializeActions();
  }, []);

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGraph(projectId);
      setGraph(data);
      onGraphLoad?.(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load graph");
    } finally {
      setLoading(false);
    }
  }, [projectId, onGraphLoad]);

  useEffect(() => {
    if (importedGraph) {
      putGraph(importedGraph).then(() => {
        loadGraph();
      }).catch((e) => {
        console.error("Failed to import graph:", e);
        setError("Failed to import graph");
      });
    } else {
      loadGraph();
    }
  }, [importedGraph]);

  useEffect(() => {
    loadGraph();
    const sock = ws(projectId);
    sock.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.event === "graph_changed") {
          loadGraph();
        }
      } catch {}
    };
    return () => sock.close();
  }, [projectId, loadGraph]);

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<NodeData>(graph.nodes)
      .force("link", d3.forceLink<NodeData, EdgeData>(graph.edges)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    const link = g.append("g")
      .selectAll("line")
      .data(graph.edges)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: EdgeData) => Math.sqrt(d.weight || 1));

    const node = g.append("g")
      .selectAll<SVGGElement, NodeData>("g")
      .data(graph.nodes)
      .join("g")
      .call(d3.drag<SVGGElement, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", (d: NodeData) => {
        // Dynamic size based on priority
        const priority = d.priority || 2;
        if (priority === 1) return 15;
        if (priority === 2) return 20;
        if (priority === 3) return 25;
        if (priority === 4) return 30;
        return 20;
      })
      .attr("fill", (d: NodeData) => {
        if (d.status === "IN_PROGRESS") return "#ef4444";
        if (d.status === "OVERDUE") return "#f59e0b";
        if (d.status === "BLOCKED") return "#6b7280";
        return "#3b82f6";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    if (graph.nodes.some(n => n.progress !== undefined)) {
      node.append("circle")
        .attr("r", 18)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", (d: NodeData) => {
          const circumference = 2 * Math.PI * 18;
          const progress = d.progress || 0;
          return `${circumference * progress} ${circumference * (1 - progress)}`;
        })
        .attr("transform", "rotate(-90)");
    }

    node.append("text")
      .text((d: NodeData) => d.label)
      .attr("x", 0)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#fff");

    node.on("click", (event: MouseEvent, d: NodeData) => {
      event.stopPropagation();
      setSelectedNode(d);
      onNodeSelect?.(d);

      // Build context and get filtered actions for this node
      if (graph) {
        const context = ContextDetector.buildContext(d, graph);
        const actions = actionRegistry.getActionsForContext(d, context);
        setSiblingActions(actions);
      }
    });

    node.on("contextmenu", (event: MouseEvent, d: NodeData) => {
      event.preventDefault();
      setContextMenu({ x: event.pageX, y: event.pageY, node: d });
    });

    svg.on("click", () => {
      setSelectedNode(null);
      onNodeSelect?.(null);
      setContextMenu(null);
      setSiblingActions([]); // Clear sibling actions when clicking canvas
    });

    svg.on("contextmenu", (event: MouseEvent) => {
      event.preventDefault();
      // const point = d3.pointer(event, g.node()); // Reserved for future use
      setContextMenu({ x: event.pageX, y: event.pageY });
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graph, onNodeSelect]);

  const handleAddNode = async () => {
    const id = `node-${Date.now()}`;
    const label = prompt("Enter node label:");
    if (!label) return;

    try {
      await addNode(projectId, { id, label, status: "IDLE", priority: 3 });
      setContextMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddChildNode = async (parentId: string) => {
    const id = `node-${Date.now()}`;
    const label = prompt("Enter child node label:");
    if (!label) return;

    try {
      await addNode(projectId, { id, label, status: "IDLE", priority: 3 });
      await addEdge(projectId, { source: parentId, target: id, kind: "subtask" });
      setContextMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm("Delete this node and all its connections?")) return;
    try {
      await deleteNode(projectId, nodeId);
      setContextMenu(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 2.2: View action handlers
  const handleViewDependencies = useCallback(() => {
    if (!selectedNode) return;
    setDependencyPanelOpen(true);
    // Don't clear selection - keep node selected while panel open
  }, [selectedNode]);

  const handleViewDetails = useCallback(() => {
    if (!selectedNode) return;
    setDetailsPanelNode(selectedNode);
    // Don't clear selection - keep node selected while panel open
  }, [selectedNode]);

  const handleViewTimeline = useCallback(() => {
    setTimelineOverlayOpen(true);
    // Timeline doesn't require node selection
  }, []);

  const handleCloseDependencyPanel = useCallback(() => {
    setDependencyPanelOpen(false);
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setDetailsPanelNode(null);
  }, []);

  const handleCloseTimelineOverlay = useCallback(() => {
    setTimelineOverlayOpen(false);
  }, []);

  // Close all panels and overlays
  const handleCloseAll = useCallback(() => {
    setDependencyPanelOpen(false);
    setDetailsPanelNode(null);
    setTimelineOverlayOpen(false);
    setSiblingActions([]);
    setSelectedNode(null);
  }, []);

  const handleSiblingActionClick = useCallback((action: SiblingAction) => {
    if (!selectedNode) return;

    console.log(`Sibling action clicked: ${action.id} on node ${selectedNode.id}`);

    // Route to appropriate handler based on action ID
    switch (action.id) {
      case 'add-child':
        handleAddChildNode(selectedNode.id);
        break;

      case 'mark-complete':
        patchNode(projectId, selectedNode.id, { status: 'COMPLETED' }).catch(console.error);
        break;

      case 'start-task':
        patchNode(projectId, selectedNode.id, { status: 'IN_PROGRESS' }).catch(console.error);
        break;

      case 'pause-resume':
        const newStatus = selectedNode.status === 'IN_PROGRESS' ? 'IDLE' : 'IN_PROGRESS';
        patchNode(projectId, selectedNode.id, { status: newStatus }).catch(console.error);
        break;

      case 'view-dependencies':
        handleViewDependencies();
        return; // Don't clear selection for view actions

      case 'view-details':
        handleViewDetails();
        return; // Don't clear selection for view actions

      case 'view-timeline':
        handleViewTimeline();
        return; // Don't clear selection for view actions

      default:
        console.log(`Action ${action.id} handler not implemented yet`);
    }

    // Clear selection and siblings after action (for non-view actions)
    setSiblingActions([]);
    setSelectedNode(null);
  }, [selectedNode, projectId, handleViewDependencies, handleViewDetails, handleViewTimeline]);

  // Phase 2.2: Keyboard shortcuts (defined after all handlers)
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Escape',
        handler: handleCloseAll,
        description: 'Close all panels and overlays',
      },
      {
        key: 'd',
        handler: handleViewDependencies,
        description: 'View dependencies (when node selected)',
      },
      {
        key: 'i',
        handler: handleViewDetails,
        description: 'View node details (when node selected)',
      },
      {
        key: 't',
        handler: handleViewTimeline,
        description: 'View timeline',
      },
      {
        key: ' ',
        handler: () => {
          if (selectedNode) {
            patchNode(projectId, selectedNode.id, { status: 'COMPLETED' }).catch(console.error);
          }
        },
        description: 'Mark selected node as complete',
      },
    ],
    enabled: true,
    excludeInputs: true,
  });

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-400">Error: {error}</div>;
  if (!graph) return <div className="flex items-center justify-center h-full text-gray-400">No graph data</div>;

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Sibling Nodes Component */}
      {selectedNode && graph && (
        <SiblingNodes
          selectedNode={selectedNode}
          actions={siblingActions}
          graphNodes={graph.nodes.map(n => ({
            id: n.id,
            x: n.x || 0,
            y: n.y || 0,
            radius: 20,
          }))}
          svgRef={svgRef}
          onActionClick={handleSiblingActionClick}
        />
      )}

      {/* Phase 2.2: Dependency Panel */}
      {dependencyPanelOpen && selectedNode && graph && (
        <DependencyPanel
          node={selectedNode}
          graph={graph}
          onClose={handleCloseDependencyPanel}
          onZoomToFit={() => {}}
        />
      )}

      {/* Phase 2.2: Node Details Panel */}
      {detailsPanelNode && (
        <NodeDetailsPanel
          projectId={projectId}
          node={detailsPanelNode}
          onClose={handleCloseDetailsPanel}
          onUpdate={(id, updates) => patchNode(projectId, id, updates)}
        />
      )}

      {/* Phase 2.2: Timeline Overlay */}
      {timelineOverlayOpen && graph && (
        <TimelineOverlay
          selectedNode={selectedNode}
          allNodes={graph.nodes}
          onNodeSelect={(node) => {
            setSelectedNode(node);
            onNodeSelect?.(node);
          }}
          onClose={handleCloseTimelineOverlay}
        />
      )}

      {contextMenu && (
        <div
          className="absolute bg-gray-800 border border-gray-700 rounded shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.node ? (
            <>
              <button
                onClick={() => handleAddChildNode(contextMenu.node!.id)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                Add Child Node
              </button>
              <button
                onClick={() => handleDeleteNode(contextMenu.node!.id)}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                Delete Node
              </button>
            </>
          ) : (
            <button
              onClick={handleAddNode}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Add Node Here
            </button>
          )}
          <button
            onClick={() => setContextMenu(null)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
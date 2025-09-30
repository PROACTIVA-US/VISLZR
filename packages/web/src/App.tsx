import { useState } from "react";
import { GraphView } from "./components/GraphView";
import { SidePanel } from "./components/SidePanel";
import { ImportExport } from "./components/ImportExport";
import { DocsViewer } from "./components/DocsViewer";
import { Timeline } from "./components/Timeline";
import { AIPrompt } from "./components/AIPrompt";
import { putGraph } from "./services/apiClient";
import "./App.css";

type NodeData = {
  id: string;
  label: string;
  status?: string;
  priority?: number;
  progress?: number;
  tags?: string[];
};

type GraphData = {
  project: { id: string; name: string };
  nodes: NodeData[];
  edges: any[];
};

export default function App() {
  const projectId = "vislzr-demo";
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [currentGraph, setCurrentGraph] = useState<GraphData | null>(null);
  const [importedGraph, setImportedGraph] = useState<GraphData | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const handleImport = (data: GraphData) => {
    const graphWithProject = {
      ...data,
      project: { id: projectId, name: "VISLZR Demo" }
    };
    setImportedGraph(graphWithProject);
  };

  const handleAIGenerated = async (generatedGraph: GraphData) => {
    try {
      // Merge the generated graph with the current graph
      if (currentGraph) {
        const mergedGraph = {
          ...currentGraph,
          nodes: [...currentGraph.nodes, ...generatedGraph.nodes],
          edges: [...currentGraph.edges, ...generatedGraph.edges]
        };
        await putGraph(mergedGraph);
      } else {
        // If no current graph, use generated as is
        const graphWithProject = {
          ...generatedGraph,
          project: { id: projectId, name: "VISLZR Demo" }
        };
        await putGraph(graphWithProject);
      }
    } catch (e) {
      console.error("Failed to apply AI generated graph:", e);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">VISLZR</h1>
            <span className="text-sm text-gray-400">Mind Map + Timeline Visualization</span>
          </div>
          <div className="flex items-center gap-4">
            <AIPrompt 
              projectId={projectId}
              onGraphGenerated={handleAIGenerated}
            />
            <button
              onClick={() => setShowDocs(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
              title="View documentation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs
            </button>
            {currentGraph && (
              <ImportExport 
                graphData={currentGraph}
                onImport={handleImport}
                projectId={projectId}
              />
            )}
            <span className="text-xs text-gray-500">Project: {projectId}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 relative">
          <GraphView 
            projectId={projectId} 
            onNodeSelect={setSelectedNode}
            onGraphLoad={setCurrentGraph}
            importedGraph={importedGraph}
          />
        </div>
        
        <Timeline 
          projectId={projectId}
          onMilestoneSelect={(milestone) => {
            console.log("Selected milestone:", milestone);
          }}
        />
        
        <SidePanel
          projectId={projectId}
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />

        <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 rounded-lg p-3 border border-gray-800">
          <div className="text-xs text-gray-400 space-y-1">
            <div>🖱️ Click: Select node</div>
            <div>🖱️ Right-click: Context menu</div>
            <div>🖱️ Drag: Move nodes</div>
            <div>🔍 Scroll: Zoom in/out</div>
          </div>
        </div>
      </main>
      
      <DocsViewer 
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
      />
    </div>
  );
}
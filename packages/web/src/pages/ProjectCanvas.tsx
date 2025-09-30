import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@/components/Canvas';
import { useWebSocket } from '@/hooks';
import { projectsApi } from '@/api';
import type { GraphData, NodeData, Project } from '@/types';

export const ProjectCanvas = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useWebSocket(projectId || null, (message) => {
    console.log('WebSocket message:', message);
    // Handle real-time updates
    if (message.type === 'node_updated' || message.type === 'graph_changed') {
      loadGraph();
    }
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadGraph();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    try {
      const data = await projectsApi.get(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project');
    }
  };

  const loadGraph = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await projectsApi.getGraph(projectId);
      setGraphData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load graph:', err);
      setError('Failed to load graph');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);
  };

  const createSampleNode = async () => {
    if (!projectId) return;
    const label = prompt('Node label:');
    if (!label) return;

    try {
      await projectsApi.createNode(projectId, {
        label,
        type: 'TASK',
        status: 'IDLE',
        priority: 2,
        progress: 0,
        tags: [],
        dependencies: [],
        metadata: {},
      });
      loadGraph();
    } catch (err) {
      console.error('Failed to create node:', err);
      alert('Failed to create node');
    }
  };

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-node-error text-xl mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-node-active hover:bg-blue-600 px-4 py-2 rounded"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">{project?.name || 'Loading...'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={createSampleNode}
            className="bg-node-active hover:bg-blue-600 px-4 py-2 rounded transition-colors"
          >
            + Add Node
          </button>
          <span className={`text-sm ${isConnected ? 'text-node-success' : 'text-node-error'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">Loading graph...</div>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
            <p className="text-xl mb-4">No nodes in this project yet</p>
            <button
              onClick={createSampleNode}
              className="bg-node-active hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold"
            >
              Create First Node
            </button>
          </div>
        ) : (
          <Canvas
            nodes={graphData.nodes}
            edges={graphData.edges}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </div>

      {/* Selected Node Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-16 w-80 bg-gray-800 text-white p-6 shadow-lg border-l border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold">{selectedNode.label}</h2>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Type:</span>
              <p className="font-semibold">{selectedNode.type}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Status:</span>
              <p className="font-semibold">{selectedNode.status}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Progress:</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-node-active h-2 rounded-full transition-all"
                    style={{ width: `${selectedNode.progress}%` }}
                  />
                </div>
                <span className="text-sm">{selectedNode.progress}%</span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Priority:</span>
              <p className="font-semibold">{selectedNode.priority}</p>
            </div>
            {selectedNode.tags.length > 0 && (
              <div>
                <span className="text-gray-400 text-sm">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNode.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
import { useState } from "react";
import { generateGraphFromPrompt } from "@/services/apiClient";
import type { GraphData } from "@/services/schema";

interface AIPromptProps {
  projectId: string;
  onGraphGenerated: (graph: GraphData) => void;
}

export function AIPrompt({ projectId, onGraphGenerated }: AIPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGraph, setGeneratedGraph] = useState<GraphData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await generateGraphFromPrompt(projectId, prompt);
      setGeneratedGraph(result);
      setShowPreview(true);
    } catch (e) {
      console.error("Failed to generate graph:", e);
      setError("Failed to generate graph from prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedGraph) {
      onGraphGenerated(generatedGraph);
      setIsOpen(false);
      setPrompt("");
      setGeneratedGraph(null);
      setShowPreview(false);
    }
  };

  const handleReject = () => {
    setGeneratedGraph(null);
    setShowPreview(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-md transition-all flex items-center gap-1.5 shadow-lg"
        title="Generate graph from AI prompt"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Generate
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Graph Generator
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showPreview ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe the graph you want to create
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a project plan for building a web application with frontend, backend, database, and deployment phases..."
                className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Graph
                  </>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Be specific about nodes, relationships, and structure you want in your graph.
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Generated Graph Preview</h3>
              <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Nodes:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {generatedGraph?.nodes.map(node => (
                        <span key={node.id} className="px-2 py-1 bg-blue-600 bg-opacity-20 border border-blue-600 rounded text-xs text-blue-300">
                          {node.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Edges:</span>
                    <div className="mt-1 text-xs text-gray-400">
                      {generatedGraph?.edges.length} connections
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded text-blue-300 text-sm">
              Review the generated graph structure. You can apply it to add to your current graph or reject to try again.
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply to Graph
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject & Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
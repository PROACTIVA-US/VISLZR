import { useState, useEffect } from "react";
import { fetchDocsManifest, fetchDocContent, type DocItem, type Manifest } from "@/services/docsService";

interface DocsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsViewer({ isOpen, onClose }: DocsViewerProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !manifest) {
      fetchDocsManifest()
        .then(setManifest)
        .catch((e) => {
          console.error("Failed to load docs manifest:", e);
          setError("Failed to load documentation");
        });
    }
  }, [isOpen, manifest]);

  useEffect(() => {
    if (selectedDoc) {
      setLoading(true);
      setError(null);
      fetchDocContent(selectedDoc.filename)
        .then(setContent)
        .catch((e) => {
          console.error("Failed to load doc content:", e);
          setError("Failed to load document");
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDoc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Documentation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Available Docs</h3>
              {error && !manifest && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              {manifest?.docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedDoc?.id === doc.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {doc.title}
                </button>
              ))}
              {!manifest?.docs.length && !error && (
                <div className="text-gray-500 text-sm">No documentation available</div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {loading && (
                <div className="text-gray-400">Loading...</div>
              )}
              {error && selectedDoc && (
                <div className="text-red-400">{error}</div>
              )}
              {!loading && !error && selectedDoc && content && (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-2xl font-bold text-white mb-4">{selectedDoc.title}</h1>
                  <div className="text-gray-300 whitespace-pre-wrap font-mono text-sm">
                    {content}
                  </div>
                </div>
              )}
              {!selectedDoc && (
                <div className="text-gray-500 text-center mt-8">
                  Select a document from the list to view its contents
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
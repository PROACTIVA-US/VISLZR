import { useRef } from "react";
import { graphOps } from "@/services/graphService";
import type { GraphData } from "@/services/schema";

interface ImportExportProps {
  graphData: GraphData;
  onImport: (data: GraphData) => void;
  projectId: string;
}

export function ImportExport({ graphData, onImport, projectId }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${projectId}-${timestamp}.json`;
    graphOps.downloadAsJSON(graphData, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedData = graphOps.importFromJSON(text);
      onImport(importedData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
        title="Export graph as JSON"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
      
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center gap-1.5"
        title="Import graph from JSON"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
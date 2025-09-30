import { useState, useEffect } from "react";
import { patchNode } from "../services/apiClient";
import { NodeStyler } from "./NodeStyler";

type NodeData = {
  id: string;
  label: string;
  status?: string;
  priority?: number;
  progress?: number;
  tags?: string[];
};

interface SidePanelProps {
  projectId: string;
  node: NodeData | null;
  onClose: () => void;
}

export function SidePanel({ projectId, node, onClose }: SidePanelProps) {
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("ok");
  const [priority, setPriority] = useState(3);
  const [progress, setProgress] = useState(0);
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (node) {
      setLabel(node.label || "");
      setStatus(node.status || "ok");
      setPriority(node.priority || 3);
      setProgress((node.progress || 0) * 100);
      setTags(node.tags?.join(", ") || "");
    }
  }, [node]);

  const handleSave = async () => {
    if (!node) return;

    setSaving(true);
    try {
      const updates: any = {};
      if (label !== node.label) updates.label = label;
      if (status !== node.status) updates.status = status;
      if (priority !== node.priority) updates.priority = priority;
      if (progress / 100 !== node.progress) updates.progress = progress / 100;
      
      const newTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      if (JSON.stringify(newTags) !== JSON.stringify(node.tags || [])) {
        updates.tags = newTags;
      }

      if (Object.keys(updates).length > 0) {
        await patchNode(projectId, node.id, updates);
      }
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(false);
    }
  };

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Edit Node</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ok">OK</option>
            <option value="focus">Focus</option>
            <option value="blocked">Blocked</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Priority
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 3)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Progress ({Math.round(progress)}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., frontend, urgent, bug"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          Node ID: {node.id}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <NodeStyler
            projectId={projectId}
            nodeId={node.id}
            currentStatus={node.status}
            currentPriority={node.priority}
            onUpdate={() => {
              // Refresh will happen via WebSocket
            }}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
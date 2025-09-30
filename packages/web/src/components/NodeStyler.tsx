import { useState } from "react";
import { patchNode } from "@/services/apiClient";

interface NodeStylerProps {
  projectId: string;
  nodeId: string;
  currentStatus?: string;
  currentPriority?: number;
  onUpdate?: () => void;
}

const STATUS_OPTIONS = [
  { value: "ok", label: "Normal", color: "bg-blue-600" },
  { value: "focus", label: "Focus", color: "bg-red-600" },
  { value: "overdue", label: "Overdue", color: "bg-yellow-600" },
  { value: "blocked", label: "Blocked", color: "bg-gray-600" },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low", size: "small" },
  { value: 2, label: "Medium", size: "medium" },
  { value: 3, label: "High", size: "large" },
  { value: 4, label: "Critical", size: "xlarge" },
];

export function NodeStyler({ 
  projectId, 
  nodeId, 
  currentStatus = "ok", 
  currentPriority = 2,
  onUpdate 
}: NodeStylerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await patchNode(projectId, nodeId, { status: newStatus });
      setStatus(newStatus);
      onUpdate?.();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    try {
      await patchNode(projectId, nodeId, { priority: newPriority });
      setPriority(newPriority);
      onUpdate?.();
    } catch (e) {
      console.error("Failed to update priority:", e);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        🎨 Style Node
      </button>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">Node Style</h4>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Status (Color)</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all
                ${status === option.value 
                  ? 'bg-gray-700 ring-2 ring-blue-500' 
                  : 'bg-gray-900 hover:bg-gray-800'}
              `}
            >
              <div className={`w-3 h-3 rounded-full ${option.color}`} />
              <span className="text-gray-300">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Priority (Size)</label>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITY_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handlePriorityChange(option.value)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all
                ${priority === option.value 
                  ? 'bg-gray-700 ring-2 ring-blue-500' 
                  : 'bg-gray-900 hover:bg-gray-800'}
              `}
            >
              <div 
                className={`
                  bg-blue-500 rounded-full
                  ${option.size === 'small' ? 'w-2 h-2' : ''}
                  ${option.size === 'medium' ? 'w-3 h-3' : ''}
                  ${option.size === 'large' ? 'w-4 h-4' : ''}
                  ${option.size === 'xlarge' ? 'w-5 h-5' : ''}
                `} 
              />
              <span className="text-gray-300">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div className="p-3 bg-gray-900 rounded text-center">
        <div className="text-xs text-gray-500 mb-2">Preview</div>
        <div className="flex justify-center">
          <div 
            className={`
              rounded-full flex items-center justify-center text-white font-bold
              ${STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-blue-600'}
              ${priority === 1 ? 'w-12 h-12 text-xs' : ''}
              ${priority === 2 ? 'w-16 h-16 text-sm' : ''}
              ${priority === 3 ? 'w-20 h-20 text-base' : ''}
              ${priority === 4 ? 'w-24 h-24 text-lg' : ''}
            `}
          >
            Node
          </div>
        </div>
      </div>
    </div>
  );
}
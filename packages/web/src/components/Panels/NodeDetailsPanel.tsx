/**
 * NodeDetailsPanel - Enhanced node details view with metadata
 * Phase 2.2: Action Handlers & View Integration
 *
 * Contract defined by GraphView:
 * - Props: projectId, node, onClose, onUpdate
 * - Renders when: detailsPanelNode !== null
 * - Closes on: Esc key, close button, or onClose call
 */

import { useState, useEffect } from 'react';
import type { NodeData, NodeType, NodeStatus } from '@vislzr/shared';

interface NodeDetailsPanelProps {
  projectId: string;
  node: NodeData;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<NodeData>) => Promise<void>;
}

export function NodeDetailsPanel({ node, onClose, onUpdate }: NodeDetailsPanelProps) {
  // Form state
  const [label, setLabel] = useState('');
  const [type, setType] = useState<NodeType>('TASK');
  const [status, setStatus] = useState<NodeStatus>('IDLE');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(2);
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate form when node changes
  useEffect(() => {
    setLabel(node.label || '');
    setType(node.type || 'TASK');
    setStatus(node.status || 'IDLE');
    setPriority((node.priority as 1 | 2 | 3 | 4) || 2);
    setProgress((node.progress || 0) * 100);
    setDescription(node.metadata?.description || '');
    setTags(node.tags?.join(', ') || '');
    setHasUnsavedChanges(false);
    setError(null);
  }, [node]);

  // Detect unsaved changes
  useEffect(() => {
    const changed =
      label !== (node.label || '') ||
      type !== (node.type || 'TASK') ||
      status !== (node.status || 'IDLE') ||
      priority !== ((node.priority as 1 | 2 | 3 | 4) || 2) ||
      progress !== ((node.progress || 0) * 100) ||
      description !== (node.metadata?.description || '') ||
      tags !== (node.tags?.join(', ') || '');

    setHasUnsavedChanges(changed);
  }, [label, type, status, priority, progress, description, tags, node]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    setError(null);

    try {
      const updates: Partial<NodeData> = {};

      // Compare and build updates object
      if (label !== node.label) updates.label = label;
      if (type !== node.type) updates.type = type;
      if (status !== node.status) updates.status = status;
      if (priority !== node.priority) updates.priority = priority;
      if (progress / 100 !== node.progress) updates.progress = progress / 100;

      // Tags
      const newTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      if (JSON.stringify(newTags) !== JSON.stringify(node.tags || [])) {
        updates.tags = newTags;
      }

      // Description in metadata
      if (description !== (node.metadata?.description || '')) {
        updates.metadata = {
          ...node.metadata,
          description,
        };
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(node.id, updates);
        setHasUnsavedChanges(false);
      }
    } catch (e: any) {
      console.error('Failed to save node details:', e);
      setError(e?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-white">Node Details</h2>
          <p className="text-xs text-gray-400">ID: {node.id}</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="node-name" className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            id="node-name"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter node name"
          />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="node-type" className="block text-sm font-medium text-gray-300 mb-1">
            Type
          </label>
          <select
            id="node-type"
            value={type}
            onChange={(e) => setType(e.target.value as NodeType)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ROOT">Root</option>
            <option value="FOLDER">Folder</option>
            <option value="FILE">File</option>
            <option value="TASK">Task</option>
            <option value="SERVICE">Service</option>
            <option value="COMPONENT">Component</option>
            <option value="DEPENDENCY">Dependency</option>
            <option value="MILESTONE">Milestone</option>
            <option value="IDEA">Idea</option>
            <option value="NOTE">Note</option>
            <option value="SECURITY">Security</option>
            <option value="AGENT">Agent</option>
            <option value="API_ENDPOINT">API Endpoint</option>
            <option value="DATABASE">Database</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="node-status" className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            id="node-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as NodeStatus)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="IDLE">Idle</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AT_RISK">At Risk</option>
            <option value="OVERDUE">Overdue</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
            <option value="RUNNING">Running</option>
            <option value="ERROR">Error</option>
            <option value="STOPPED">Stopped</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="node-priority" className="block text-sm font-medium text-gray-300 mb-1">
            Priority (1 = Highest, 4 = Lowest)
          </label>
          <select
            id="node-priority"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1">1 - Critical</option>
            <option value="2">2 - High</option>
            <option value="3">3 - Normal</option>
            <option value="4">4 - Low</option>
          </select>
        </div>

        {/* Progress */}
        <div>
          <label htmlFor="node-progress" className="block text-sm font-medium text-gray-300 mb-1">
            Progress ({Math.round(progress)}%)
          </label>
          <input
            id="node-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="node-description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="node-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Enter node description..."
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="node-tags" className="block text-sm font-medium text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="node-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g., frontend, urgent, bug"
          />
        </div>

        {/* Metadata - Read-only */}
        {node.metadata && (
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Metadata</h3>
            <div className="space-y-1 text-xs text-gray-400">
              {node.metadata.created_at && (
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(node.metadata.created_at).toLocaleString()}
                </div>
              )}
              {node.metadata.updated_at && (
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(node.metadata.updated_at).toLocaleString()}
                </div>
              )}
              {node.metadata.due_date && (
                <div>
                  <span className="font-medium">Due:</span>{' '}
                  {new Date(node.metadata.due_date).toLocaleString()}
                </div>
              )}
              {node.metadata.assignee && (
                <div>
                  <span className="font-medium">Assignee:</span> {node.metadata.assignee}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          {hasUnsavedChanges && <span className="text-yellow-400">• Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

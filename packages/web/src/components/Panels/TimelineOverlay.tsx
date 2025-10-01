/**
 * TimelineOverlay - Horizontal timeline view of all nodes
 * Phase 2.2: Action Handlers & View Integration
 *
 * Contract defined by GraphView:
 * - Props: selectedNode, allNodes, onNodeSelect, onClose
 * - Renders when: timelineOverlayOpen && graph
 * - Closes on: Esc key, close button, or onClose call
 */

import { useState, useMemo } from 'react';
import type { NodeData, NodeStatus, NodeType } from '@vislzr/shared';

interface TimelineOverlayProps {
  selectedNode: NodeData | null;
  allNodes: NodeData[];
  onNodeSelect: (node: NodeData) => void;
  onClose: () => void;
}

type FilterStatus = NodeStatus | 'ALL';
type FilterType = NodeType | 'ALL';

export function TimelineOverlay({ selectedNode, allNodes, onNodeSelect, onClose }: TimelineOverlayProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Parse and sort nodes by date
  const timelineNodes = useMemo(() => {
    let filtered = allNodes.filter(node => {
      // Filter by status
      if (filterStatus !== 'ALL' && node.status !== filterStatus) {
        return false;
      }

      // Filter by type
      if (filterType !== 'ALL' && node.type !== filterType) {
        return false;
      }

      // Filter by date range
      const nodeDate = node.metadata?.created_at || node.metadata?.due_date;
      if (dateRangeStart && nodeDate) {
        if (new Date(nodeDate) < new Date(dateRangeStart)) {
          return false;
        }
      }
      if (dateRangeEnd && nodeDate) {
        if (new Date(nodeDate) > new Date(dateRangeEnd)) {
          return false;
        }
      }

      return true;
    });

    // Sort by date (created_at or due_date)
    return filtered
      .map(node => ({
        node,
        date: new Date(node.metadata?.created_at || node.metadata?.due_date || Date.now()),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allNodes, filterStatus, filterType, dateRangeStart, dateRangeEnd]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (timelineNodes.length === 0) {
      return { start: new Date(), end: new Date() };
    }

    const dates = timelineNodes.map(tn => tn.date.getTime());
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates)),
    };
  }, [timelineNodes]);

  // Position nodes along timeline (0-100%)
  const positionedNodes = useMemo(() => {
    if (timelineNodes.length === 0) return [];

    const range = timelineRange.end.getTime() - timelineRange.start.getTime();
    if (range === 0) {
      // All nodes at same time - spread them evenly
      return timelineNodes.map((tn, idx) => ({
        ...tn,
        position: (idx / Math.max(timelineNodes.length - 1, 1)) * 100,
      }));
    }

    return timelineNodes.map(tn => ({
      ...tn,
      position: ((tn.date.getTime() - timelineRange.start.getTime()) / range) * 100,
    }));
  }, [timelineNodes, timelineRange]);

  const getStatusColor = (status?: NodeStatus): string => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'BLOCKED':
        return 'bg-red-500';
      case 'AT_RISK':
        return 'bg-orange-500';
      case 'OVERDUE':
        return 'bg-red-600';
      case 'PLANNED':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNodeClick = (node: NodeData) => {
    onNodeSelect(node);
  };

  const resetFilters = () => {
    setFilterStatus('ALL');
    setFilterType('ALL');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-60 bg-gray-900/95 border-b border-gray-700 shadow-xl z-30 flex flex-col">
      {/* Header with Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Timeline</h2>
          <div className="text-xs text-gray-400">
            {timelineNodes.length} of {allNodes.length} nodes
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <label htmlFor="filter-status" className="text-xs text-gray-400">
              Status:
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="ALL">All</option>
              <option value="IDLE">Idle</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
              <option value="AT_RISK">At Risk</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1">
            <label htmlFor="filter-type" className="text-xs text-gray-400">
              Type:
            </label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="ALL">All</option>
              <option value="TASK">Task</option>
              <option value="MILESTONE">Milestone</option>
              <option value="SERVICE">Service</option>
              <option value="COMPONENT">Component</option>
              <option value="FILE">File</option>
              <option value="FOLDER">Folder</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-1">
            <label htmlFor="date-start" className="text-xs text-gray-400">
              From:
            </label>
            <input
              id="date-start"
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>

          <div className="flex items-center gap-1">
            <label htmlFor="date-end" className="text-xs text-gray-400">
              To:
            </label>
            <input
              id="date-end"
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>

          <button
            onClick={resetFilters}
            className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close timeline"
        >
          ✕
        </button>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 p-4 overflow-x-auto">
        {timelineNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 italic">No nodes match the current filters</p>
          </div>
        ) : (
          <div className="relative h-full">
            {/* Timeline axis */}
            <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-gray-700" />

            {/* Timeline markers - start and end dates */}
            <div className="absolute bottom-4 left-0 text-xs text-gray-500">
              {timelineRange.start.toLocaleDateString()}
            </div>
            <div className="absolute bottom-4 right-0 text-xs text-gray-500">
              {timelineRange.end.toLocaleDateString()}
            </div>

            {/* Milestone markers */}
            {positionedNodes
              .filter(pn => pn.node.type === 'MILESTONE')
              .map((pn) => (
                <div
                  key={pn.node.id}
                  className="absolute bottom-0"
                  style={{ left: `${pn.position}%` }}
                >
                  <div className="w-0.5 h-16 bg-yellow-500" />
                  <div className="text-xs text-yellow-400 whitespace-nowrap -ml-8">
                    {pn.node.label}
                  </div>
                </div>
              ))}

            {/* Node markers */}
            {positionedNodes.map((pn) => {
              const isSelected = selectedNode?.id === pn.node.id;
              const isMilestone = pn.node.type === 'MILESTONE';

              if (isMilestone) {
                // Milestones already rendered above
                return null;
              }

              return (
                <button
                  key={pn.node.id}
                  onClick={() => handleNodeClick(pn.node)}
                  className={`absolute bottom-6 transform -translate-x-1/2 transition-all ${
                    isSelected ? 'scale-150' : 'hover:scale-125'
                  }`}
                  style={{ left: `${pn.position}%` }}
                  title={`${pn.node.label} - ${pn.node.status || 'IDLE'}`}
                  aria-label={`Select node: ${pn.node.label}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(pn.node.status)} ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

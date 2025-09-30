// Re-export shared types for backward compatibility
// All types are now defined in @vislzr/shared package
export type {
  NodeID,
  EdgeID,
  ProjectID,
  MilestoneID,
  NodeType,
  NodeStatus,
  EdgeType,
  EdgeStatus,
  NodePriority,
  NodeMetadata,
  NodeData,
  EdgeData,
  Milestone,
  ProjectInfo,
  GraphData,
} from "@vislzr/shared";

import type { GraphData } from "@vislzr/shared";

export function isGraphData(x: any): x is GraphData {
  return x && Array.isArray(x.nodes) && Array.isArray(x.edges) && x.project?.id;
}

export const isValidGraphData = isGraphData;

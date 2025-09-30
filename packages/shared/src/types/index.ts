// Core type definitions shared between frontend and backend

export type NodeID = string;
export type EdgeID = string;
export type ProjectID = string;
export type MilestoneID = string;

/**
 * Node types as defined in PRD Section 4.1
 */
export type NodeType =
  | 'ROOT'           // Project root
  | 'FOLDER'         // Directory/container
  | 'FILE'           // Source file
  | 'TASK'           // Work item with status
  | 'SERVICE'        // Backend service, API, database
  | 'COMPONENT'      // UI component, module
  | 'DEPENDENCY'     // External dependency (npm, docker)
  | 'MILESTONE'      // Project milestone
  | 'IDEA'           // Future feature, brainstorm
  | 'NOTE'           // Documentation, comment
  | 'SECURITY'       // Security finding (CVE, vulnerability)
  | 'AGENT'          // AI agent or monitor
  | 'API_ENDPOINT'   // API route
  | 'DATABASE';      // Database instance

/**
 * Node status states as defined in PRD Section 4.1
 */
export type NodeStatus =
  | 'IDLE'           // Not started
  | 'PLANNED'        // Scheduled but not active
  | 'IN_PROGRESS'    // Active work
  | 'AT_RISK'        // At risk of becoming overdue
  | 'OVERDUE'        // Past deadline
  | 'BLOCKED'        // Cannot proceed (dependency/issue)
  | 'COMPLETED'      // Done
  | 'RUNNING'        // Service is active (healthy)
  | 'ERROR'          // Service or task in error state
  | 'STOPPED';       // Service stopped/paused

/**
 * Edge/Connection types
 */
export type EdgeType =
  | 'parent'         // Parent-child structural link
  | 'dependency'     // Dependency relationship
  | 'reference';     // Reference link (non-blocking)

/**
 * Edge status
 */
export type EdgeStatus =
  | 'active'         // Normal state
  | 'blocked'        // Dependency not met
  | 'met';           // Dependency satisfied

/**
 * Node priority (affects visual size)
 */
export type NodePriority = 1 | 2 | 3 | 4;

/**
 * Node metadata
 */
export interface NodeMetadata {
  created_at: string;
  updated_at: string;
  due_date?: string;
  assignee?: string;
  estimated_hours?: number;
  actual_hours?: number;
  code?: string;           // For FILE nodes
  description?: string;
  links?: string[];        // External references
  [key: string]: any;      // Extensible
}

/**
 * Core Node data structure
 */
export interface NodeData {
  id: NodeID;
  label: string;
  type: NodeType;
  status: NodeStatus;
  priority: NodePriority;
  progress: number;          // 0-100
  tags: string[];
  parent_id: NodeID | null;
  dependencies: NodeID[];    // Node IDs this depends on
  metadata: NodeMetadata;
  // D3.js simulation properties (optional)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

/**
 * Edge data structure
 */
export interface EdgeData {
  id: EdgeID;
  source: NodeID | any;      // NodeID or D3 node object
  target: NodeID | any;      // NodeID or D3 node object
  type: EdgeType;
  status: EdgeStatus;
  metadata?: {
    label?: string;
    weight?: number;
    [key: string]: any;
  };
}

/**
 * Milestone status
 */
export type MilestoneStatus = 'planned' | 'pending' | 'done';

/**
 * Milestone data structure
 */
export interface Milestone {
  id: MilestoneID;
  project_id: ProjectID;
  title: string;
  date: string;
  status: MilestoneStatus;
  description?: string;
  linked_nodes: NodeID[];  // Associated node IDs
}

/**
 * Project information
 */
export interface ProjectInfo {
  id: ProjectID;
  name: string;
  created_at: string;
  updated_at: string;
  description?: string;
}

/**
 * Complete graph data structure
 */
export interface GraphData {
  project: ProjectInfo;
  nodes: NodeData[];
  edges: EdgeData[];
  milestones?: Milestone[];
}

/**
 * Sibling Node Action types (PRD Section 4.2)
 */
export type SiblingActionType =
  // View actions
  | 'view_timeline'
  | 'view_status_log'
  | 'view_dependencies'
  | 'view_details'
  | 'view_schema'
  // Creation actions
  | 'add_task'
  | 'add_note'
  | 'add_child'
  | 'add_idea'
  // State changes
  | 'mark_complete'
  | 'update_progress'
  | 'pause_resume'
  | 'start_task'
  // AI scans
  | 'security_scan'
  | 'compliance_scan'
  | 'optimization_scan'
  | 'architectural_scan'
  | 'check_updates'
  | 'dependency_audit'
  // AI generation
  | 'propose_features'
  | 'market_intel'
  | 'partnership_analysis'
  | 'competitor_analysis'
  | 'ask_ai'
  // Code actions
  | 'view_code'
  | 'edit_code'
  | 'run_linter'
  | 'run_tests'
  // Service actions
  | 'view_logs'
  | 'view_metrics'
  | 'restart'
  | 'scale'
  | 'debug';

/**
 * Sibling Node action definition
 */
export interface SiblingAction {
  type: SiblingActionType;
  label: string;
  icon?: string;
  description?: string;
  group?: string;           // For grouped actions
  handler: string;          // Handler function name
}

/**
 * Context for determining available sibling actions
 * Extended with additional fields for context detection
 */
export interface ActionContext {
  nodeType: NodeType;
  nodeStatus: NodeStatus;
  hasChildren: boolean;
  hasParent: boolean;
  hasDependencies: boolean;
  isBlocked: boolean;
  isOverdue: boolean;
  metadata: Record<string, any>;
}

/**
 * API Response types
 */
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * WebSocket message types
 */
export type WSEventType =
  | 'graph_changed'
  | 'node_updated'
  | 'edge_updated'
  | 'milestone_updated'
  | 'scan_complete';

export interface WSMessage {
  event: WSEventType;
  data?: any;
  timestamp: string;
}

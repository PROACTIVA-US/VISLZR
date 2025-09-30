// Sibling Node Action System Types
// Phase 1.1 - Foundation (Data Models & Types)

import type { NodeData, GraphData, NodeType, NodeStatus } from './index';

/**
 * Action categories for sibling nodes
 * Determines visual styling and grouping behavior
 */
export type ActionCategory =
  | 'view'           // Non-destructive info display
  | 'create'         // Add new nodes
  | 'state-change'   // Modify node state
  | 'ai-analysis'    // AI scans and analysis
  | 'ai-generative'  // AI generation
  | 'integration'    // External tool actions
  | 'destructive';   // Delete, archive, etc.

/**
 * Specific action type identifiers
 * Organized by category for easier management
 */
export type ActionType =
  // View actions
  | 'view_timeline'
  | 'view_status_log'
  | 'view_dependencies'
  | 'view_details'
  | 'view_schema'
  | 'view_code'
  | 'view_logs'
  | 'view_metrics'
  // Creation actions
  | 'add_task'
  | 'add_note'
  | 'add_child'
  | 'add_idea'
  // State change actions
  | 'mark_complete'
  | 'update_progress'
  | 'pause_resume'
  | 'start_task'
  | 'restart'
  | 'scale'
  // AI analysis actions
  | 'security_scan'
  | 'compliance_scan'
  | 'optimization_scan'
  | 'architectural_scan'
  | 'check_updates'
  | 'dependency_audit'
  // AI generative actions
  | 'propose_features'
  | 'market_intel'
  | 'partnership_analysis'
  | 'competitor_analysis'
  | 'ask_ai'
  // Code actions
  | 'edit_code'
  | 'run_linter'
  | 'run_tests'
  // Service actions
  | 'debug';

/**
 * Visibility rule for conditional action display
 * Determines when an action should appear for a given node
 */
export interface VisibilityRule {
  field: keyof NodeData | 'always' | 'never';
  operator: 'equals' | 'not-equals' | 'contains' | 'matches' | 'exists';
  value?: any;
}

/**
 * Position in 2D space for sibling node placement
 */
export interface Position {
  x: number;
  y: number;
  angle?: number; // For arc layout positioning
}

/**
 * Graph context for action execution
 * Provides access to project data and API client
 */
export interface GraphContext {
  projectId: string;
  graphData: GraphData;
  apiClient: any; // Will be properly typed when API client is implemented
}

/**
 * Result of action execution
 * Can include graph/node updates for optimistic UI updates
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
  graphUpdate?: Partial<GraphData>; // Optional graph changes
  nodeUpdate?: Partial<NodeData>;   // Optional node changes
}

/**
 * Action handler function signature
 * Executes the action and returns a result
 */
export type ActionHandler = (
  node: NodeData,
  context: GraphContext
) => Promise<ActionResult>;

/**
 * Core sibling action definition
 * Defines everything needed for a context-aware action button
 */
export interface SiblingAction {
  // Core identity
  id: string;
  label: string;
  icon: string; // Emoji or icon identifier
  category: ActionCategory;

  // Conditional visibility
  visibilityRules: VisibilityRule[];
  priority: number; // For sorting (lower = higher priority)

  // Grouping (for sub-menus)
  group?: string; // e.g., "scans", "ai-actions"
  isGroupParent?: boolean;

  // Execution
  handler: ActionHandler;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;

  // Visual
  color?: string; // Override default color
  tooltip?: string;

  // Metadata
  estimatedDuration?: number; // seconds
  tags?: string[];
}

/**
 * Sibling node instance (runtime representation)
 * Created when action is displayed in the graph
 */
export interface SiblingNodeInstance {
  id: string; // Unique instance ID
  actionId: string; // Reference to SiblingAction
  label: string;
  icon: string;
  position: Position;
  color: string;
  isGroupParent?: boolean;
  isExpanded?: boolean; // For grouped siblings
  children?: SiblingNodeInstance[]; // For sub-siblings
}

/**
 * Node context analysis result
 * Used for determining which actions are available
 */
export interface NodeContext {
  nodeType: NodeType;
  status: NodeStatus;
  hasChildren: boolean;
  hasParent: boolean;
  hasDependencies: boolean;
  isBlocked: boolean;
  isOverdue: boolean;
  metadata: Record<string, any>;
}

/**
 * Layout type for sibling positioning
 */
export type LayoutType = 'arc' | 'stack' | 'ring';

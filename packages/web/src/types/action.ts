/**
 * TypeScript types for sibling node actions.
 * Matches backend Pydantic schemas.
 */

export type ActionType = 'view' | 'create' | 'state' | 'ai' | 'group';

export type ActionCategory = 'foundational' | 'ai' | 'grouped';

export interface SiblingAction {
  id: string;
  label: string;
  icon: string;
  type: ActionType;
  category: ActionCategory;
  group?: string;
  handler: string;
  requires_context: boolean;
  ai_powered: boolean;
  priority: number;
}

export interface ContextRule {
  id: string;
  node_types: string[];
  node_statuses?: string[];
  actions: string[];
  priority: number;
}

export interface ActionExecutionRequest {
  params?: Record<string, any>;
}

export type ActionExecutionStatus = 'success' | 'failed' | 'pending';

export interface ActionExecutionResult {
  status: ActionExecutionStatus;
  action_id: string;
  node_id: string;
  result?: Record<string, any>;
  error_message?: string;
  executed_at: string;
}

export interface ActionHistoryEntry {
  id: string;
  action_id: string;
  executed_at: string;
  status: ActionExecutionStatus;
  result?: Record<string, any>;
  error_message?: string;
}

// Extended types for D3 visualization

export interface SiblingNodeData {
  id: string;
  parentNodeId: string;
  action: SiblingAction;
  x: number;
  y: number;
  angle?: number;
  isExpanded?: boolean;
  children?: SiblingNodeData[];
}

export interface SiblingNodeLayout {
  type: 'arc' | 'stack';
  radius?: number;  // Distance from parent (arc layout)
  spacing?: number; // Spacing between siblings (stack layout)
  direction?: 'vertical' | 'horizontal'; // Stack direction
}

export interface SiblingAnimationConfig {
  duration: number;  // ms
  delay: number;     // ms
  stagger: number;   // ms between each sibling
  easing?: string;   // CSS easing function
}

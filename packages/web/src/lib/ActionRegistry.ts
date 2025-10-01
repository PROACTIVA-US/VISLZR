// Action Registry - Central registry for all sibling node actions
// Phase 1.2 - Action Registry & Context Detection

import type {
  SiblingAction,
  VisibilityRule,
  NodeData,
  GraphContext,
  ActionResult,
  NodeContext,
} from '@vislzr/shared';

/**
 * ActionRegistry manages all available sibling actions
 * Provides filtering based on visibility rules and context
 */
export class ActionRegistry {
  private actions: Map<string, SiblingAction> = new Map();

  /**
   * Register a new action
   * @throws Error if action with same ID already exists
   */
  register(action: SiblingAction): void {
    if (this.actions.has(action.id)) {
      throw new Error(`Action with id '${action.id}' is already registered`);
    }
    this.actions.set(action.id, action);
  }

  /**
   * Unregister an action by ID
   * @returns true if action was removed, false if not found
   */
  unregister(actionId: string): boolean {
    return this.actions.delete(actionId);
  }

  /**
   * Get an action by ID
   * @returns The action or undefined if not found
   */
  getAction(actionId: string): SiblingAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Get all registered actions
   */
  getAllActions(): SiblingAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get actions available for a specific node context
   * Filters based on visibility rules and sorts by priority
   */
  getActionsForContext(node: NodeData, context: NodeContext): SiblingAction[] {
    const availableActions = Array.from(this.actions.values())
      .filter((action) => this.evaluateVisibilityRules(action, node, context))
      .sort((a, b) => a.priority - b.priority); // Lower priority value = higher priority

    return availableActions;
  }

  /**
   * Get child actions for a group parent
   */
  getGroupChildren(groupName: string): SiblingAction[] {
    return Array.from(this.actions.values())
      .filter((action) => action.group === groupName && !action.isGroupParent)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute an action by ID
   */
  async executeAction(
    actionId: string,
    node: NodeData,
    context: GraphContext
  ): Promise<ActionResult> {
    const action = this.actions.get(actionId);
    if (!action) {
      return {
        success: false,
        message: `Action '${actionId}' not found`,
      };
    }

    try {
      // Check for confirmation requirement
      if (action.requiresConfirmation) {
        const message = action.confirmationMessage || `Are you sure you want to ${action.label}?`;
        if (!confirm(message)) {
          return {
            success: false,
            message: 'Action cancelled by user',
          };
        }
      }

      // Execute the action handler
      const result = await action.handler(node, context);
      return result;
    } catch (error) {
      console.error(`Error executing action '${actionId}':`, error);
      return {
        success: false,
        message: `Failed to execute ${action.label}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Evaluate all visibility rules for an action
   * Returns true if ALL rules pass (AND logic)
   */
  private evaluateVisibilityRules(
    action: SiblingAction,
    node: NodeData,
    context: NodeContext
  ): boolean {
    // If no rules, action is always visible
    if (!action.visibilityRules || action.visibilityRules.length === 0) {
      return true;
    }

    // All rules must pass
    return action.visibilityRules.every((rule) =>
      this.evaluateRule(rule, node, context)
    );
  }

  /**
   * Evaluate a single visibility rule
   */
  private evaluateRule(
    rule: VisibilityRule,
    node: NodeData,
    context: NodeContext
  ): boolean {
    // Handle special fields
    if (rule.field === 'always') {
      return rule.value === true;
    }
    if (rule.field === 'never') {
      return false;
    }

    // Get the actual value from node or context
    let actualValue: any;

    // Check if field is a context field
    if (rule.field in context) {
      actualValue = context[rule.field as keyof NodeContext];
    } else if (rule.field in node) {
      actualValue = node[rule.field as keyof NodeData];
    } else {
      // Field doesn't exist
      return rule.operator === 'not-equals' || rule.operator === 'exists' ? false : false;
    }

    // Apply operator
    switch (rule.operator) {
      case 'equals':
        return actualValue === rule.value;

      case 'not-equals':
        return actualValue !== rule.value;

      case 'contains':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(rule.value);
        }
        if (typeof actualValue === 'string') {
          return actualValue.includes(String(rule.value));
        }
        return false;

      case 'matches':
        if (typeof actualValue === 'string' && rule.value instanceof RegExp) {
          return rule.value.test(actualValue);
        }
        if (typeof actualValue === 'string' && typeof rule.value === 'string') {
          return new RegExp(rule.value).test(actualValue);
        }
        return false;

      case 'exists':
        return actualValue !== undefined && actualValue !== null;

      default:
        console.warn(`Unknown operator: ${rule.operator}`);
        return false;
    }
  }

  /**
   * Clear all registered actions
   * Useful for testing
   */
  clear(): void {
    this.actions.clear();
  }

  /**
   * Get count of registered actions
   */
  get count(): number {
    return this.actions.size;
  }
}

// Export singleton instance
export const actionRegistry = new ActionRegistry();

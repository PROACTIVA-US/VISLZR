// Default Actions - Pre-registered sibling actions
// Phase 1.2 - Action Registry & Context Detection
// Based on spec Appendix A examples

import type { SiblingAction } from '@vislzr/shared/types/actions';
import {
  handleViewDependencies,
  handleAddTask,
  handleMarkComplete,
  handleAddNote,
  handleViewDetails,
  handleStartTask,
  handleAddChild,
  handleUpdateProgress,
} from './actionHandlers';

/**
 * Category color mapping for visual consistency
 */
export const CATEGORY_COLORS = {
  view: '#3b82f6',           // Blue
  create: '#10b981',         // Green
  'state-change': '#f59e0b', // Amber
  'ai-analysis': '#8b5cf6',  // Purple
  'ai-generative': '#ec4899', // Pink
  integration: '#06b6d4',    // Cyan
  destructive: '#ef4444',    // Red
};

/**
 * Default actions available to all nodes
 * These form the foundation of the sibling node system
 */
export const defaultActions: SiblingAction[] = [
  // VIEW ACTIONS
  {
    id: 'view-details',
    label: 'Details',
    icon: 'ℹ️',
    category: 'view',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 10,
    handler: handleViewDetails,
    tooltip: 'View full node details',
  },
  {
    id: 'view-dependencies',
    label: 'Dependencies',
    icon: '🔗',
    category: 'view',
    visibilityRules: [{ field: 'hasDependencies', operator: 'equals', value: true }],
    priority: 11,
    handler: handleViewDependencies,
    tooltip: 'View dependency relationships',
  },

  // CREATE ACTIONS
  {
    id: 'add-task',
    label: 'Add Task',
    icon: '✓',
    category: 'create',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 1,
    handler: handleAddTask,
    tooltip: 'Create a new task',
  },
  {
    id: 'add-note',
    label: 'Add Note',
    icon: '📝',
    category: 'create',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 3,
    handler: handleAddNote,
    tooltip: 'Add a note or comment',
  },
  {
    id: 'add-child',
    label: 'Add Child',
    icon: '➕',
    category: 'create',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 2,
    handler: handleAddChild,
    tooltip: 'Add a child node',
  },

  // STATE CHANGE ACTIONS
  {
    id: 'mark-complete',
    label: 'Complete',
    icon: '✓',
    category: 'state-change',
    visibilityRules: [
      { field: 'status', operator: 'not-equals', value: 'COMPLETED' },
      { field: 'nodeType', operator: 'equals', value: 'TASK' },
    ],
    priority: 1,
    handler: handleMarkComplete,
    tooltip: 'Mark task as complete',
  },
  {
    id: 'start-task',
    label: 'Start',
    icon: '▶️',
    category: 'state-change',
    visibilityRules: [
      { field: 'status', operator: 'equals', value: 'IDLE' },
      { field: 'nodeType', operator: 'equals', value: 'TASK' },
    ],
    priority: 1,
    handler: handleStartTask,
    tooltip: 'Start working on task',
  },
  {
    id: 'update-progress',
    label: 'Progress',
    icon: '📊',
    category: 'state-change',
    visibilityRules: [
      { field: 'status', operator: 'not-equals', value: 'COMPLETED' },
      { field: 'nodeType', operator: 'equals', value: 'TASK' },
    ],
    priority: 2,
    handler: handleUpdateProgress,
    tooltip: 'Update progress percentage',
  },

  // AI ANALYSIS ACTIONS (Placeholders for Phase 3)
  {
    id: 'security-scan',
    label: 'Security Scan',
    icon: '🔒',
    category: 'ai-analysis',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 20,
    handler: async (node) => ({
      success: true,
      message: 'Security scan placeholder - Phase 3',
      data: { node },
    }),
    tooltip: 'Run security vulnerability scan',
    estimatedDuration: 30,
  },
  {
    id: 'dependency-audit',
    label: 'Audit Deps',
    icon: '🔍',
    category: 'ai-analysis',
    visibilityRules: [
      { field: 'hasDependencies', operator: 'equals', value: true },
    ],
    priority: 21,
    handler: async (node) => ({
      success: true,
      message: 'Dependency audit placeholder - Phase 3',
      data: { node },
    }),
    tooltip: 'Audit dependency versions and vulnerabilities',
    estimatedDuration: 20,
  },

  // AI GENERATIVE ACTIONS (Placeholders for Phase 3)
  {
    id: 'ask-ai',
    label: 'Ask AI',
    icon: '🤖',
    category: 'ai-generative',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 30,
    handler: async (node) => ({
      success: true,
      message: 'AI chat placeholder - Phase 3',
      data: { node },
    }),
    tooltip: 'Ask AI about this node',
    estimatedDuration: 10,
  },

  // SERVICE ACTIONS (Context-specific)
  {
    id: 'view-logs',
    label: 'Logs',
    icon: '📋',
    category: 'view',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 12,
    handler: async (node) => ({
      success: true,
      message: 'View logs placeholder',
      data: { node },
    }),
    tooltip: 'View service logs',
  },
  {
    id: 'restart-service',
    label: 'Restart',
    icon: '🔄',
    category: 'state-change',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 10,
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to restart this service?',
    handler: async (node) => ({
      success: true,
      message: 'Restart service placeholder',
      data: { node },
    }),
    tooltip: 'Restart the service',
  },

  // CODE ACTIONS
  {
    id: 'view-code',
    label: 'View Code',
    icon: '💻',
    category: 'view',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'FILE' },
    ],
    priority: 5,
    handler: async (node) => ({
      success: true,
      message: 'View code placeholder',
      data: { node },
    }),
    tooltip: 'View file contents',
  },
  {
    id: 'run-tests',
    label: 'Run Tests',
    icon: '🧪',
    category: 'integration',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'FILE' },
      { field: 'label', operator: 'matches', value: /\.(test|spec)\.(ts|tsx|js|jsx)$/ },
    ],
    priority: 15,
    handler: async (node) => ({
      success: true,
      message: 'Run tests placeholder',
      data: { node },
    }),
    tooltip: 'Run test file',
    estimatedDuration: 15,
  },
];

/**
 * Grouped actions (for expandable sub-menus)
 * These will be implemented in Phase 1.8
 */
export const groupedActions: SiblingAction[] = [
  // CREATE GROUP (Parent)
  {
    id: 'create-group',
    label: 'Create',
    icon: '➕',
    category: 'create',
    isGroupParent: true,
    group: 'create',
    visibilityRules: [{ field: 'always', operator: 'equals', value: true }],
    priority: 1,
    handler: async () => ({ success: true }), // Group parents don't execute
    tooltip: 'Create new items',
  },

  // SCANS GROUP (Parent)
  {
    id: 'scans-group',
    label: 'Scans',
    icon: '🔍',
    category: 'ai-analysis',
    isGroupParent: true,
    group: 'scans',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 20,
    handler: async () => ({ success: true }),
    tooltip: 'Run analysis scans',
  },

  // SCANS GROUP - Children
  {
    id: 'compliance-scan',
    label: 'Compliance',
    icon: '📋',
    category: 'ai-analysis',
    group: 'scans',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 21,
    handler: async (node) => ({
      success: true,
      message: 'Compliance scan placeholder - Phase 3',
      data: { node },
    }),
    tooltip: 'Check regulatory compliance',
    estimatedDuration: 25,
  },
  {
    id: 'optimization-scan',
    label: 'Optimization',
    icon: '⚡',
    category: 'ai-analysis',
    group: 'scans',
    visibilityRules: [
      { field: 'nodeType', operator: 'equals', value: 'SERVICE' },
    ],
    priority: 22,
    handler: async (node) => ({
      success: true,
      message: 'Optimization scan placeholder - Phase 3',
      data: { node },
    }),
    tooltip: 'Find performance improvements',
    estimatedDuration: 30,
  },
];

/**
 * Get all default actions (including grouped)
 */
export function getAllDefaultActions(): SiblingAction[] {
  return [...defaultActions, ...groupedActions];
}

/**
 * Get actions by category
 */
export function getActionsByCategory(category: string): SiblingAction[] {
  return getAllDefaultActions().filter((action) => action.category === category);
}

/**
 * Get color for action category
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280';
}

import type { NodeStatus } from '@/types/graph';

// Node color mappings per PRD Section 4.1
export function getNodeColor(status: NodeStatus): string {
  const colorMap: Record<NodeStatus, string> = {
    ERROR: '#EF4444', // Red
    OVERDUE: '#EF4444', // Red
    AT_RISK: '#F59E0B', // Yellow
    IN_PROGRESS: '#3B82F6', // Blue
    COMPLETED: '#10B981', // Green
    RUNNING: '#10B981', // Green
    IDLE: '#6366F1', // Indigo
    STOPPED: '#6366F1', // Indigo
    PLANNED: '#6B7280', // Gray
    BLOCKED: '#EF4444', // Red
  };
  return colorMap[status] || '#6B7280';
}

export function getNodeBorderColor(status: NodeStatus): string {
  return getNodeColor(status);
}

export function shouldNodePulse(status: NodeStatus): boolean {
  return status === 'ERROR' || status === 'OVERDUE';
}
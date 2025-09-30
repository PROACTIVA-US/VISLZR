import { describe, it, expect } from 'vitest';
import { getNodeColor, getNodeBorderColor, shouldNodePulse } from '../nodeColors';
import type { NodeStatus } from '@/types';

describe('nodeColors utilities', () => {
  describe('getNodeColor', () => {
    it('returns red for ERROR status', () => {
      expect(getNodeColor('ERROR')).toBe('#EF4444');
    });

    it('returns red for OVERDUE status', () => {
      expect(getNodeColor('OVERDUE')).toBe('#EF4444');
    });

    it('returns yellow for AT_RISK status', () => {
      expect(getNodeColor('AT_RISK')).toBe('#F59E0B');
    });

    it('returns blue for IN_PROGRESS status', () => {
      expect(getNodeColor('IN_PROGRESS')).toBe('#3B82F6');
    });

    it('returns green for COMPLETED status', () => {
      expect(getNodeColor('COMPLETED')).toBe('#10B981');
    });

    it('returns green for RUNNING status', () => {
      expect(getNodeColor('RUNNING')).toBe('#10B981');
    });

    it('returns indigo for IDLE status', () => {
      expect(getNodeColor('IDLE')).toBe('#6366F1');
    });

    it('returns gray for PLANNED status', () => {
      expect(getNodeColor('PLANNED')).toBe('#6B7280');
    });

    it('returns red for BLOCKED status', () => {
      expect(getNodeColor('BLOCKED')).toBe('#EF4444');
    });
  });

  describe('getNodeBorderColor', () => {
    it('returns same color as getNodeColor', () => {
      const statuses: NodeStatus[] = [
        'ERROR',
        'AT_RISK',
        'IN_PROGRESS',
        'COMPLETED',
        'IDLE',
      ];
      statuses.forEach((status) => {
        expect(getNodeBorderColor(status)).toBe(getNodeColor(status));
      });
    });
  });

  describe('shouldNodePulse', () => {
    it('returns true for ERROR status', () => {
      expect(shouldNodePulse('ERROR')).toBe(true);
    });

    it('returns true for OVERDUE status', () => {
      expect(shouldNodePulse('OVERDUE')).toBe(true);
    });

    it('returns false for other statuses', () => {
      const statuses: NodeStatus[] = [
        'IDLE',
        'IN_PROGRESS',
        'COMPLETED',
        'AT_RISK',
        'PLANNED',
      ];
      statuses.forEach((status) => {
        expect(shouldNodePulse(status)).toBe(false);
      });
    });
  });
});
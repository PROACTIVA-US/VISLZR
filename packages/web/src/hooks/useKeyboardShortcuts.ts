import { useEffect, useCallback } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  handler: () => void;
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt';
  description?: string;
}

/**
 * Options for useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefault?: boolean;
  excludeInputs?: boolean; // Ignore shortcuts when input/textarea focused
}

/**
 * Custom hook for managing keyboard shortcuts
 *
 * Features:
 * - Global and contextual shortcuts
 * - Modifier key support (Cmd/Ctrl, Shift, Alt)
 * - Automatic input/textarea exclusion
 * - Enable/disable toggle
 * - Prevents default browser behavior (optional)
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 'Escape', handler: closePanel },
 *     { key: 'd', handler: openDependencies, modifier: 'cmd' },
 *     { key: 'i', handler: openDetails },
 *   ],
 *   enabled: isPanelOpen,
 * });
 * ```
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventDefault = true,
  excludeInputs = true,
}: UseKeyboardShortcutsOptions): void {

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if disabled
    if (!enabled) return;

    // Skip if focus is in input/textarea (unless explicitly allowed)
    if (excludeInputs) {
      const target = event.target as HTMLElement;

      // Safety check for target and tagName
      if (!target || !target.tagName) return;

      const tagName = target.tagName.toLowerCase();
      const isEditable = target.isContentEditable;

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        isEditable
      ) {
        return;
      }
    }

    // Find matching shortcut
    for (const shortcut of shortcuts) {
      // Safely check if event.key exists (some synthetic events may not have it)
      if (!event.key) continue;

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (!keyMatch) continue;

      // Check modifier requirements
      const modifierMatch = checkModifier(event, shortcut.modifier);

      if (modifierMatch) {
        if (preventDefault) {
          event.preventDefault();
        }

        shortcut.handler();
        break; // Only execute first match
      }
    }
  }, [shortcuts, enabled, preventDefault, excludeInputs]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Check if the required modifier key is pressed
 */
function checkModifier(
  event: KeyboardEvent,
  modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt'
): boolean {
  if (!modifier) {
    // No modifier required - ensure no modifiers are pressed
    return !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
  }

  switch (modifier) {
    case 'ctrl':
      return event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;

    case 'cmd':
      // On Mac: metaKey (Cmd), on Windows/Linux: ctrlKey
      return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;

    case 'shift':
      return event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;

    case 'alt':
      return event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

    default:
      return false;
  }
}

/**
 * Helper to create keyboard shortcut descriptions for tooltips
 */
export function formatShortcut(key: string, modifier?: 'ctrl' | 'cmd' | 'shift' | 'alt'): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const parts: string[] = [];

  if (modifier === 'cmd') {
    parts.push(isMac ? '⌘' : 'Ctrl');
  } else if (modifier === 'ctrl') {
    parts.push('Ctrl');
  } else if (modifier === 'shift') {
    parts.push('⇧');
  } else if (modifier === 'alt') {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format key name
  const keyName = key === ' ' ? 'Space' : key.charAt(0).toUpperCase() + key.slice(1);
  parts.push(keyName);

  return parts.join('+');
}

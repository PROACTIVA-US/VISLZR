import { renderHook, waitFor } from '@testing-library/react';
import { fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts, formatShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let handleA: ReturnType<typeof vi.fn>;
  let handleB: ReturnType<typeof vi.fn>;
  let handleEscape: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleA = vi.fn();
    handleB = vi.fn();
    handleEscape = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper to simulate keyboard event and capture handler
  const setupKeyboardTest = () => {
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null;
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    addEventListenerSpy.mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (event: KeyboardEvent) => void;
      }
    });

    const simulateKeyPress = (key: string, modifiers: Partial<{
      ctrlKey?: boolean;
      metaKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
    }> = {}) => {
      if (keydownHandler) {
        const mockEvent = {
          key,
          ctrlKey: modifiers.ctrlKey || false,
          metaKey: modifiers.metaKey || false,
          shiftKey: modifiers.shiftKey || false,
          altKey: modifiers.altKey || false,
          target: document.body,
          preventDefault: vi.fn(),
        } as any;
        keydownHandler(mockEvent);
        return mockEvent;
      }
      return null;
    };

    return { simulateKeyPress, addEventListenerSpy };
  };

  it('should call handler when key is pressed', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    simulateKeyPress('a');
    expect(handleA).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should handle Escape key', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'Escape', handler: handleEscape }],
      })
    );

    simulateKeyPress('Escape');
    expect(handleEscape).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should handle multiple shortcuts', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [
          { key: 'a', handler: handleA },
          { key: 'b', handler: handleB },
        ],
      })
    );

    simulateKeyPress('a');
    expect(handleA).toHaveBeenCalledTimes(1);
    expect(handleB).not.toHaveBeenCalled();

    simulateKeyPress('b');
    expect(handleB).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should respect enabled flag', () => {
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null;
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    addEventListenerSpy.mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (event: KeyboardEvent) => void;
      }
    });

    const { rerender } = renderHook(
      ({ enabled }) =>
        useKeyboardShortcuts({
          shortcuts: [{ key: 'a', handler: handleA }],
          enabled,
        }),
      { initialProps: { enabled: true } }
    );

    // Simulate key press when enabled
    if (keydownHandler) {
      const mockEvent = {
        key: 'a',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        target: document.body,
        preventDefault: vi.fn(),
      } as any;
      keydownHandler(mockEvent);
    }
    expect(handleA).toHaveBeenCalledTimes(1);

    // Disable shortcuts - this should remove the listener
    rerender({ enabled: false });
    handleA.mockClear();

    // The handler should not be called because the listener was removed
    // (the hook checks `enabled` in useEffect return)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should ignore shortcuts when input is focused', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
        excludeInputs: true,
      })
    );

    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    input.dispatchEvent(event);

    expect(handleA).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should ignore shortcuts when textarea is focused', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
        excludeInputs: true,
      })
    );

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    textarea.dispatchEvent(event);

    expect(handleA).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should handle cmd/ctrl modifier', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();
    const handleCmdA = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleCmdA, modifier: 'cmd' }],
      })
    );

    // Without modifier - should not trigger
    simulateKeyPress('a');
    expect(handleCmdA).not.toHaveBeenCalled();

    // With metaKey (Cmd on Mac)
    simulateKeyPress('a', { metaKey: true });
    expect(handleCmdA).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should handle shift modifier', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();
    const handleShiftA = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleShiftA, modifier: 'shift' }],
      })
    );

    // Without modifier - should not trigger
    simulateKeyPress('a');
    expect(handleShiftA).not.toHaveBeenCalled();

    // With shiftKey
    simulateKeyPress('a', { shiftKey: true });
    expect(handleShiftA).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('should prevent default when preventDefault is true', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
        preventDefault: true,
      })
    );

    const event = simulateKeyPress('a');
    expect(event?.preventDefault).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  it('should not prevent default when preventDefault is false', () => {
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
        preventDefault: false,
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'a', handler: handleA }],
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should handle case-insensitive keys', () => {
    const { simulateKeyPress, addEventListenerSpy } = setupKeyboardTest();

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'd', handler: handleA }],
      })
    );

    // Uppercase D should trigger lowercase d handler
    simulateKeyPress('D');
    expect(handleA).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });
});

describe('formatShortcut', () => {
  it('should format simple key', () => {
    expect(formatShortcut('a')).toBe('A');
    expect(formatShortcut('escape')).toBe('Escape');
  });

  it('should format space key', () => {
    expect(formatShortcut(' ')).toBe('Space');
  });

  it('should format cmd modifier', () => {
    const result = formatShortcut('d', 'cmd');
    expect(result).toMatch(/^(⌘|Ctrl)\+D$/);
  });

  it('should format shift modifier', () => {
    expect(formatShortcut('a', 'shift')).toBe('⇧+A');
  });

  it('should format ctrl modifier', () => {
    expect(formatShortcut('c', 'ctrl')).toBe('Ctrl+C');
  });

  it('should format alt modifier', () => {
    const result = formatShortcut('t', 'alt');
    expect(result).toMatch(/^(⌥|Alt)\+T$/);
  });
});

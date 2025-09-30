import { useCallback, useState } from "react";
export interface ContextMenuState { open: boolean; x: number; y: number; payload?: any; }
export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  const openAt = useCallback((x: number, y: number, payload?: any) => { setState({ open: true, x, y, payload }); }, []);
  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);
  return { ...state, openAt, close };
}

import { useCallback, useState } from "react";
export function useSelection<T extends { id: string }>() {
  const [selected, setSelected] = useState<T | null>(null);
  const [hovered, setHovered] = useState<T | null>(null);
  const select = useCallback((item: T | null) => setSelected(item), []);
  const hover = useCallback((item: T | null) => setHovered(item), []);
  const isSelected = useCallback((id: string) => selected?.id === id, [selected]);
  const isHovered = useCallback((id: string) => hovered?.id === id, [hovered]);
  return { selected, hovered, select, hover, isSelected, isHovered };
}

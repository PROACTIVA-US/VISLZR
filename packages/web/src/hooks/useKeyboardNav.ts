import { useEffect, useRef, useState } from "react";
export function useKeyboardNav(opts?: { zoomStep?: number; panStep?: number; minZoom?: number; maxZoom?: number; }) {
  const { zoomStep = 0.1, panStep = 40, minZoom = 0.3, maxZoom = 2.5 } = opts || {};
  const [zoom, setZoom] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(maxZoom, z + zoomStep));
      if (e.key === "-" || e.key === "_") setZoom(z => Math.max(minZoom, z - zoomStep));
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setTx(t => t + panStep);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setTx(t => t - panStep);
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") setTy(t => t + panStep);
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") setTy(t => t - panStep);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomStep, panStep, minZoom, maxZoom]);
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.max(minZoom, Math.min(maxZoom, e.deltaY < 0 ? z + zoomStep : z - zoomStep))); }
      else { setTx(t => t - e.deltaX); setTy(t => t - e.deltaY); }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [zoomStep, minZoom, maxZoom]);
  const transformStyle = { transform: `translate(${tx}px, ${ty}px) scale(${zoom})`, transformOrigin: "0 0" } as const;
  return { containerRef, zoom, tx, ty, setZoom, setTx, setTy, transformStyle };
}

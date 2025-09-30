/**
 * Namespaced localStorage access with JSON serialization.
 * Falls back to in-memory map when localStorage is unavailable.
 */
const mem = new Map<string, string>();
const canLS = (() => {
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; }
  catch { return false; }
})();

function setRaw(k: string, v: string) {
  if (canLS) localStorage.setItem(k, v); else mem.set(k, v);
}
function getRaw(k: string) {
  return canLS ? localStorage.getItem(k) : mem.get(k) ?? null;
}
function delRaw(k: string) {
  if (canLS) localStorage.removeItem(k); else mem.delete(k);
}

export const storage = {
  set<T>(key: string, value: T) {
    setRaw(key, JSON.stringify(value));
  },
  get<T>(key: string, fallback: T): T {
    const raw = getRaw(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  },
  del(key: string) { delRaw(key); },
  has(key: string) { return getRaw(key) !== null; },
};

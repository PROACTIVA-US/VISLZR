/**
 * Fetches docs manifest + markdown files from /public/docs.
 */
export interface DocItem { id: string; title: string; filename: string; }
export interface Manifest { docs: DocItem[] }

export async function fetchDocsManifest(path = "/docs/docsManifest.json"): Promise<Manifest> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Manifest;
}

export async function fetchDocContent(filename: string): Promise<string> {
  const res = await fetch(`/docs/${filename}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

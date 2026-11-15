// The app talks to the server only through these two helpers. Relative URLs resolve to the dev server (or `origin` in production).
export async function get<T>(path: string): Promise<T> {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Request failed (${r.status})`);
  return r.json();
}

export async function post<T>(path: string, body: unknown = {}): Promise<T> {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

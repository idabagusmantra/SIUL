/** Penghubung ke backend inferensi (FastAPI). Kosongkan SIUL_API_URL untuk mode demonstrasi. */
export const API_URL = () => process.env.SIUL_API_URL?.replace(/\/$/, "") ?? "";

export function apiHeaders(): HeadersInit {
  const key = process.env.SIUL_API_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}

export async function forward(path: string, form: FormData, timeoutMs = 180_000) {
  const res = await fetch(`${API_URL()}${path}`, { method: "POST", body: form, headers: apiHeaders(), signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Backend menjawab ${res.status}`);
  return res.json();
}

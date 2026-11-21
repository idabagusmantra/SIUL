/** Penghubung ke backend inferensi (FastAPI). Kosongkan SIUL_API_URL untuk mode demonstrasi. */
export const API_URL = () => process.env.SIUL_API_URL?.replace(/\/$/, "") ?? "";

export function apiHeaders(): HeadersInit {
  const key = process.env.SIUL_API_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}

export class BackendError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function forward(path: string, form: FormData, timeoutMs = 280_000) {
  const res = await fetch(`${API_URL()}${path}`, { method: "POST", body: form, headers: apiHeaders(), signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    let detail = `Backend menjawab ${res.status}`;
    try { const j = await res.json(); if (typeof j.detail === "string") detail = j.detail; } catch {}
    throw new BackendError(detail, [400, 413, 422, 503].includes(res.status) ? res.status : 502);
  }
  return res.json();
}

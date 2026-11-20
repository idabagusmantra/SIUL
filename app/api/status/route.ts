import { connection, NextResponse } from "next/server";
import { API_URL, apiHeaders } from "@/lib/backend";
import type { StatusResponse } from "@/lib/types";

export async function GET() {
  await connection();
  if (!API_URL()) return NextResponse.json<StatusResponse>({ mode: "demo", backendOk: null });
  try {
    const r = await fetch(`${API_URL()}/v1/health`, { headers: apiHeaders(), signal: AbortSignal.timeout(3000) });
    return NextResponse.json<StatusResponse>({ mode: "live", backendOk: r.ok });
  } catch {
    return NextResponse.json<StatusResponse>({ mode: "live", backendOk: false });
  }
}

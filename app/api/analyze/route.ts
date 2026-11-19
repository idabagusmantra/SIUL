import { NextResponse } from "next/server";
import { demoAnalyze } from "@/lib/demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const form = await req.formData();
  const backend = process.env.SIUL_BACKEND_URL;
  if (backend) {
    const res = await fetch(`${backend.replace(/\/$/, "")}/analyze`, { method: "POST", body: form });
    if (!res.ok) return NextResponse.json({ error: `Backend ${res.status}` }, { status: 502 });
    return NextResponse.json({ mode: "live", ...(await res.json()) });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File).map(f => ({ name: f.name, size: f.size }));
  if (!files.length) return NextResponse.json({ error: "Tidak ada berkas" }, { status: 400 });
  return NextResponse.json(demoAnalyze(files));
}

import { NextResponse } from "next/server";
import { API_URL, BackendError, forward } from "@/lib/backend";
import { demoSingle } from "@/lib/demo";

// Waktu maksimum fungsi di Vercel (detik); ekstraksi audio di backend bisa puluhan detik.
export const maxDuration = 300;

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length !== 1) return NextResponse.json({ error: "Mode klip tunggal membutuhkan tepat 1 berkas audio." }, { status: 400 });
  if (!API_URL()) return NextResponse.json(demoSingle(files[0].name));
  try { return NextResponse.json({ mode: "live", ...(await forward("/v1/analyze/single", form)) }); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: e instanceof BackendError ? e.status : 502 }); }
}

import { NextResponse } from "next/server";
import { API_URL, forward } from "@/lib/backend";
import { demoBatch } from "@/lib/demo";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length < 2) return NextResponse.json({ error: "Mode batch membutuhkan minimal 2 berkas audio." }, { status: 400 });
  if (!API_URL()) return NextResponse.json(demoBatch(files.map(f => f.name)));
  try { return NextResponse.json({ mode: "live", ...(await forward("/v1/analyze/batch", form)) }); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 502 }); }
}

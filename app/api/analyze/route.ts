import { NextResponse } from "next/server";
import { demoAnalyze } from "@/lib/demo";
import type { AnalyzeMode } from "@/lib/types";

export const runtime = "nodejs";
const MAX_BYTES = 40 * 1024 * 1024;
const MIN_BATCH = 6;
const AUDIO = /\.(flac|wav|mp3|ogg|m4a)$/i;
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const form = await req.formData();
  const kind: AnalyzeMode = form.get("mode") === "batch" ? "batch" : "single";
  form.set("mode", kind);
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (!files.length) return fail("Tidak ada berkas audio.", 400);
  if (files.some((f) => !AUDIO.test(f.name))) return fail("Format tidak didukung. Gunakan FLAC, WAV, MP3, OGG, atau M4A.", 400);
  if (files.some((f) => f.size > MAX_BYTES)) return fail("Ukuran satu berkas melebihi 40 MB.", 413);
  if (kind === "single" && files.length !== 1) return fail("Mode klip tunggal memerlukan tepat satu berkas audio.", 400);
  if (kind === "batch" && files.length < MIN_BATCH) return fail(`Mode batch memerlukan minimal ${MIN_BATCH} berkas agar pengelompokan sumber bermakna.`, 400);

  const backend = process.env.SIUL_BACKEND_URL;
  if (backend) {
    try {
      const res = await fetch(`${backend.replace(/\/$/, "")}/analyze`, { method: "POST", body: form });
      if (!res.ok) return fail(`Layanan inferensi menolak permintaan (${res.status}).`, 502);
      return NextResponse.json({ mode: "live", kind, ...(await res.json()) });
    } catch {
      return fail("Layanan inferensi tidak dapat dihubungi. Periksa SIUL_BACKEND_URL.", 502);
    }
  }
  return NextResponse.json(demoAnalyze(files.map((f) => ({ name: f.name, size: f.size })), kind));
}

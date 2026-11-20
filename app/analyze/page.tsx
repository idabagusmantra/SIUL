import type { Metadata } from "next";
import AnalyzeClient from "./AnalyzeClient";

export const metadata: Metadata = { title: "Analisis Audio" };

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Analisis rekaman</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-mute">Pilih mode sesuai jumlah berkas. Format yang didukung: FLAC, WAV, MP3, OGG, M4A, maksimal 40 MB per berkas.</p>
      <AnalyzeClient />
    </div>
  );
}

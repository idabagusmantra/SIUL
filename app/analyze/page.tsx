import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import AnalyzeClient from "@/components/analyze/AnalyzeClient";

export const metadata: Metadata = { title: "Analisis Audio" };

export default function AnalyzePage() {
  return (
    <>
      <PageHero eyebrow="Analisis audio" title="Unggah rekaman, dapatkan label beserta buktinya.">
        Pilih mode sesuai rekaman Anda. Satu klip dapat diuji seketika; beberapa klip dari satu lokasi sebaiknya dianalisis sebagai batch agar keputusan lebih andal.
      </PageHero>
      <AnalyzeClient />
    </>
  );
}

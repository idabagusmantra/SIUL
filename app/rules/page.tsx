import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import RuleSimulator from "@/components/RuleSimulator";

export const metadata: Metadata = { title: "Simulator Aturan Open-Set" };

export default function RulesPage() {
  return (
    <>
      <PageHero eyebrow="Simulator aturan" title="Kapan SIUL menolak memberi label?">
        Geser bukti sebuah cluster dan lihat aturan mana yang menentukan hasilnya. Label hanya diberikan bila ada bukti positif; selebihnya adalah Unknown.
      </PageHero>
      <RuleSimulator />
    </>
  );
}

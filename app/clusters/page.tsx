import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import ClusterBrowser from "@/components/ClusterBrowser";

export const metadata: Metadata = { title: "Katalog Cluster" };

export default function ClustersPage() {
  return (
    <>
      <PageHero eyebrow="Katalog cluster" title="Kelompok sumber dari 814 klip uji referensi.">
        Setiap cluster adalah kumpulan klip yang diduga berasal dari satu sumber rekaman. Pilih cluster untuk melihat bukti di balik labelnya.
      </PageHero>
      <ClusterBrowser />
    </>
  );
}

import type { Metadata } from "next";
import ClusterTable from "./ClusterTable";

export const metadata: Metadata = { title: "Katalog Cluster" };

export default function ClustersPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Katalog Cluster</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-mute">
        Contoh hasil pengelompokan sumber pada himpunan rekaman uji penelitian: 22 cluster beserta label akhir dan dasar keputusannya. Nama spesies adalah dugaan terbanyak dari Perch dan dibaca sebagai &ldquo;mirip menurut Perch&rdquo;, bukan identifikasi pasti.
      </p>
      <ClusterTable />
    </div>
  );
}

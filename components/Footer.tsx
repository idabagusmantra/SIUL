import Link from "next/link";
import { BirdMark } from "./Bird";

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-sage-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <BirdMark className="h-8 w-8" />
            <span className="font-serif text-2xl font-semibold">SIUL</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-sage-200">
            Mengenali burung dari suaranya, dan jujur ketika suara itu belum dikenal.
          </p>
        </div>
        <nav aria-label="Halaman" className="text-sm">
          <p className="mb-3 font-semibold text-white">Halaman</p>
          <ul className="space-y-2 text-sage-200">
            <li><Link href="/analyze" className="hover:text-white">Analisis audio</Link></li>
            <li><Link href="/clusters" className="hover:text-white">Katalog Cluster</Link></li>
            <li><Link href="/rules" className="hover:text-white">Aturan Penolakan</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">Model yang dipakai</p>
          <ul className="space-y-2 text-sage-200">
            <li>Perch v2 (Apache 2.0)</li>
            <li>BirdNET v2.4 (CC BY-NC-SA 4.0, nonkomersial)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sage-200">
        © 2026 Tim IRIS Darsana, Teknologi Sains Data, Universitas Airlangga
      </div>
    </footer>
  );
}

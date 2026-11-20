import Link from "next/link";
import { LogoMark } from "./Birds";
import { Topo } from "./Topo";
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream/80">
      <Topo className="text-white/[.05]" seed={2} />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3"><LogoMark className="h-10 w-10" /><b className="text-2xl font-extrabold tracking-tight text-white">SIUL</b></div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Prototipe pengenalan suara burung berbasis pendekatan open-set, dikembangkan dari karya Tim IRIS Darsana untuk NPC DSC 2026.</p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Jelajahi</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[["/analyze", "Analisis Audio"], ["/clusters", "Katalog Cluster"], ["/rules", "Simulator Aturan"]].map(([h, t]) => <li key={h}><Link href={h} className="hover:text-leaf">{t}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Pengembang</h3>
          <p className="mt-4 text-sm leading-relaxed">Tim IRIS Darsana<br />Teknologi Sains Data<br />Universitas Airlangga, Surabaya</p>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-4 text-center text-xs text-cream/50">© 2026 Tim IRIS Darsana</div>
    </footer>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BirdMark } from "./Bird";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/analyze", label: "Analisis" },
  { href: "/clusters", label: "Katalog Cluster" },
  { href: "/rules", label: "Aturan Penolakan" },
];

export default function Header() {
  const path = usePathname();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="sticky top-0 z-40 border-b border-sage-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-forest-800">
          <BirdMark className="h-8 w-8" />
          <span className="leading-tight">
            <span className="block font-serif text-xl font-semibold tracking-wide">SIUL</span>
            <span className="block text-[11px] text-mute">Pengenal Avifauna Bioakustik</span>
          </span>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
              className={`rounded px-3 py-2 text-sm font-medium ${active(n.href) ? "bg-sage-100 text-forest-800" : "text-mute hover:text-forest-800"}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/analyze" className="ml-2 rounded bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">
            Mulai analisis
          </Link>
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded border border-sage-200 px-3 py-2 text-sm font-medium text-forest-800">Menu</summary>
          <div className="absolute right-0 mt-2 w-52 rounded border border-sage-200 bg-white p-2 shadow-lg">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded px-3 py-2 text-sm hover:bg-sage-100">{n.label}</Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "./Birds";

const NAV = [
  { href: "/", t: "Beranda" },
  { href: "/analyze", t: "Analisis Audio" },
  { href: "/clusters", t: "Katalog Cluster" },
  { href: "/rules", t: "Simulator Aturan" },
] as const;

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const on = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <LogoMark className="h-10 w-10" />
          <span className="leading-none"><b className="block text-2xl font-extrabold tracking-tight text-forest-700">SIUL</b><span className="text-[11px] uppercase tracking-[.14em] text-ink/60">Pengenalan suara burung</span></span>
        </Link>
        <nav className="hidden h-full items-stretch gap-1 lg:flex">
          {NAV.map(n => (
            <div key={n.href} className="relative flex">
              <Link href={n.href} className={`flex items-center gap-1 px-4 text-[15px] ${on(n.href) ? "font-bold text-forest-700" : "text-ink/75 hover:text-forest-700"}`}>
                {n.t}
              </Link>
              {on(n.href) && <span className="absolute inset-x-0 bottom-0 h-1 bg-forest-700" />}
            </div>
          ))}
        </nav>
        <button className="rounded border border-forest-700 px-3 py-2 text-sm font-semibold text-forest-700 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Tutup" : "Menu"}</button>
      </div>
      {open && (
        <nav className="border-t border-black/5 bg-white px-5 pb-4 lg:hidden">
          {NAV.map(n => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`block border-b border-black/5 py-3 ${on(n.href) ? "font-bold text-forest-700" : "text-ink/80"}`}>{n.t}</Link>)}
        </nav>
      )}
    </header>
  );
}

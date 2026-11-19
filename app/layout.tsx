import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
export const metadata = { title: "SIUL — Open-Set Bird Sound Classifier", description: "Prototype hasil NPC DSC 2026 · Tim IRIS Darsana" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id"><body>
      <nav className="nav">
        <b>SIUL</b>
        <Link href="/">Beranda</Link><Link href="/analyze">Analisis Audio</Link><Link href="/clusters">Cluster Uji</Link>
        <Link href="/rules">Simulator Aturan</Link><Link href="/validation">Validasi</Link>
      </nav>
      <main>{children}</main>
    </body></html>
  );
}

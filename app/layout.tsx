import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/public-sans";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "SIUL — Pengenalan Suara Burung", template: "%s · SIUL" },
  description: "Prototipe pengenalan suara Bondol Jawa, Cendrawasih, dan Kutilang dengan pendekatan open-set. Tim IRIS Darsana, NPC DSC 2026.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

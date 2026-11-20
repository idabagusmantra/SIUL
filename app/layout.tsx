import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: { default: "SIUL — Pengenal Avifauna Bioakustik", template: "%s · SIUL" },
  description:
    "Kenali Bondol Jawa, Cendrawasih, dan Kutilang dari rekaman suara, dan tandai spesies yang belum dikenal sebagai Unknown.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${serif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Lewati ke konten
        </a>
        <Header />
        <main id="isi" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

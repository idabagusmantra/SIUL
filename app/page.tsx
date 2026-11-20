import Link from "next/link";
import { Arrow, Bird } from "@/components/Birds";
import Forest from "@/components/Forest";
import { Topo } from "@/components/Topo";

const SPECIES = [
  { k: "bondol", n: "Bondol Jawa", s: "Lonchura leucogastroides", d: "Burung pemakan biji bertubuh mungil yang hidup berkelompok di padang rumput dan tepi sawah." },
  { k: "kutilang", n: "Kutilang", s: "Pycnonotus aurigaster", d: "Bulbul yang mudah dijumpai di pekarangan dan tepi hutan, dengan kicauan riang berulang." },
  { k: "cendrawasih", n: "Cendrawasih", s: "Famili Paradisaeidae", d: "Burung surga dengan vokalisasi khas yang sulit dibedakan dari derau hutan." },
] as const;

const STEPS = [
  ["Ekstraksi suara", "Setiap klip diubah menjadi representasi akustik: embedding Perch v2 dan BirdNET v2.4, ditambah fitur pola suku kata."],
  ["Detektor taksonomi", "Logit spesies dari model terlatih dipakai sebagai bukti positif bahwa klip memuat spesies target."],
  ["Pengelompokan sumber", "Klip dari rekaman yang sama dikelompokkan dengan graf tetangga bersama dan algoritma Leiden."],
  ["Keputusan berbasis bukti", "Label hanya diberikan bila bukti cukup. Bila tidak, hasilnya Unknown, bukan tebakan."],
];

export default function Home() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100vh-5rem)] flex-col text-white">
        <Forest />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-16 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-leaf">Bioacoustic Avifauna Classifier</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-7xl">Dengarkan hutan,<br /><span className="serif-i text-leaf">kenali penghuninya.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">SIUL mengidentifikasi suara Bondol Jawa, Cendrawasih, dan Kutilang dari rekaman lapangan, dan menandai suara dari spesies lain sebagai Unknown alih-alih memaksakan tebakan.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze" className="inline-flex items-center gap-2 rounded bg-leaf px-6 py-3 font-extrabold text-forest-950 hover:bg-leaf-dark">Mulai analisis <Arrow className="h-4 w-4" /></Link>
            <a href="#cara-kerja" className="rounded border border-white/60 px-6 py-3 font-bold hover:bg-white/10">Pelajari cara kerja</a>
          </div>
        </div>
        <div className="relative bg-forest-950/70 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
            <p className="text-center text-sm font-bold uppercase tracking-[.2em] text-white/80">Spesies yang dikenali</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {SPECIES.map(s => (
                <div key={s.k} className="flex items-center gap-4 bg-forest-800/90 p-4">
                  <Bird kind={s.k} className="w-24 shrink-0 rounded bg-cream/90 p-1" />
                  <div><h3 className="text-lg font-bold">{s.n}</h3><p className="text-xs italic text-white/65">{s.s}</p><p className="mt-1 text-sm leading-snug text-white/85">{s.d}</p></div>
                </div>))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-forest-700 lg:text-4xl">Dua cara menganalisis rekaman</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            ["Klip Tunggal", "Untuk uji cepat satu berkas. Setiap klip dinilai mandiri dengan detektor zero-shot, probabilitas classifier, kemiripan ke data latih, dan veto spesies lain.", "Cocok untuk mencoba satu rekaman."],
            ["Batch Sumber", "Untuk banyak berkas dari satu lokasi atau rekaman. Klip dikelompokkan per sumber lebih dulu, lalu tiap kelompok mendapat satu label konsensus dari bukti agregat.", "Lebih andal untuk keputusan akhir."],
          ].map(([t, d, n]) => (
            <Link key={t} href="/analyze" className="group border border-black/10 p-7 transition hover:border-forest-700 hover:shadow-md">
              <h3 className="text-2xl font-extrabold text-forest-700">{t}</h3>
              <p className="mt-3 leading-relaxed text-ink/75">{d}</p>
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-forest-700">{n} <Arrow className="h-4 w-4 transition group-hover:translate-x-1" /></p>
            </Link>))}
        </div>
      </section>

      <section id="cara-kerja" className="relative overflow-hidden bg-forest-700 text-white">
        <Topo className="text-white/[.12]" seed={1} />
        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">Cara kerja pipeline</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}><span className="serif-i text-6xl text-leaf">{i + 1}</span><h3 className="mt-2 text-xl font-bold">{t}</h3><p className="mt-2 leading-relaxed text-white/85">{d}</p></li>))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-forest-700 lg:text-4xl">Mengapa ada label Unknown?</h2>
          <p className="mt-4 leading-relaxed text-ink/75">Di lapangan, sebagian besar suara berasal dari spesies yang tidak dikenal sistem. Pengklasifikasi biasa akan tetap memilih salah satu dari tiga spesies dan sering keliru, terutama untuk Cendrawasih yang sinyalnya lemah.</p>
          <p className="mt-4 leading-relaxed text-ink/75">SIUL membalik logikanya: bawaan adalah Unknown, dan label spesies hanya diberikan bila ada bukti positif yang dapat ditunjukkan.</p>
          <Link href="/rules" className="mt-6 inline-flex items-center gap-2 font-bold text-forest-700 hover:underline">Coba simulator aturan <Arrow className="h-4 w-4" /></Link>
        </div>
        <div className="flex items-center justify-center bg-mist p-8"><Bird kind="unknown" variant="line" className="w-72 text-forest-700" /></div>
      </section>
    </>
  );
}

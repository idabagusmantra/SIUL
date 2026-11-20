import Link from "next/link";
import { BirdMark, BirdRule, HeroBird } from "@/components/Bird";

const STEPS = [
  ["Unggah rekaman", "Satu klip untuk uji cepat, atau beberapa klip dari satu lokasi."],
  ["Ekstraksi representasi", "Embedding Perch v2 dan BirdNET v2.4, ditambah 750 fitur akustik tahan noise."],
  ["Pengelompokan sumber", "Klip yang berasal dari sumber rekaman sama dikelompokkan dengan graf SNN dan Leiden."],
  ["Bukti per unit", "Detektor taksonomi zero-shot, probabilitas classifier, dan kemiripan ke data latih."],
  ["Keputusan label", "Kelas dikenal hanya diberikan bila ada bukti positif. Selebihnya Unknown."],
];

const SPECIES = [
  ["Bondol Jawa", "Lonchura leucogastroides", "Sering tidak dikenali model umum sebagai Lonchura, sehingga bukti utamanya adalah kemiripan dengan rekaman latih."],
  ["Cendrawasih", "Famili Paradisaeidae", "Sinyal suaranya lemah dan generik. Label hanya diberikan bila detektor famili aktif pada sebagian besar klip."],
  ["Kutilang", "Pycnonotus aurigaster", "Paling mudah dikenali: model umum langsung mendeteksinya tanpa pelatihan tambahan."],
];

export default function Home() {
  return (
    <>
      <section className="bg-forest-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.1] text-white md:text-6xl">
              Dengarkan rimba, kenali penghuninya.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sage-100">
              SIUL mengidentifikasi Bondol Jawa, Cendrawasih, dan Kutilang dari rekaman suara. Rekaman spesies lain tidak dipaksakan ke tiga kelas itu; sistem memberinya label Unknown.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/analyze" className="rounded bg-white px-6 py-3 font-semibold text-forest-900 hover:bg-sage-100">Analisis rekaman</Link>
              <Link href="/rules" className="rounded border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">Lihat aturan penolakan</Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end"><HeroBird /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">Dari rekaman lapangan ke label, dalam lima tahap</h2>
        <ol className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-5">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative border-t-2 border-forest-700 pt-4">
              <span className="font-serif text-sm font-semibold text-teak">Tahap {i + 1}</span>
              <h3 className="mt-1 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sage-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">Dua cara menganalisis</h2>
            <p className="mt-4 leading-relaxed text-mute">
              Pilih sesuai jumlah rekaman yang Anda punya. Keduanya memakai aturan bukti yang sama, tetapi unit keputusannya berbeda.
            </p>
            <Link href="/analyze" className="mt-6 inline-block rounded bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-700">Buka halaman analisis</Link>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-teak pl-5">
              <h3 className="text-xl font-semibold">Klip tunggal</h3>
              <p className="mt-2 leading-relaxed text-mute">Satu berkas audio dinilai sendiri. Cocok untuk uji cepat, tetapi tanpa konteks sumber setiap klip menanggung seluruh ketidakpastiannya, sehingga hasilnya kurang andal dibanding mode batch.</p>
            </div>
            <div className="border-l-4 border-forest-700 pl-5">
              <h3 className="text-xl font-semibold">Batch per sumber</h3>
              <p className="mt-2 leading-relaxed text-mute">Beberapa berkas dari satu lokasi dikelompokkan menurut sumber rekamannya, lalu setiap kelompok diberi satu label berdasarkan bukti gabungan. Ini mode yang disarankan untuk survei lapangan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <BirdRule />
        <h2 className="mt-10 text-3xl font-semibold md:text-4xl">Tiga spesies target</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {SPECIES.map(([n, l, d]) => (
            <article key={n}>
              <BirdMark className="h-7 w-7 text-forest-600" />
              <h3 className="mt-3 text-xl font-semibold">{n}</h3>
              <p className="text-sm italic text-bark">{l}</p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{d}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

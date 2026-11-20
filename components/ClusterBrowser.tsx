"use client";
import { useState } from "react";
import { Bird } from "./Birds";
import { card, LabelBadge } from "./ui";
import { CLUSTERS } from "@/lib/data";
import { KIND, LABEL_COLOR, LABELS, type Label } from "@/lib/rules";

const EVN: Record<string, string> = { fB: "Terdeteksi Bondol", fC: "Terdeteksi Cendrawasih", mB: "Kemiripan klip ke group Bondol", cB: "Kemiripan centroid ke group Bondol", pB: "Probabilitas Bondol", pC: "Probabilitas Cendrawasih", pK: "Probabilitas Kutilang" };

export default function ClusterBrowser() {
  const [f, setF] = useState<Label | "Semua">("Semua");
  const [sel, setSel] = useState(CLUSTERS[0].id);
  const list = CLUSTERS.filter(c => f === "Semua" || c.label === f);
  const cur = CLUSTERS.find(c => c.id === sel) ?? CLUSTERS[0];
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter label">
        {(["Semua", ...LABELS] as const).map(l => (
          <button key={l} onClick={() => setF(l)} aria-pressed={f === l} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${f === l ? "border-forest-700 bg-forest-700 text-white" : "border-black/15 bg-white text-ink/75 hover:border-forest-700"}`}>
            {l}{l !== "Semua" && <span className="ml-1.5 opacity-70">{CLUSTERS.filter(c => c.label === l).length}</span>}
          </button>))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map(c => (
            <button key={c.id} onClick={() => setSel(c.id)} aria-pressed={cur.id === c.id}
              className={`${card} text-left transition hover:shadow-md ${cur.id === c.id ? "ring-2 ring-forest-700" : ""}`} style={{ borderTop: `4px solid ${LABEL_COLOR[c.label]}` }}>
              <div className="flex items-center justify-between"><b className="text-lg">{c.id}</b><span className="text-sm text-ink/55">{c.n} klip</span></div>
              <div className="mt-2"><LabelBadge label={c.label} /></div>
              <p className="mt-3 line-clamp-2 text-xs italic text-ink/55">{c.species}</p>
            </button>))}
        </div>
        <aside className={`${card} h-fit lg:sticky lg:top-28`}>
          <Bird kind={KIND[cur.label]} className="mx-auto w-40" />
          <h2 className="mt-2 text-2xl font-extrabold">Cluster {cur.id}</h2>
          <p className="text-sm text-ink/60">{cur.n} klip</p>
          <div className="mt-3"><LabelBadge label={cur.label} className="text-sm" /></div>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{cur.basis}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink/50">Spesies teratas menurut Perch</p>
          <p className="text-sm italic">{cur.species}</p>
          {cur.ev && <table className="mt-4 w-full text-sm"><tbody>{Object.entries(cur.ev).map(([k, v]) => <tr key={k} className="border-t border-black/5"><td className="py-1.5 text-ink/70">{EVN[k] ?? k}</td><td className="text-right font-semibold tabular-nums">{v.toFixed(2).replace(".", ",")}</td></tr>)}</tbody></table>}
          {cur.grey && <p className="mt-4 rounded border border-gold/50 bg-gold/10 p-3 text-xs leading-relaxed">Cluster ini berada di zona abu-abu: buktinya tidak cukup kuat untuk keputusan otomatis.{cur.manual && " Labelnya ditetapkan manual setelah verifikasi eksternal."}</p>}
        </aside>
      </div>
    </div>
  );
}

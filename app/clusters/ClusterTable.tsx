"use client";
import { useState } from "react";
import { CLUSTERS } from "@/lib/data";
import type { Label } from "@/lib/rules";
import { LabelChip } from "@/components/ui";

const FILTERS: (Label | "Semua")[] = ["Semua", "Bondol Jawa", "Cendrawasih", "Kutilang", "Unknown"];
const GRAY = ["c04", "c12", "c14", "c16"];

export default function ClusterTable() {
  const [f, setF] = useState<Label | "Semua">("Semua");
  const [sel, setSel] = useState("c04");
  const rows = CLUSTERS.filter((r) => f === "Semua" || r.final === f);
  const cur = CLUSTERS.find((c) => c.id === sel) ?? CLUSTERS[0];
  return (
    <>
      <div role="group" aria-label="Saring menurut label" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(x)} aria-pressed={f === x}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${f === x ? "border-forest-800 bg-forest-800 text-white" : "border-sage-200 text-mute hover:border-forest-600"}`}>
            {x}<span className="ml-1.5 opacity-70">{x === "Semua" ? CLUSTERS.length : CLUSTERS.filter((r) => r.final === x).length}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="overflow-x-auto rounded border border-sage-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="sr-only">Daftar cluster rekaman uji</caption>
            <thead className="bg-sage-100 text-forest-900"><tr><th className="px-4 py-3">Cluster</th><th className="px-4 py-3">Klip</th><th className="px-4 py-3">Dugaan spesies (Perch)</th><th className="px-4 py-3">Label</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-sage-100 ${r.id === sel ? "bg-sage-50" : ""}`}>
                  <td className="px-4 py-2.5"><button onClick={() => setSel(r.id)} aria-pressed={r.id === sel} className="font-semibold text-forest-800 underline-offset-2 hover:underline">{r.id}</button></td>
                  <td className="px-4 py-2.5 tabular-nums">{r.n}</td>
                  <td className="px-4 py-2.5 italic text-bark">{r.species}</td>
                  <td className="px-4 py-2.5"><LabelChip label={r.final} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside aria-live="polite" className="rounded border border-sage-200 p-5 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">{cur.id} <span className="text-base font-normal text-mute">· {cur.n} klip</span></h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-mute">Label menurut aturan</dt><dd className="mt-1"><LabelChip label={cur.rule} /></dd></div>
            {cur.rule !== cur.final && <div><dt className="text-mute">Label akhir</dt><dd className="mt-1"><LabelChip label={cur.final} /></dd></div>}
            <div><dt className="text-mute">Dasar keputusan</dt><dd className="mt-1">{cur.basis}</dd></div>
          </dl>
          {cur.ev && (
            <table className="mt-4 w-full text-sm"><caption className="mb-1 text-left text-mute">Bukti cluster</caption>
              <tbody>{Object.entries(cur.ev).map(([k, v]) => <tr key={k} className="border-t border-sage-100"><td className="py-1.5">{k}</td><td className="py-1.5 text-right tabular-nums">{v.toFixed(2).replace(".", ",")}</td></tr>)}</tbody>
            </table>
          )}
          {cur.rule !== cur.final && <p className="mt-4 rounded border-l-4 border-teak bg-sage-50 px-3 py-2 text-sm">Aturan menghasilkan {cur.rule}, tetapi verifikasi eksternal menunjukkan {cur.final}. Label akhir dikoreksi secara manual.</p>}
          {GRAY.includes(cur.id) && cur.rule === cur.final && <p className="mt-4 rounded border-l-4 border-teak bg-sage-50 px-3 py-2 text-sm">Berada di zona abu-abu Bondol Jawa: bukti hampir, tetapi belum melewati batas aturan 4.</p>}
        </aside>
      </div>
    </>
  );
}

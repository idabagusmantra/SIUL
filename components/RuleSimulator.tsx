"use client";
import { useState } from "react";
import { Bird } from "./Birds";
import { card, LabelBadge } from "./ui";
import { decide, DEFAULT_EVIDENCE, KIND, RULES, type Evidence } from "@/lib/rules";

const FIELDS: { k: keyof Evidence; t: string; g: string; lo: number; hi: number; st: number }[] = [
  { k: "fK", t: "Klip terdeteksi Kutilang", g: "Zero-shot", lo: 0, hi: 1, st: 0.01 },
  { k: "fC", t: "Klip terdeteksi Cendrawasih", g: "Zero-shot", lo: 0, hi: 1, st: 0.01 },
  { k: "fB", t: "Klip terdeteksi Bondol", g: "Zero-shot", lo: 0, hi: 1, st: 0.01 },
  { k: "pK", t: "Probabilitas Kutilang", g: "Classifier", lo: 0, hi: 1, st: 0.01 },
  { k: "pB", t: "Probabilitas Bondol", g: "Classifier", lo: 0, hi: 1, st: 0.01 },
  { k: "mK", t: "Kemiripan ke group Kutilang", g: "Kemiripan", lo: -0.3, hi: 1, st: 0.01 },
  { k: "mB", t: "Kemiripan ke group Bondol", g: "Kemiripan", lo: -0.3, hi: 1, st: 0.01 },
  { k: "mC", t: "Kemiripan ke group Cendrawasih", g: "Kemiripan", lo: -0.3, hi: 1, st: 0.01 },
  { k: "cB", t: "Kemiripan centroid ke Bondol", g: "Kemiripan", lo: -0.3, hi: 1, st: 0.01 },
  { k: "medNonTarget", t: "Logit spesies non-target", g: "Veto", lo: -2, hi: 14, st: 0.1 },
  { k: "e", t: "Selisih terhadap rentang latih", g: "Veto", lo: -5, hi: 10, st: 0.1 },
];
const PRESETS: [string, Partial<Evidence>][] = [
  ["Kutilang jelas", { fK: 0.85, pK: 0.9, mK: 0.7 }],
  ["Bondol mirip group latih", { mB: 0.62, cB: 0.85, pB: 0.85 }],
  ["Zona abu-abu Bondol", { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 }],
  ["Mirip kakatua", { fC: 0.43, pK: 0.1 }],
  ["Spesies lain kuat", { medNonTarget: 8.8, e: 4, mB: 0.3 }],
];

export default function RuleSimulator() {
  const [ev, setEv] = useState<Evidence>(DEFAULT_EVIDENCE);
  const d = decide(ev);
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1fr_400px] lg:px-8">
      <div>
        <div className="flex flex-wrap gap-2">{PRESETS.map(([t, v]) => <button key={t} onClick={() => setEv({ ...DEFAULT_EVIDENCE, ...v })} className="rounded-full border border-black/15 bg-white px-4 py-1.5 text-sm font-semibold hover:border-forest-700 hover:text-forest-700">{t}</button>)}
          <button onClick={() => setEv(DEFAULT_EVIDENCE)} className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink/60 hover:text-forest-700">Atur ulang</button></div>
        <div className={`${card} mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2`}>
          {FIELDS.map(f => (
            <label key={f.k} className="block"><span className="flex items-baseline justify-between text-sm"><span><span className="text-ink/80">{f.t}</span> <span className="text-xs text-ink/45">{f.g}</span></span><b className="tabular-nums">{ev[f.k].toFixed(2).replace(".", ",")}</b></span>
              <input type="range" min={f.lo} max={f.hi} step={f.st} value={ev[f.k]} onChange={e => setEv({ ...ev, [f.k]: +e.target.value })} className="mt-1 w-full accent-forest-700" /></label>))}
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
        <div className={`${card} text-center`}>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Keputusan</p>
          <Bird kind={KIND[d.label]} className="mx-auto w-40" />
          <LabelBadge label={d.label} className="text-sm" />
          <p className="mt-3 text-sm leading-relaxed text-ink/75">{d.reason}</p>
        </div>
        <ol className={`${card} space-y-1.5`}>{RULES.map(r => (
          <li key={r.n} className={`flex gap-3 rounded px-2 py-1.5 text-sm ${r.n === d.rule ? "bg-forest-700 text-white" : "text-ink/55"}`}><b className="w-4 shrink-0">{r.n}</b><span><b>{r.t}</b>{r.n === d.rule && <span className="block text-white/85">{r.d}</span>}</span></li>))}</ol>
      </aside>
    </div>
  );
}

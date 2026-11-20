"use client";
import { useMemo, useState } from "react";
import { DEFAULT_EVIDENCE, evaluate, type Evidence } from "@/lib/rules";
import { LabelChip } from "@/components/ui";

const ZERO = DEFAULT_EVIDENCE;
const PRESETS: { name: string; v: Partial<Evidence> }[] = [
  { name: "Sumber Bondol tanpa group saudara (c04)", v: { fB: 0.07, mB: 0.29, cB: 0.48, pB: 0.5 } },
  { name: "Zona abu-abu Bondol kuat (c14)", v: { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 } },
  { name: "Kakatua mirip Cendrawasih (c02)", v: { fC: 0.43, pK: 0.1 } },
  { name: "Cendrawasih terdeteksi (c05)", v: { fC: 0.93 } },
  { name: "Kutilang tipe bulbul (c10)", v: { pK: 0.64, mK: 0.5, mB: 0.2, mC: 0.1 } },
  { name: "Bondol dengan group saudara (c15)", v: { mB: 0.6, cB: 0.89, pB: 0.8 } },
];
const FIELDS: { k: keyof Evidence; label: string; min: number; max: number; step: number }[] = [
  { k: "fK", label: "fK · fraksi zero-shot Kutilang", min: 0, max: 1, step: 0.01 },
  { k: "fC", label: "fC · fraksi zero-shot Cendrawasih", min: 0, max: 1, step: 0.01 },
  { k: "fB", label: "fB · fraksi zero-shot Bondol", min: 0, max: 1, step: 0.01 },
  { k: "mK", label: "mK · kemiripan ke group Kutilang", min: -0.3, max: 1, step: 0.01 },
  { k: "mC", label: "mC · kemiripan ke group Cendrawasih", min: -0.3, max: 1, step: 0.01 },
  { k: "mB", label: "mB · kemiripan ke group Bondol", min: -0.3, max: 1, step: 0.01 },
  { k: "cB", label: "cB · kemiripan centroid ke Bondol", min: -0.3, max: 1, step: 0.01 },
  { k: "pK", label: "pK · probabilitas Kutilang", min: 0, max: 1, step: 0.01 },
  { k: "pB", label: "pB · probabilitas Bondol", min: 0, max: 1, step: 0.01 },
  { k: "medNonTarget", label: "Logit spesies nontarget", min: -2, max: 14, step: 0.1 },
  { k: "e", label: "e · selisih logit nontarget", min: -5, max: 10, step: 0.1 },
];

export default function Simulator() {
  const [ev, setEv] = useState<Evidence>(ZERO);
  const { decision, steps } = useMemo(() => evaluate(ev), [ev]);
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <section aria-labelledby="bukti">
        <h2 id="bukti" className="text-xl font-semibold">Bukti</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => setEv({ ...ZERO, ...p.v })} className="rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-forest-800 hover:border-forest-600">{p.name}</button>
          ))}
          <button onClick={() => setEv(ZERO)} className="rounded-full px-3 py-1.5 text-xs font-medium text-mute underline">Setel ulang</button>
        </div>
        <div className="mt-5 space-y-4">
          {FIELDS.map((f) => (
            <label key={f.k} className="block text-sm">
              <span className="flex justify-between"><span>{f.label}</span><span className="tabular-nums font-semibold">{ev[f.k].toFixed(2).replace(".", ",")}</span></span>
              <input type="range" min={f.min} max={f.max} step={f.step} value={ev[f.k]} onChange={(e) => setEv({ ...ev, [f.k]: Number(e.target.value) })} className="mt-1 w-full accent-forest-700" />
            </label>
          ))}
        </div>
      </section>
      <section aria-labelledby="hasil" aria-live="polite">
        <h2 id="hasil" className="text-xl font-semibold">Keputusan</h2>
        <div className="mt-3 rounded border border-sage-200 bg-sage-50 p-5">
          <LabelChip label={decision.label} />
          <p className="mt-3 leading-relaxed">{decision.reason}</p>
          <p className="mt-1 text-sm text-mute">Ditentukan oleh aturan {decision.rule}.</p>
        </div>
        <ol className="mt-5 space-y-3">
          {steps.map((s) => (
            <li key={s.rule} className={`rounded border p-4 ${s.fired ? "border-forest-700 bg-white" : "border-sage-200"} ${!s.evaluated ? "opacity-45" : ""}`}>
              <p className="font-semibold">Aturan {s.rule}: {s.name}{s.fired && <span className="ml-2 text-sm font-medium text-forest-700">terpenuhi</span>}{!s.evaluated && <span className="ml-2 text-sm font-normal text-mute">tidak diperiksa</span>}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {s.conds.map((c) => (
                  <li key={c.text} className={c.ok ? "text-forest-700" : "text-mute"}>
                    <span aria-hidden="true">{c.ok ? "✓" : "✗"}</span> <span className="sr-only">{c.ok ? "Terpenuhi:" : "Tidak terpenuhi:"}</span> {c.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

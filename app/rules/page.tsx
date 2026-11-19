"use client";
import { useState } from "react";
import { decide, DEFAULT_EVIDENCE, Evidence, RULES } from "@/lib/rules";
import Tag from "@/components/Tag";
const SL: [keyof Evidence, number, number, number][] = [
  ["fK", 0, 1, 0.01], ["fC", 0, 1, 0.01], ["fB", 0, 1, 0.01], ["mB", -0.3, 1, 0.01], ["mC", -0.3, 1, 0.01], ["mK", -0.3, 1, 0.01],
  ["cB", -0.3, 1, 0.01], ["pB", 0, 1, 0.01], ["pK", 0, 1, 0.01], ["medNonTarget", -2, 14, 0.1], ["e", -5, 10, 0.1],
];
const PRESETS: Record<string, Partial<Evidence>> = {
  "c04 (zona abu-abu)": { fB: 0.07, mB: 0.29, cB: 0.48, pB: 0.5 },
  "c14 (zona abu-abu kuat)": { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 },
  "c02 (kakatua)": { fC: 0.43, pK: 0.1 },
  "c05 (Cendrawasih)": { fC: 0.93 },
  "c10 (bulbul)": { pK: 0.64, mK: 0.5, mB: 0.2, mC: 0.1 },
};
export default function Rules() {
  const [ev, setEv] = useState<Evidence>(DEFAULT_EVIDENCE);
  const d = decide(ev);
  return (<>
    <h1>Simulator Aturan Open-Set</h1>
    <p className="lead">Atur bukti satu cluster dan lihat aturan mana yang menentukan label (Laporan Bagian IV-D). Nilai preset yang tidak disebut di laporan memakai nilai default.</p>
    <div className="row" style={{ margin: "12px 0" }}>{Object.entries(PRESETS).map(([k, v]) =>
      <button key={k} className="btn2" onClick={() => setEv({ ...DEFAULT_EVIDENCE, ...v })}>{k}</button>)}</div>
    <div className="grid g2" style={{ alignItems: "start" }}>
      <div className="card">{SL.map(([k, lo, hi, st]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: "space-between" }}><b>{k}</b><span className="mut">{ev[k].toFixed(2)}</span></div>
          <input type="range" min={lo} max={hi} step={st} value={ev[k]} onChange={e => setEv({ ...ev, [k]: +e.target.value })} />
        </div>))}</div>
      <div>
        <div className="card"><div className="mut">Keputusan</div><div style={{ fontSize: 28 }}><Tag label={d.label} /></div>
          <p>Aturan {d.rule}: {d.reason}</p></div>
        <div className="card" style={{ marginTop: 14 }}>{RULES.map(r => (
          <div key={r.n} style={{ padding: "6px 0", opacity: r.n === d.rule ? 1 : 0.5, color: r.n === d.rule ? "var(--acc)" : undefined }}>
            <b>{r.n}. {r.t}</b><div className="mut">{r.d}</div></div>))}</div>
      </div>
    </div>
  </>);
}

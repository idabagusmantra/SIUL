// Aturan keputusan open-set tingkat cluster (Laporan IRIS Darsana, Bagian IV-D; notebook Bagian 5.3).
export type Label = "Bondol Jawa" | "Cendrawasih" | "Kutilang" | "Unknown";

export interface Evidence {
  fK: number; fC: number; fB: number;      // fraksi klip terdeteksi zero-shot (0 atau 1 pada mode klip tunggal)
  mB: number; mC: number; mK: number;      // median kemiripan ke centroid group latih terdekat
  cB: number;                              // kemiripan centroid cluster ke centroid group Bondol
  pB: number; pK: number;                  // rata-rata probabilitas classifier
  medNonTarget: number; e: number;         // veto spesies unknown
}

export interface Decision { label: Label; rule: number; reason: string }
export interface Cond { text: string; ok: boolean }
export interface Step { rule: number; name: string; conds: Cond[]; fired: boolean; evaluated: boolean }

export const DEFAULT_EVIDENCE: Evidence = {
  fK: 0, fC: 0, fB: 0, mB: 0.3, mC: 0.1, mK: 0.1, cB: 0.4, pB: 0.4, pK: 0.1, medNonTarget: 3, e: 0,
};

const n = (v: number, d = 2) => v.toFixed(d).replace(".", ",");

/** Menjalankan aturan 1–6 berurutan; aturan pertama yang terpenuhi menentukan label. */
export function evaluate(ev: Evidence): { decision: Decision; steps: Step[] } {
  const steps: Step[] = [];
  const out: { d: Decision | null } = { d: null };
  const add = (rule: number, name: string, conds: Cond[], pass: boolean, make: () => Decision) => {
    const evaluated = out.d === null;
    const fired = evaluated && pass;
    steps.push({ rule, name, conds, fired, evaluated });
    if (fired) out.d = make();
  };

  const zs = [{ l: "Kutilang" as Label, v: ev.fK, k: "fK" }, { l: "Cendrawasih" as Label, v: ev.fC, k: "fC" }, { l: "Bondol Jawa" as Label, v: ev.fB, k: "fB" }];
  const top = [...zs].sort((a, b) => b.v - a.v)[0];
  add(1, "Zero-shot mayoritas", zs.map((z) => ({ text: `${z.k} (${z.l}) ${n(z.v)} ≥ 0,50`, ok: z.v >= 0.5 })), top.v >= 0.5,
    () => ({ label: top.l, rule: 1, reason: `Zero-shot mayoritas: ${top.k} = ${n(top.v)} ≥ 0,50` }));

  add(2, "Kutilang lewat classifier",
    [{ text: `pK ${n(ev.pK)} ≥ 0,60`, ok: ev.pK >= 0.6 }, { text: `mK ${n(ev.mK)} ≥ maks(mB, mC, 0,25) = ${n(Math.max(ev.mB, ev.mC, 0.25))}`, ok: ev.mK >= Math.max(ev.mB, ev.mC, 0.25) }],
    ev.pK >= 0.6 && ev.mK >= Math.max(ev.mB, ev.mC, 0.25),
    () => ({ label: "Kutilang", rule: 2, reason: `Classifier Kutilang: pK = ${n(ev.pK)} ≥ 0,60 dan mK ≥ maks(mB, mC, 0,25)` }));

  add(3, "Veto spesies lain",
    [{ text: `Logit nontarget ${n(ev.medNonTarget, 1)} ≥ 7`, ok: ev.medNonTarget >= 7 }, { text: `e ${n(ev.e, 1)} ≥ 3`, ok: ev.e >= 3 }],
    ev.medNonTarget >= 7 && ev.e >= 3,
    () => ({ label: "Unknown", rule: 3, reason: `Veto spesies lain: logit nontarget ${n(ev.medNonTarget, 1)} ≥ 7 dan e = ${n(ev.e, 1)} ≥ 3` }));

  const b = [ev.mB >= 0.5, ev.cB >= 0.75, ev.mB > ev.mK, ev.pB >= 0.5];
  add(4, "Bondol lewat group saudara",
    [{ text: `mB ${n(ev.mB)} ≥ 0,50`, ok: b[0] }, { text: `cB ${n(ev.cB)} ≥ 0,75`, ok: b[1] }, { text: `mB ${n(ev.mB)} > mK ${n(ev.mK)}`, ok: b[2] }, { text: `pB ${n(ev.pB)} ≥ 0,50`, ok: b[3] }],
    b.every(Boolean),
    () => ({ label: "Bondol Jawa", rule: 4, reason: `Mirip "group saudara" Bondol: mB ${n(ev.mB)}, cB ${n(ev.cB)}, pB ${n(ev.pB)}` }));

  const k = [ev.mK >= 0.4, ev.pK >= 0.5, ev.fK >= 0.2];
  add(5, "Kutilang lewat kemiripan",
    [{ text: `mK ${n(ev.mK)} ≥ 0,40`, ok: k[0] }, { text: `pK ${n(ev.pK)} ≥ 0,50`, ok: k[1] }, { text: `fK ${n(ev.fK)} ≥ 0,20`, ok: k[2] }],
    k.every(Boolean),
    () => ({ label: "Kutilang", rule: 5, reason: `Kutilang lewat kemiripan: mK ${n(ev.mK)}, pK ${n(ev.pK)}, fK ${n(ev.fK)}` }));

  const none = out.d === null;
  steps.push({ rule: 6, name: "Bawaan", conds: [{ text: "Tidak ada bukti positif pada aturan 1–5", ok: none }], fired: none, evaluated: none });
  return { decision: out.d ?? { label: "Unknown", rule: 6, reason: "Tidak ada bukti positif, jadi diberi label Unknown (bawaan). Cendrawasih hanya lewat aturan 1." }, steps };
}

export const decide = (ev: Evidence): Decision => evaluate(ev).decision;

export const RULES = [
  { n: 1, t: "Zero-shot mayoritas", d: "f_c ≥ 0,5 → kelas c (satu-satunya jalur Cendrawasih)" },
  { n: 2, t: "Kutilang via classifier", d: "pK ≥ 0,6 dan mK ≥ maks(mB, mC, 0,25)" },
  { n: 3, t: "Veto spesies unknown", d: "median logit nontarget ≥ 7 dan e ≥ 3 → Unknown" },
  { n: 4, t: "Bondol via 'group saudara'", d: "mB ≥ 0,50, cB ≥ 0,75, mB > mK, pB ≥ 0,5" },
  { n: 5, t: "Kutilang via kemiripan", d: "mK ≥ 0,40, pK ≥ 0,5, fK ≥ 0,2" },
  { n: 6, t: "Default", d: "Selain itu → Unknown" },
];

export const LABEL_COLOR: Record<Label, string> = {
  "Bondol Jawa": "#2f6b3a", Cendrawasih: "#a3452c", Kutilang: "#c79a1e", Unknown: "#6b7280",
};

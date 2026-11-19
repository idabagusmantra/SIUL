// Aturan keputusan open-set tingkat cluster (Laporan IRIS Darsana, Bagian IV-D; notebook Bagian 5.3).
export type Label = "Bondol Jawa" | "Cendrawasih" | "Kutilang" | "Unknown";

export interface Evidence {
  fK: number; fC: number; fB: number;      // fraksi klip terdeteksi zero-shot
  mB: number; mC: number; mK: number;      // median kemiripan ke centroid group latih terdekat
  cB: number;                              // kemiripan centroid cluster ke centroid group Bondol
  pB: number; pK: number;                  // rata-rata probabilitas classifier
  medNonTarget: number; e: number;         // veto spesies unknown
}

export interface Decision { label: Label; rule: number; reason: string }

export const DEFAULT_EVIDENCE: Evidence = {
  fK: 0, fC: 0, fB: 0, mB: 0.3, mC: 0.1, mK: 0.1, cB: 0.4, pB: 0.4, pK: 0.1, medNonTarget: 3, e: 0,
};

export function decide(ev: Evidence): Decision {
  const f = [
    { l: "Kutilang" as Label, v: ev.fK, n: "fK" },
    { l: "Cendrawasih" as Label, v: ev.fC, n: "fC" },
    { l: "Bondol Jawa" as Label, v: ev.fB, n: "fB" },
  ].sort((a, b) => b.v - a.v)[0];
  if (f.v >= 0.5) return { label: f.l, rule: 1, reason: `Zero-shot mayoritas: ${f.n} = ${f.v.toFixed(2)} ≥ 0,50` };

  if (ev.pK >= 0.6 && ev.mK >= Math.max(ev.mB, ev.mC, 0.25))
    return { label: "Kutilang", rule: 2, reason: `Classifier Kutilang: pK = ${ev.pK.toFixed(2)} ≥ 0,60 dan mK ≥ maks(mB, mC, 0,25)` };

  if (ev.medNonTarget >= 7 && ev.e >= 3)
    return { label: "Unknown", rule: 3, reason: `Veto spesies unknown: logit nontarget ${ev.medNonTarget.toFixed(1)} ≥ 7 dan e = ${ev.e.toFixed(1)} ≥ 3` };

  if (ev.mB >= 0.5 && ev.cB >= 0.75 && ev.mB > ev.mK && ev.pB >= 0.5)
    return { label: "Bondol Jawa", rule: 4, reason: `Mirip "group saudara" Bondol: mB ${ev.mB.toFixed(2)}, cB ${ev.cB.toFixed(2)}, pB ${ev.pB.toFixed(2)}` };

  if (ev.mK >= 0.4 && ev.pK >= 0.5 && ev.fK >= 0.2)
    return { label: "Kutilang", rule: 5, reason: `Kutilang via kemiripan: mK ${ev.mK.toFixed(2)}, pK ${ev.pK.toFixed(2)}, fK ${ev.fK.toFixed(2)}` };

  return { label: "Unknown", rule: 6, reason: "Tidak ada bukti positif → Unknown (default). Cendrawasih hanya lewat aturan 1." };
}

export const RULES = [
  { n: 1, t: "Zero-shot mayoritas", d: "f_c ≥ 0,5 → kelas c (satu-satunya jalur Cendrawasih)" },
  { n: 2, t: "Kutilang via classifier", d: "pK ≥ 0,6 dan mK ≥ maks(mB, mC, 0,25)" },
  { n: 3, t: "Veto spesies unknown", d: "median logit nontarget ≥ 7 dan e ≥ 3 → Unknown" },
  { n: 4, t: "Bondol via 'group saudara'", d: "mB ≥ 0,50, cB ≥ 0,75, mB > mK, pB ≥ 0,5" },
  { n: 5, t: "Kutilang via kemiripan", d: "mK ≥ 0,40, pK ≥ 0,5, fK ≥ 0,2" },
  { n: 6, t: "Default", d: "Selain itu → Unknown" },
];

export const LABEL_COLOR: Record<Label, string> = {
  "Bondol Jawa": "#e5484d", Cendrawasih: "#f76b8a", Kutilang: "#f5c542", Unknown: "#8b8d98",
};

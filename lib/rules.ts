import type { Kind } from "@/components/Birds";

export type Label = "Bondol Jawa" | "Cendrawasih" | "Kutilang" | "Unknown";
export const LABELS: Label[] = ["Bondol Jawa", "Cendrawasih", "Kutilang", "Unknown"];
export const KIND: Record<Label, Kind> = { "Bondol Jawa": "bondol", Cendrawasih: "cendrawasih", Kutilang: "kutilang", Unknown: "unknown" };
export const LABEL_COLOR: Record<Label, string> = { "Bondol Jawa": "#8a5a3a", Cendrawasih: "#c9a227", Kutilang: "#2f7f86", Unknown: "#8b9690" };

/** Bukti tingkat cluster (satu kelompok sumber). */
export interface Evidence {
  fK: number; fC: number; fB: number; // fraksi klip terdeteksi zero-shot
  mB: number; mC: number; mK: number; // median kemiripan ke centroid group latih terdekat
  cB: number;                         // kemiripan centroid cluster ke group Bondol latih
  pB: number; pK: number;             // rata-rata probabilitas classifier
  medNonTarget: number; e: number;    // bukti veto spesies lain
}
/** Bukti tingkat klip tunggal. */
export interface ClipEvidence {
  kaur: number; ksib: number; blon: number; cpar: number; // logit zero-shot Perch
  pB: number; pC: number; pK: number;                     // probabilitas LogReg
  mB: number; mC: number; mK: number; cB: number;         // kemiripan ke centroid group latih
  medNonTarget: number; e: number;
}
export interface Decision { label: Label; rule: number; reason: string }

export const DEFAULT_EVIDENCE: Evidence = { fK: 0, fC: 0, fB: 0, mB: 0.3, mC: 0.1, mK: 0.1, cB: 0.4, pB: 0.4, pK: 0.1, medNonTarget: 3, e: 0 };
export const THRESHOLDS = { kutilang: { kaur: 5, ksib: -1.5 }, cendrawasih: { cpar: 4 }, bondol: { blon: 6 } };
/** Ambang detektor "kuat" (ZS_STRONG di model). Cendrawasih tidak ikut membalik label klip (c_clip_flip = false). */
export const STRONG = { kutilang: { kaur: 6.5, ksib: 0 }, bondol: { blon: 7.5 } };

const p2 = (v: number) => v.toFixed(2).replace(".", ",");

/** Aturan keputusan per cluster, berurutan; tanpa bukti positif hasilnya Unknown. */
export function decide(ev: Evidence): Decision {
  // Urutan Bondol, Cendrawasih, Kutilang sama dengan backend: saat seri, yang pertama menang.
  const top = [
    { l: "Bondol Jawa" as Label, v: ev.fB, n: "fB" },
    { l: "Cendrawasih" as Label, v: ev.fC, n: "fC" },
    { l: "Kutilang" as Label, v: ev.fK, n: "fK" },
  ].reduce((best, c) => (c.v > best.v ? c : best));
  if (top.v >= 0.5) return { label: top.l, rule: 1, reason: `Mayoritas klip terdeteksi zero-shot (${top.n} = ${p2(top.v)}, ambang 0,50).` };
  if (ev.pK >= 0.6 && ev.mK >= Math.max(ev.mB, ev.mC, 0.25))
    return { label: "Kutilang", rule: 2, reason: `Probabilitas Kutilang ${p2(ev.pK)} (≥ 0,60) dan kemiripan tertinggi ke group Kutilang.` };
  if (ev.medNonTarget >= 7 && ev.e >= 3)
    return { label: "Unknown", rule: 3, reason: `Veto: spesies lain terdeteksi sangat kuat (logit ${ev.medNonTarget.toFixed(1)}, selisih ${ev.e.toFixed(1)}).` };
  if (ev.mB >= 0.5 && ev.cB >= 0.75 && ev.mB > ev.mK && ev.pB >= 0.5)
    return { label: "Bondol Jawa", rule: 4, reason: `Sangat mirip group Bondol Jawa yang dikenal (mB ${p2(ev.mB)}, cB ${p2(ev.cB)}, pB ${p2(ev.pB)}).` };
  if (ev.mK >= 0.4 && ev.pK >= 0.5 && ev.fK >= 0.2)
    return { label: "Kutilang", rule: 5, reason: `Kemiripan ke group Kutilang memadai (mK ${p2(ev.mK)}, pK ${p2(ev.pK)}, fK ${p2(ev.fK)}).` };
  return { label: "Unknown", rule: 6, reason: "Tidak ada bukti positif yang cukup, sehingga dikembalikan sebagai Unknown. Cendrawasih hanya dapat ditetapkan lewat aturan 1." };
}

export function detectors(c: ClipEvidence) {
  return {
    kutilang: c.kaur >= THRESHOLDS.kutilang.kaur && c.ksib >= THRESHOLDS.kutilang.ksib,
    bondol: c.blon >= THRESHOLDS.bondol.blon,
    cendrawasih: c.cpar >= THRESHOLDS.cendrawasih.cpar,
  };
}

/** Evaluasi mandiri satu klip: detektor zero-shot menjadi "fraksi" 0/1, sisanya memakai aturan yang sama, lalu strong flip seperti backend. */
export function decideClip(c: ClipEvidence): Decision {
  const d = detectors(c);
  let r = decide({ fK: d.kutilang ? 1 : 0, fC: d.cendrawasih ? 1 : 0, fB: d.bondol ? 1 : 0, mB: c.mB, mC: c.mC, mK: c.mK, cB: c.cB, pB: c.pB, pK: c.pK, medNonTarget: c.medNonTarget, e: c.e });
  if (r.rule === 1) r = { ...r, reason: `Detektor zero-shot ${r.label} terpicu pada klip ini.` };
  const strongB = c.blon >= STRONG.bondol.blon;
  const strongK = c.kaur >= STRONG.kutilang.kaur && c.ksib >= STRONG.kutilang.ksib;
  if (strongB !== strongK) { // tepat satu detektor kuat
    const target: Label = strongK ? "Kutilang" : "Bondol Jawa";
    if (strongK ? r.label !== "Kutilang" : r.label === "Unknown")
      return { label: target, rule: 1, reason: `Detektor zero-shot kuat ${target} terpicu pada klip ini.` };
  }
  return r;
}

export const RULES = [
  { n: 1, t: "Zero-shot mayoritas", d: "Sebagian besar klip memicu detektor taksonomi satu kelas. Satu-satunya jalur menuju Cendrawasih." },
  { n: 2, t: "Kutilang via classifier", d: "Probabilitas Kutilang ≥ 0,60 dan kemiripan tertinggi ke group Kutilang." },
  { n: 3, t: "Veto spesies lain", d: "Spesies non-target terdeteksi sangat kuat (logit ≥ 7, selisih ≥ 3) → Unknown." },
  { n: 4, t: "Bondol via group saudara", d: "mB ≥ 0,50, cB ≥ 0,75, mB > mK, dan pB ≥ 0,50." },
  { n: 5, t: "Kutilang via kemiripan", d: "mK ≥ 0,40, pK ≥ 0,50, dan fK ≥ 0,20." },
  { n: 6, t: "Bawaan: Unknown", d: "Tanpa bukti positif, label tidak dipaksakan." },
];

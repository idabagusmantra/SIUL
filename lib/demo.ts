// MODE DEMONSTRASI: bukan prediksi model. Nilai bukti dibangkitkan deterministik dari nama berkas
// supaya seluruh alur antarmuka dapat dicoba tanpa backend.
import { decide, decideClip, type ClipEvidence, type Evidence } from "./rules";
import type { BatchClip, BatchCluster, BatchResponse, SingleResponse } from "./types";

function hash(s: string) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; }
const rnd = (seed: number, i: number) => ((Math.imul(seed ^ Math.imul(i + 1, 2654435761), 1597334677) >>> 0) % 10000) / 10000;
const between = (seed: number, i: number, a: number, b: number) => a + rnd(seed, i) * (b - a);

function clipEvidence(name: string): ClipEvidence {
  const s = hash(name), r = (i: number, a: number, b: number) => between(s, i, a, b);
  const base: ClipEvidence = { kaur: r(1, -2, 2), ksib: r(2, -3, -1), blon: r(3, 0, 3), cpar: r(4, 0, 2.5), pB: r(5, 0.1, 0.4), pC: r(6, 0.05, 0.25), pK: r(7, 0.05, 0.25), mB: r(8, 0.1, 0.35), mC: r(9, 0, 0.2), mK: r(10, 0, 0.3), cB: r(11, 0.1, 0.45), medNonTarget: r(12, 2, 5), e: r(13, -1, 1.5) };
  switch (s % 6) {
    case 0: return { ...base, kaur: r(20, 6, 9), ksib: r(21, 0.5, 2.5), pK: r(22, 0.8, 0.97), mK: r(23, 0.55, 0.75) };
    case 1: return { ...base, blon: r(20, 6.5, 9), pB: r(21, 0.75, 0.95), mB: r(22, 0.5, 0.7), cB: r(23, 0.7, 0.9) };
    case 2: return { ...base, pB: r(20, 0.75, 0.95), mB: r(21, 0.55, 0.7), cB: r(22, 0.78, 0.92), mK: r(23, 0.1, 0.3) };
    case 3: return { ...base, cpar: r(20, 4.5, 7), pC: r(21, 0.4, 0.7) };
    case 4: return { ...base, medNonTarget: r(20, 8, 11), e: r(21, 3.5, 6), mB: r(22, 0.3, 0.5) };
    default: return base;
  }
}

export function demoSingle(name: string): SingleResponse {
  const evidence = clipEvidence(name);
  return { mode: "demo", result: { file: name, evidence, ...decideClip(evidence) } };
}

const ARCH: Evidence[] = [
  { fK: 0.82, fC: 0.05, fB: 0.02, mB: 0.2, mC: 0.1, mK: 0.7, cB: 0.2, pB: 0.1, pK: 0.9, medNonTarget: 3, e: 0 },
  { fK: 0.02, fC: 0.03, fB: 0.88, mB: 0.62, mC: 0.1, mK: 0.2, cB: 0.8, pB: 0.88, pK: 0.05, medNonTarget: 3, e: 0 },
  { fK: 0.01, fC: 0.02, fB: 0.06, mB: 0.62, mC: 0.1, mK: 0.25, cB: 0.86, pB: 0.84, pK: 0.08, medNonTarget: 4, e: 0.5 },
  { fK: 0.02, fC: 0.76, fB: 0.02, mB: 0.2, mC: 0.3, mK: 0.1, cB: 0.3, pB: 0.2, pK: 0.05, medNonTarget: 3, e: 0 },
  { fK: 0.03, fC: 0.12, fB: 0.04, mB: 0.2, mC: 0.1, mK: 0.15, cB: 0.3, pB: 0.3, pK: 0.15, medNonTarget: 7.8, e: 3.4 },
];

export function demoBatch(names: string[]): BatchResponse {
  const k = Math.min(5, Math.max(2, Math.ceil(names.length / 4)));
  const groups = new Map<number, string[]>();
  for (const n of names) { const g = hash(n) % k; groups.set(g, [...(groups.get(g) ?? []), n]); }
  const clips: BatchClip[] = [], clusters: BatchCluster[] = [];
  let idx = 0;
  for (const [g, files] of [...groups].sort((a, b) => a[0] - b[0])) {
    const id = `S${String(idx + 1).padStart(2, "0")}`;
    const seed = hash(id + files.length);
    const a = ARCH[(g + hash(names[0])) % ARCH.length];
    const evidence = Object.fromEntries(Object.entries(a).map(([key, v], i) => [key, Math.max(0, v + between(seed, i, -0.04, 0.04))])) as unknown as Evidence;
    const dec = decide(evidence);
    const ang = (idx / groups.size) * Math.PI * 2 + 0.6;
    files.forEach((file, j) => clips.push({ file, cluster: id, label: dec.label, x: Math.cos(ang) * 0.58 + between(hash(file), j, -0.2, 0.2), y: Math.sin(ang) * 0.58 + between(hash(file), j + 9, -0.2, 0.2) }));
    clusters.push({ id, n: files.length, files, evidence, agreement: between(seed, 30, 0.9, 1), ...dec });
    idx++;
  }
  return { mode: "demo", clips, clusters };
}

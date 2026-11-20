// Mode DEMO: bukan inferensi nyata. Bukti dibangkitkan deterministik dari nama berkas
// agar alur UI bisa dicoba tanpa backend. Ganti dengan backend FastAPI (lihat backend/).
import { decide, Evidence } from "./rules";
import type { AnalyzeMode, AnalyzeResponse, ClusterResult } from "./types";

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const base: Evidence = { fK: 0, fC: 0, fB: 0, mB: 0.2, mC: 0.15, mK: 0.15, cB: 0.3, pB: 0.2, pK: 0.15, medNonTarget: 3, e: 0 };
const ARCH: Evidence[] = [
  { ...base, fK: 0.9, mK: 0.6, pK: 0.9 },
  { ...base, fB: 0.9, mB: 0.4, cB: 0.5, pB: 0.85 },
  { ...base, mB: 0.6, cB: 0.89, pB: 0.8 },
  { ...base, fC: 0.93, mC: 0.4 },
  { ...base },
  { ...base, mB: 0.3, medNonTarget: 8.5, e: 4 },
];
const jit = (v: number, r: () => number, s = 0.06) => Math.max(-0.2, Math.min(1, v + (r() - 0.5) * s * 2));

function evidenceFor(seed: number, single: boolean): Evidence {
  const r = rng(seed);
  const a = ARCH[Math.floor(r() * ARCH.length)];
  const f = (v: number) => (single ? (r() < v ? 1 : 0) : jit(Math.max(v, 0.02), r));
  return {
    fK: f(a.fK), fC: f(a.fC), fB: f(a.fB),
    mB: jit(a.mB, r), mC: jit(a.mC, r), mK: jit(a.mK, r), cB: jit(a.cB, r), pB: jit(a.pB, r), pK: jit(a.pK, r),
    medNonTarget: a.medNonTarget + (r() - 0.5), e: Math.max(0, a.e + (r() - 0.5)),
  };
}

export function demoAnalyze(files: { name: string; size: number }[], kind: AnalyzeMode): AnalyzeResponse {
  const groups: string[][] = [];
  if (kind === "single") groups.push([files[0].name]);
  else {
    const k = Math.min(6, Math.max(2, Math.round(files.length / 5)));
    const g: string[][] = Array.from({ length: k }, () => []);
    files.forEach((f) => g[hash(f.name) % k].push(f.name));
    groups.push(...g.filter((x) => x.length));
  }
  const clusters: ClusterResult[] = groups.map((fs, i) => {
    const ev = evidenceFor(hash(fs.join("|") + (kind === "single" ? files[0].size : "")), kind === "single");
    return { cluster: kind === "single" ? "klip" : `c${String(i).padStart(2, "0")}`, n: fs.length, files: fs, evidence: ev, ...decide(ev) };
  });
  return { mode: "demo", kind, clusters };
}

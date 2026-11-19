// Mode DEMO: bukan inferensi nyata. Bukti dibangkitkan deterministik dari nama berkas
// agar alur UI bisa dicoba tanpa backend. Ganti dengan backend FastAPI (lihat backend/).
import { decide, Evidence, Label } from "./rules";
function h(s: string) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; }
const r = (seed: number, i: number) => ((Math.imul(seed ^ (i * 2654435761), 1597334677) >>> 0) % 1000) / 1000;
export interface ClipResult { file: string; cluster: string; size: number }
export interface ClusterResult { cluster: string; n: number; files: string[]; evidence: Evidence; label: Label; rule: number; reason: string }
export function demoAnalyze(files: { name: string; size: number }[], k = 3) {
  const groups = new Map<string, string[]>();
  for (const f of files) { const id = "u" + (h(f.name) % k); groups.set(id, [...(groups.get(id) ?? []), f.name]); }
  const clusters: ClusterResult[] = [...groups].map(([id, fs]) => {
    const s = h(id); const rr = (i: number) => r(s, i);
    const ev: Evidence = { fK: rr(1) * 0.9, fC: rr(2) * 0.4, fB: rr(3) * 0.9, mB: rr(4) * 0.8, mC: rr(5) * 0.3, mK: rr(6) * 0.7, cB: rr(7), pB: rr(8), pK: rr(9), medNonTarget: rr(10) * 10, e: rr(11) * 6 - 1 };
    return { cluster: id, n: fs.length, files: fs, evidence: ev, ...decide(ev) };
  });
  return { mode: "demo" as const, clusters };
}

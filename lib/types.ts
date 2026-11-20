import type { Evidence, Label } from "./rules";

export type AnalyzeMode = "single" | "batch";

/** Satu unit keputusan: satu cluster sumber (batch) atau satu klip (single, n = 1). */
export interface ClusterResult {
  cluster: string; n: number; files: string[]; evidence: Evidence; label: Label; rule: number; reason: string;
}

/** Respons /api/analyze. `mode` = asal hasil; `kind` = mode inferensi yang diminta. */
export interface AnalyzeResponse { mode: "demo" | "live"; kind: AnalyzeMode; clusters: ClusterResult[] }

import type { ClipEvidence, Decision, Evidence, Label } from "./rules";

export type Mode = "demo" | "live";
export interface ClipResult extends Decision { file: string; evidence: ClipEvidence }
export interface SingleResponse { mode: Mode; result: ClipResult }

export interface BatchClip { file: string; cluster: string; label: Label; x: number; y: number }
export interface BatchCluster extends Decision {
  id: string; n: number; files: string[]; evidence: Evidence;
  agreement?: number; // 0-1, kesepakatan voting antarsetelan clustering
}
export interface BatchResponse { mode: Mode; clips: BatchClip[]; clusters: BatchCluster[] }
export interface StatusResponse { mode: Mode; backendOk: boolean | null }

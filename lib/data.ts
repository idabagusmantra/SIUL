// Seluruh angka berasal dari laporan teknis & notebook tim IRIS Darsana (NPC DSC 2026).
import type { Label } from "./rules";

export const HEADLINE = [
  { k: "0,97643", l: "Skor LB publik (macro-F1)", s: "dari baseline 0,69" },
  { k: "0,923", l: "Macro-F1 LOGO closed-set", s: "ensemble prof+hf+pe" },
  { k: "0,941", l: "Kemurnian cluster dengan WCCN", s: "dari 0,796 tanpa WCCN" },
  { k: "0,929", l: "Macro-F1 simulasi unknown", s: "vs 0,793 baseline MSP" },
];

export interface ClusterRow {
  id: string; n: number; species: string; rule: Label; final: Label; basis: string;
  ev?: Record<string, number>;
}
export const CLUSTERS: ClusterRow[] = [
  { id: "c00", n: 102, species: "Pycnonotus aurigaster, Mimus polyglottos", rule: "Kutilang", final: "Kutilang", basis: "zero-shot Kutilang 0,81" },
  { id: "c01", n: 63, species: "Pycnonotus goiavier, Mimus polyglottos", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c02", n: 61, species: "Cacatua galerita, Garrulus glandarius", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown", ev: { fC: 0.43, pC: 0.92 } },
  { id: "c03", n: 61, species: "Lonchura striata, Stelgidopteryx ruficollis", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,98" },
  { id: "c04", n: 57, species: "Pseudacris crucifer, Cyanocitta cristata", rule: "Unknown", final: "Bondol Jawa", basis: "koreksi leaderboard (probe naik)", ev: { fB: 0.07, mB: 0.29, cB: 0.48, pB: 0.5 } },
  { id: "c05", n: 42, species: "Paradisaea minor, Herpetotheres cachinnans", rule: "Cendrawasih", final: "Cendrawasih", basis: "zero-shot Cendrawasih 0,93", ev: { fC: 0.93 } },
  { id: "c06", n: 41, species: "Copsychus malabaricus, Turdus merula", rule: "Unknown", final: "Unknown", basis: "veto: Copsychus malabaricus (7,5)" },
  { id: "c07", n: 38, species: "Dumetella carolinensis, Sturnus vulgaris", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c08", n: 37, species: "Sturnus vulgaris, Turdus merula", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c09", n: 33, species: "Acrocephalus australis, Luscinia luscinia", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (privat)" },
  { id: "c10", n: 31, species: "Mimus polyglottos, Cercotrichas leucophrys", rule: "Kutilang", final: "Kutilang", basis: "classifier Kutilang 0,64 (tipe bulbul)", ev: { pK: 0.64 } },
  { id: "c11", n: 30, species: "Pseudacris crucifer, Phylloscopus collybita", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,87" },
  { id: "c12", n: 29, species: "Sicalis luteola, Coereba flaveola", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (zona abu-abu)", ev: { fB: 0, mB: 0.18, cB: 0.25, pB: 0.49 } },
  { id: "c13", n: 29, species: "Lonchura punctulata, Actitis macularius", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,97" },
  { id: "c14", n: 29, species: "Melospiza melodia, Thryomanes bewickii", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (privat, zona abu-abu)", ev: { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 } },
  { id: "c15", n: 28, species: "Serinus canaria, Poecile palustris", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "mirip group Bondol", ev: { mB: 0.6, cB: 0.89 } },
  { id: "c16", n: 24, species: "Anthus trivialis, Serinus canaria", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (zona abu-abu)", ev: { fB: 0.04, mB: 0.32, cB: 0.43, pB: 0.46 } },
  { id: "c17", n: 17, species: "Copsychus malabaricus, Mimus polyglottos", rule: "Unknown", final: "Unknown", basis: "veto: Copsychus malabaricus (8,8)" },
  { id: "c18", n: 17, species: "Spinus spinus, Lonchura punctulata", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,82" },
  { id: "c19", n: 17, species: "Pycnonotus aurigaster, Pycnonotus barbatus", rule: "Kutilang", final: "Kutilang", basis: "zero-shot Kutilang 1,00" },
  { id: "c20", n: 16, species: "Chloris chloris, Phylloscopus trochilus", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "mirip group Bondol", ev: { mB: 0.65, cB: 0.92 } },
  { id: "c21", n: 12, species: "Lonchura punctulata, Spinus spinus", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,92" },
];

export const FINAL_DIST = [
  { label: "Bondol Jawa" as Label, n: 247 }, { label: "Cendrawasih" as Label, n: 42 },
  { label: "Kutilang" as Label, n: 150 }, { label: "Unknown" as Label, n: 375 },
];

// Tabel XII — validasi aturan open-set per sumber (LOGO)
export const LOGO_SOURCES = [
  { g: "d20bbb", label: "Bondol", n: 336, ok: true, basis: "mirip group Bondol" },
  { g: "6b8570", label: "Bondol", n: 232, ok: true, basis: "mirip group Bondol" },
  { g: "c04cd5", label: "Bondol", n: 176, ok: true, basis: "mirip group Bondol" },
  { g: "90eace", label: "Bondol", n: 123, ok: true, basis: "mirip group Bondol" },
  { g: "100f6c", label: "Bondol", n: 117, ok: false, basis: "veto: Passerina ciris (12,0)" },
  { g: "347254", label: "Bondol", n: 82, ok: false, basis: "bukti kurang" },
  { g: "feb851", label: "Bondol", n: 58, ok: true, basis: "zero-shot Bondol 1,00" },
  { g: "8a3900", label: "Cendrawasih", n: 35, ok: true, basis: "zero-shot 0,71" },
  { g: "6895fb", label: "Cendrawasih", n: 29, ok: true, basis: "zero-shot 0,86" },
  { g: "660c17", label: "Cendrawasih", n: 16, ok: false, basis: "bukti kurang" },
  { g: "d7bc3d", label: "Cendrawasih", n: 3, ok: false, basis: "veto: Picus canus (8,8)" },
  { g: "e6af04", label: "Kutilang", n: 178, ok: true, basis: "zero-shot 0,99" },
  { g: "81213a", label: "Kutilang", n: 166, ok: true, basis: "zero-shot 1,00" },
  { g: "81b28e", label: "Kutilang", n: 143, ok: true, basis: "zero-shot 0,87" },
  { g: "0d9c30", label: "Kutilang", n: 132, ok: true, basis: "zero-shot 0,86" },
];

// Tabel XIII — ablasi simulasi open-set
export const ABLATION = [
  { v: "Pipeline lengkap", f1: 0.929 }, { v: "Tanpa WCCN", f1: 0.881 },
  { v: "Tanpa aturan 1", f1: 0.696 }, { v: "Jalur kemiripan Cendr. aktif", f1: 0.758 },
  { v: "Keputusan per klip", f1: 0.712 }, { v: "Baseline MSP (τ=0,90)", f1: 0.793 },
];

// Tabel IX — riwayat leaderboard
export const LB_HISTORY = [
  { v: "v1", lb: 0.69 }, { v: "v3", lb: 0.645 }, { v: "v4", lb: 0.568 }, { v: "v5", lb: 0.45 },
  { v: "v7", lb: 0.52 }, { v: "v10", lb: 0.89226 }, { v: "Akhir", lb: 0.97643 },
];

export const CLOSED_SET = [
  { view: "prof", f1: 0.914 }, { view: "hf", f1: 0.872 }, { view: "pe", f1: 0.87 },
  { view: "bn", f1: 0.824 }, { view: "Ensemble", f1: 0.923 },
];

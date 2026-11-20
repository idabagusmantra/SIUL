// Hasil clustering acuan pada data uji penelitian (Tabel XXII laporan tim IRIS Darsana).
import type { Label } from "./rules";

export interface ClusterRow {
  id: string; n: number; species: string; rule: Label; final: Label; basis: string;
  ev?: Record<string, number>;
}
export const CLUSTERS: ClusterRow[] = [
  { id: "c00", n: 102, species: "Pycnonotus aurigaster, Mimus polyglottos", rule: "Kutilang", final: "Kutilang", basis: "zero-shot Kutilang 0,81" },
  { id: "c01", n: 63, species: "Pycnonotus goiavier, Mimus polyglottos", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c02", n: 61, species: "Cacatua galerita, Garrulus glandarius", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown", ev: { fC: 0.43, pC: 0.92 } },
  { id: "c03", n: 61, species: "Lonchura striata, Stelgidopteryx ruficollis", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,98" },
  { id: "c04", n: 57, species: "Pseudacris crucifer, Cyanocitta cristata", rule: "Unknown", final: "Bondol Jawa", basis: "koreksi manual setelah verifikasi eksternal", ev: { fB: 0.07, mB: 0.29, cB: 0.48, pB: 0.5 } },
  { id: "c05", n: 42, species: "Paradisaea minor, Herpetotheres cachinnans", rule: "Cendrawasih", final: "Cendrawasih", basis: "zero-shot Cendrawasih 0,93", ev: { fC: 0.93 } },
  { id: "c06", n: 41, species: "Copsychus malabaricus, Turdus merula", rule: "Unknown", final: "Unknown", basis: "veto: Copsychus malabaricus (7,5)" },
  { id: "c07", n: 38, species: "Dumetella carolinensis, Sturnus vulgaris", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c08", n: 37, species: "Sturnus vulgaris, Turdus merula", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown" },
  { id: "c09", n: 33, species: "Acrocephalus australis, Luscinia luscinia", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (belum terverifikasi)" },
  { id: "c10", n: 31, species: "Mimus polyglottos, Cercotrichas leucophrys", rule: "Kutilang", final: "Kutilang", basis: "classifier Kutilang 0,64 (tipe bulbul)", ev: { pK: 0.64 } },
  { id: "c11", n: 30, species: "Pseudacris crucifer, Phylloscopus collybita", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,87" },
  { id: "c12", n: 29, species: "Sicalis luteola, Coereba flaveola", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (zona abu-abu)", ev: { fB: 0, mB: 0.18, cB: 0.25, pB: 0.49 } },
  { id: "c13", n: 29, species: "Lonchura punctulata, Actitis macularius", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,97" },
  { id: "c14", n: 29, species: "Melospiza melodia, Thryomanes bewickii", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (zona abu-abu, belum terverifikasi)", ev: { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 } },
  { id: "c15", n: 28, species: "Serinus canaria, Poecile palustris", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "mirip group Bondol", ev: { mB: 0.6, cB: 0.89 } },
  { id: "c16", n: 24, species: "Anthus trivialis, Serinus canaria", rule: "Unknown", final: "Unknown", basis: "bukti kurang → Unknown (zona abu-abu)", ev: { fB: 0.04, mB: 0.32, cB: 0.43, pB: 0.46 } },
  { id: "c17", n: 17, species: "Copsychus malabaricus, Mimus polyglottos", rule: "Unknown", final: "Unknown", basis: "veto: Copsychus malabaricus (8,8)" },
  { id: "c18", n: 17, species: "Spinus spinus, Lonchura punctulata", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,82" },
  { id: "c19", n: 17, species: "Pycnonotus aurigaster, Pycnonotus barbatus", rule: "Kutilang", final: "Kutilang", basis: "zero-shot Kutilang 1,00" },
  { id: "c20", n: 16, species: "Chloris chloris, Phylloscopus trochilus", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "mirip group Bondol", ev: { mB: 0.65, cB: 0.92 } },
  { id: "c21", n: 12, species: "Lonchura punctulata, Spinus spinus", rule: "Bondol Jawa", final: "Bondol Jawa", basis: "zero-shot Bondol 0,92" },
];

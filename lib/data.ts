import type { Label } from "./rules";

export interface ClusterRow { id: string; n: number; species: string; label: Label; basis: string; grey?: boolean; manual?: boolean; ev?: Record<string, number> }

// Katalog kelompok sumber dari clustering acuan pada 814 klip uji referensi. "species" adalah spesies teratas menurut Perch.
export const CLUSTERS: ClusterRow[] = [
  { id: "c00", n: 102, species: "Pycnonotus aurigaster, Mimus polyglottos", label: "Kutilang", basis: "Detektor zero-shot Kutilang pada 81% klip" },
  { id: "c01", n: 63, species: "Pycnonotus goiavier, Mimus polyglottos", label: "Unknown", basis: "Bukti positif tidak cukup" },
  { id: "c02", n: 61, species: "Cacatua galerita, Garrulus glandarius", label: "Unknown", basis: "Mirip kakatua; detektor Cendrawasih terpicu sebagian (43%) namun di bawah ambang", ev: { fC: 0.43, pC: 0.92 } },
  { id: "c03", n: 61, species: "Lonchura striata, Stelgidopteryx ruficollis", label: "Bondol Jawa", basis: "Detektor zero-shot Bondol pada 98% klip" },
  { id: "c04", n: 57, species: "Pseudacris crucifer, Cyanocitta cristata", label: "Bondol Jawa", basis: "Koreksi manual setelah verifikasi eksternal; bukti model berada di zona abu-abu", grey: true, manual: true, ev: { fB: 0.07, mB: 0.29, cB: 0.48, pB: 0.5 } },
  { id: "c05", n: 42, species: "Paradisaea minor, Herpetotheres cachinnans", label: "Cendrawasih", basis: "Detektor zero-shot Paradisaeidae pada 93% klip", ev: { fC: 0.93 } },
  { id: "c06", n: 41, species: "Copsychus malabaricus, Turdus merula", label: "Unknown", basis: "Veto: Murai Batu terdeteksi kuat (logit 7,5)" },
  { id: "c07", n: 38, species: "Dumetella carolinensis, Sturnus vulgaris", label: "Unknown", basis: "Bukti positif tidak cukup" },
  { id: "c08", n: 37, species: "Sturnus vulgaris, Turdus merula", label: "Unknown", basis: "Bukti positif tidak cukup" },
  { id: "c09", n: 33, species: "Acrocephalus australis, Luscinia luscinia", label: "Unknown", basis: "Bukti positif tidak cukup" },
  { id: "c10", n: 31, species: "Mimus polyglottos, Cercotrichas leucophrys", label: "Kutilang", basis: "Probabilitas classifier Kutilang 0,64 (kicauan bulbul yang tidak dikenali Perch)", ev: { pK: 0.64 } },
  { id: "c11", n: 30, species: "Pseudacris crucifer, Phylloscopus collybita", label: "Bondol Jawa", basis: "Detektor zero-shot Bondol pada 87% klip" },
  { id: "c12", n: 29, species: "Sicalis luteola, Coereba flaveola", label: "Unknown", basis: "Zona abu-abu: kemiripan ke group Bondol di bawah ambang", grey: true, ev: { fB: 0, mB: 0.18, cB: 0.25, pB: 0.49 } },
  { id: "c13", n: 29, species: "Lonchura punctulata, Actitis macularius", label: "Bondol Jawa", basis: "Detektor zero-shot Bondol pada 97% klip" },
  { id: "c14", n: 29, species: "Melospiza melodia, Thryomanes bewickii", label: "Unknown", basis: "Zona abu-abu: kemiripan ke group Bondol cukup tinggi namun di bawah ambang", grey: true, ev: { fB: 0.07, mB: 0.41, cB: 0.65, pB: 0.8 } },
  { id: "c15", n: 28, species: "Serinus canaria, Poecile palustris", label: "Bondol Jawa", basis: "Sangat mirip group Bondol latih", ev: { mB: 0.6, cB: 0.89 } },
  { id: "c16", n: 24, species: "Anthus trivialis, Serinus canaria", label: "Unknown", basis: "Zona abu-abu: bukti Bondol lemah", grey: true, ev: { fB: 0.04, mB: 0.32, cB: 0.43, pB: 0.46 } },
  { id: "c17", n: 17, species: "Copsychus malabaricus, Mimus polyglottos", label: "Unknown", basis: "Veto: Murai Batu terdeteksi kuat (logit 8,8)" },
  { id: "c18", n: 17, species: "Spinus spinus, Lonchura punctulata", label: "Bondol Jawa", basis: "Detektor zero-shot Bondol pada 82% klip" },
  { id: "c19", n: 17, species: "Pycnonotus aurigaster, Pycnonotus barbatus", label: "Kutilang", basis: "Detektor zero-shot Kutilang pada 100% klip" },
  { id: "c20", n: 16, species: "Chloris chloris, Phylloscopus trochilus", label: "Bondol Jawa", basis: "Sangat mirip group Bondol latih", ev: { mB: 0.65, cB: 0.92 } },
  { id: "c21", n: 12, species: "Lonchura punctulata, Spinus spinus", label: "Bondol Jawa", basis: "Detektor zero-shot Bondol pada 92% klip" },
];

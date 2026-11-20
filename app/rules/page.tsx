import type { Metadata } from "next";
import Simulator from "./Simulator";

export const metadata: Metadata = { title: "Aturan Penolakan Open-Set" };

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Simulator Aturan Penolakan</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-mute">
        Ubah nilai bukti, lalu lihat aturan mana yang menentukan label. Label Unknown adalah bawaan; kelas dikenal hanya diberikan bila satu aturan terpenuhi, diperiksa berurutan dari aturan 1 sampai 5.
      </p>
      <Simulator />
    </div>
  );
}

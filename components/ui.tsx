import { LABEL_COLOR, type Label } from "@/lib/rules";

const CHIP: Record<Label, string> = {
  "Bondol Jawa": "bg-[#e3efe0] text-[#1b4d2d]",
  Cendrawasih: "bg-[#f6e3dc] text-[#7a2f1c]",
  Kutilang: "bg-[#f7ecc9] text-[#6b5208]",
  Unknown: "bg-[#e9ebe8] text-[#3d4540]",
};

export function LabelChip({ label }: { label: Label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${CHIP[label]}`}>
      <span className="h-2 w-2 rounded-full" style={{ background: LABEL_COLOR[label] }} />
      {label}
    </span>
  );
}

export function Bar({ name, value, max = 1 }: { name: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2.8rem] items-center gap-2 text-xs">
      <span className="text-mute">{name}</span>
      <span className="h-2 overflow-hidden rounded-full bg-sage-100"><span className="block h-full rounded-full bg-forest-600" style={{ width: `${pct}%` }} /></span>
      <span className="text-right tabular-nums text-ink">{value.toFixed(2).replace(".", ",")}</span>
    </div>
  );
}

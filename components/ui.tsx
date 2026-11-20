import type { ReactNode } from "react";
import { LABEL_COLOR, type Label } from "@/lib/rules";
import { Topo } from "./Topo";

export function LabelBadge({ label, className = "" }: { label: Label; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${className}`} style={{ borderColor: LABEL_COLOR[label] + "66", background: LABEL_COLOR[label] + "1f", color: label === "Cendrawasih" ? "#7a5f0c" : LABEL_COLOR[label] }}>
      <span className="h-2 w-2 rounded-full" style={{ background: LABEL_COLOR[label] }} />{label}
    </span>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-forest-700 text-white">
      <Topo className="text-white/[.12]" seed={4} />
      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-leaf">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">{title}</h1>
        {children && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{children}</p>}
      </div>
    </section>
  );
}

export function Bar({ label, value, max = 1, color = "#006747", suffix, note }: { label: string; value: number; max?: number; color?: string; suffix?: string; note?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm"><span className="text-ink/80">{label}</span><span className="font-semibold tabular-nums">{value.toFixed(2).replace(".", ",")}{suffix}</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
      {note && <div className="mt-0.5 text-xs text-ink/55">{note}</div>}
    </div>
  );
}

export const card = "rounded-lg border border-black/10 bg-white p-5";

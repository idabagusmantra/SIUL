export type Kind = "kutilang" | "bondol" | "cendrawasih" | "unknown";
type Pal = { head: string; body: string; belly: string; wing: string; tail: string; beak: string };
const PAL: Record<Kind, Pal> = {
  kutilang: { head: "#2a2723", body: "#8c8068", belly: "#d8d1bd", wing: "#6f6450", tail: "#4d453a", beak: "#2a2723" },
  bondol: { head: "#3a2a22", body: "#8a5a3a", belly: "#f1ece0", wing: "#6d4328", tail: "#4a2f1d", beak: "#8d9aa3" },
  cendrawasih: { head: "#c9b23c", body: "#7a4a2a", belly: "#a06a3c", wing: "#5e3a20", tail: "#3f2a1a", beak: "#9aa6ad" },
  unknown: { head: "#9aa7a0", body: "#b7c1bb", belly: "#dfe6e1", wing: "#a3afa8", tail: "#8c9892", beak: "#7e8a84" },
};

/** Burung bertengger menghadap kiri. variant="line" untuk ilustrasi garis dekoratif (warna = currentColor). */
export function Bird({ kind, variant = "solid", className }: { kind: Kind; variant?: "solid" | "line"; className?: string }) {
  const p = PAL[kind];
  const line = variant === "line";
  const f = (c: string) => (line ? "none" : c);
  const s = line ? { stroke: "currentColor", strokeWidth: 1.6, strokeLinejoin: "round" as const } : {};
  return (
    <svg viewBox="0 0 240 190" className={className} fill="none" role="img" aria-label={kind}>
      <path d="M6 146 C70 132 150 156 236 136" stroke={line ? "currentColor" : "#5a4630"} strokeWidth={line ? 1.6 : 5} strokeLinecap="round" />
      <path d="M176 142 C186 150 196 152 206 150" stroke={line ? "currentColor" : "#5a4630"} strokeWidth={line ? 1.2 : 3} strokeLinecap="round" />
      {kind === "cendrawasih" && (
        <g strokeLinecap="round" fill="none">
          <path d="M128 98 C168 132 196 160 238 182" stroke={line ? "currentColor" : "#ecd98a"} strokeWidth={line ? 1.4 : 3.2} />
          <path d="M122 102 C156 142 178 168 214 186" stroke={line ? "currentColor" : "#f4e7ae"} strokeWidth={line ? 1.2 : 2.4} />
          <path d="M134 94 C176 118 206 140 238 160" stroke={line ? "currentColor" : "#d9bf62"} strokeWidth={line ? 1.2 : 2} />
        </g>
      )}
      <path d="M104 120 L104 144 M118 121 L118 143" stroke={line ? "currentColor" : "#3b3128"} strokeWidth={line ? 1.4 : 2.2} strokeLinecap="round" />
      <path d="M148 94 L224 130 L216 142 L138 112Z" fill={f(p.tail)} {...s} />
      <ellipse cx="118" cy="90" rx="47" ry="30" transform="rotate(20 118 90)" fill={f(p.body)} {...s} />
      <ellipse cx="108" cy="102" rx="33" ry="17" transform="rotate(20 108 102)" fill={f(p.belly)} {...s} />
      <path d="M100 78 C130 64 162 82 170 106 C142 110 112 100 100 78Z" fill={f(p.wing)} {...s} />
      {kind === "kutilang" && <ellipse cx="148" cy="108" rx="9" ry="6" transform="rotate(20 148 108)" fill={f("#e7a21f")} {...s} />}
      <circle cx="72" cy="64" r="20" fill={f(p.head)} {...s} />
      {kind === "kutilang" && <path d="M68 46 C64 32 72 22 84 20 C80 28 82 38 84 48Z" fill={f(p.head)} {...s} />}
      {kind === "kutilang" && <ellipse cx="70" cy="71" rx="9" ry="5" fill={f("#f4f1e8")} {...s} />}
      {kind === "cendrawasih" && <path d="M58 70 C62 80 74 82 82 72 C78 76 66 76 58 70Z" fill={f("#1f8a5c")} {...s} />}
      <path d="M54 62 L32 69 L54 74Z" fill={f(p.beak)} {...s} />
      <circle cx="66" cy="60" r="2.8" fill={line ? "currentColor" : "#fff"} />
      {!line && <circle cx="66" cy="60" r="1.4" fill="#111" />}
    </svg>
  );
}

/** Siluet burung terbang. */
export function FlyBird({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 22" className={className} aria-hidden>
      <path d="M0 11 C9 1 18 2 26 11 C34 2 43 1 52 11 C43 9 34 12 26 18 C18 12 9 9 0 11Z" fill="currentColor" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#006747" />
      <path d="M6 21 C12 11 18 12 21 20 C23 12 30 10 35 16 C30 16 26 19 24 25 C21 31 14 29 6 21Z" fill="#fff" />
      <circle cx="29" cy="15" r="1.3" fill="#006747" />
    </svg>
  );
}

export function Arrow({ dir = "right", className }: { dir?: "left" | "right"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === "right" ? <path d="M4 12h16M14 6l6 6-6 6" /> : <path d="M20 12H4M10 6l-6 6 6 6" />}
    </svg>
  );
}

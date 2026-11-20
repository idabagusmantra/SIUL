/** Garis kontur topografi dekoratif, mengacu pola latar situs Perhutani. */
export function Topo({ className = "", seed = 0 }: { className?: string; seed?: number }) {
  const rings = Array.from({ length: 17 }, (_, i) => {
    const r0 = 36 + i * 32, n = 140;
    let d = "";
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const w = 1 + 0.2 * Math.sin(a * 3 + i * 0.35 + seed) + 0.1 * Math.sin(a * 5 - i * 0.6) + 0.06 * Math.sin(a * 2 + i * 0.9 + seed);
      d += `${k ? "L" : "M"}${(500 + Math.cos(a) * r0 * w * 1.3).toFixed(1)} ${(400 + Math.sin(a) * r0 * w).toFixed(1)}`;
    }
    return d + "Z";
  });
  return (
    <svg viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.1">{rings.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  );
}

export function BirdMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="30" cy="35" rx="17" ry="11" transform="rotate(-14 30 35)" />
      <circle cx="47" cy="24" r="8.5" />
      <path d="M54 21.5l9 3.5-9 3.5z" />
      <path d="M15 39L1 50l18-3z" />
      <circle cx="49" cy="22.5" r="1.7" fill="#fff" />
    </svg>
  );
}

/** Ornamen hero: burung hinggap di ranting dengan gelombang suara dari paruh. */
export function HeroBird() {
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full max-w-md" aria-hidden="true">
      <g stroke="#cfe3c8" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M20 292C110 280 190 286 300 270 340 264 380 268 404 262" />
        <path d="M250 272c14-22 34-36 56-40M130 284c-6-16-18-26-34-30" strokeWidth="2" />
      </g>
      <g fill="#cfe3c8" opacity=".55">
        <path d="M296 270c10-12 26-16 40-10-6 12-22 18-40 10z" />
        <path d="M96 252c-12-8-14-22-8-32 12 4 18 18 8 32z" />
      </g>
      <g fill="#f5f8f3" transform="translate(150 70) scale(2.7)">
        <ellipse cx="30" cy="35" rx="17" ry="11" transform="rotate(-14 30 35)" />
        <circle cx="47" cy="24" r="8.5" />
        <path d="M54 21.5l9 3.5-9 3.5z" fill="#e0b25a" />
        <path d="M15 39L1 50l18-3z" />
        <circle cx="49" cy="22.5" r="1.7" fill="#143a22" />
      </g>
      <g stroke="#f5f8f3" strokeWidth="3" fill="none" strokeLinecap="round">
        <path className="siul-arc" d="M338 118c12 10 12 26 0 36" />
        <path className="siul-arc" d="M354 104c20 18 20 52 0 70" />
        <path className="siul-arc" d="M370 90c28 26 28 74 0 100" />
      </g>
      <g stroke="#f5f8f3" strokeWidth="3" strokeLinecap="round" opacity=".5">
        <path d="M200 262v6M212 258v14M224 254v22M236 258v14M248 262v6" />
      </g>
    </svg>
  );
}

/** Garis pemisah tipis dengan siluet burung kecil. */
export function BirdRule() {
  return (
    <div className="flex items-center gap-3 text-forest-600" aria-hidden="true">
      <span className="h-px flex-1 bg-sage-200" />
      <BirdMark className="h-5 w-5" />
      <span className="h-px flex-1 bg-sage-200" />
    </div>
  );
}

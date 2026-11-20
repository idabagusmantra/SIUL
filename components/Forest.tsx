import { FlyBird } from "./Birds";
/** Latar hutan berkabut (SVG + gradien), pengganti foto hero. */
export default function Forest() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-950" aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0a3a2b 0%,#1a5c45 48%,#0a3024 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 60% at 62% 30%, rgba(226,240,196,.38), transparent 70%)" }} />
      {[{ l: "46%", w: 120, r: 14, o: 0.13 }, { l: "58%", w: 190, r: 14, o: 0.1 }, { l: "70%", w: 90, r: 14, o: 0.12 }].map((b, i) => (
        <div key={i} className="absolute -top-10 h-[130%] origin-top blur-xl" style={{ left: b.l, width: b.w, transform: `rotate(${b.r}deg)`, background: `linear-gradient(180deg,rgba(255,255,230,${b.o + 0.08}),rgba(255,255,230,0))` }} />
      ))}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <g fill="#0c3a2c" opacity=".55"><path d="M980 0h34l-8 900h-26z" /><path d="M1190 0h26l-10 900h-20z" /><path d="M780 0h22l-6 900h-16z" /></g>
        <g fill="#06201a" opacity=".92">
          <path d="M-20 0h210l-22 900h-190z" /><path d="M250 0h70l-16 900h-56z" />
          <path d="M1330 0h300v900h-340z" /><path d="M1250 0h46l-14 900h-40z" />
        </g>
        <g fill="#052019" opacity=".9">
          <ellipse cx="120" cy="10" rx="300" ry="90" /><ellipse cx="520" cy="-20" rx="260" ry="70" />
          <ellipse cx="1280" cy="0" rx="340" ry="100" /><ellipse cx="1000" cy="-30" rx="220" ry="60" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(0deg,rgba(4,36,27,.85),transparent)" }} />
      <FlyBird className="drift absolute right-[16%] top-[22%] w-14 text-cream/80" />
      <FlyBird className="drift-slow absolute right-[26%] top-[32%] w-8 text-cream/60" />
      <FlyBird className="drift absolute right-[9%] top-[38%] w-6 text-cream/50" />
    </div>
  );
}

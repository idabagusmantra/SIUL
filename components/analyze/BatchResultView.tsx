import { Bar, card, LabelBadge } from "../ui";
import { KIND, LABEL_COLOR, LABELS } from "@/lib/rules";
import { Bird } from "../Birds";
import type { BatchResponse } from "@/lib/types";

export default function BatchResultView({ data }: { data: BatchResponse }) {
  const { clips, clusters } = data;
  const dist = LABELS.map(l => ({ l, n: clips.filter(c => c.label === l).length })).filter(x => x.n > 0);
  const W = 560, H = 380, px = (v: number) => W / 2 + v * (W / 2 - 40), py = (v: number) => H / 2 + v * (H / 2 - 40);
  const centroid = (id: string) => { const c = clips.filter(x => x.cluster === id); return { x: c.reduce((a, b) => a + b.x, 0) / c.length, y: c.reduce((a, b) => a + b.y, 0) / c.length }; };
  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className={card}>
          <h3 className="font-bold">Peta pengelompokan sumber</h3>
          <p className="text-xs text-ink/55">Setiap titik adalah satu klip, diproyeksikan ke 2 dimensi. Warna menunjukkan label konsensus cluster-nya.</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded bg-mist/50" role="img" aria-label="Peta pengelompokan klip per sumber">
            {clusters.map(c => { const m = centroid(c.id); return <g key={c.id}><circle cx={px(m.x)} cy={py(m.y)} r={62} fill={LABEL_COLOR[c.label]} opacity=".1" stroke={LABEL_COLOR[c.label]} strokeOpacity=".45" strokeDasharray="4 4" /><text x={px(m.x)} y={py(m.y) - 68} textAnchor="middle" fontSize="12" fontWeight="700" fill="#11271f">{c.id}</text></g>; })}
            {clips.map(c => <circle key={c.file + c.cluster} cx={px(c.x)} cy={py(c.y)} r="5.5" fill={LABEL_COLOR[c.label]} stroke="#fff" strokeWidth="1.5"><title>{c.file} · {c.cluster} · {c.label}</title></circle>)}
          </svg>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">{dist.map(x => <span key={x.l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: LABEL_COLOR[x.l] }} />{x.l} <b>{x.n}</b></span>)}</div>
        </div>
        <div className={card}>
          <h3 className="font-bold">Ringkasan</h3>
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-ink/55">Klip dianalisis</dt><dd className="text-3xl font-extrabold text-forest-700">{clips.length}</dd></div><div><dt className="text-ink/55">Sumber terdeteksi</dt><dd className="text-3xl font-extrabold text-forest-700">{clusters.length}</dd></div></dl>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">Klip dikelompokkan per sumber memakai graf shared nearest neighbor dan algoritma Leiden pada ruang embedding yang dinormalisasi WCCN. Label ditetapkan per cluster berdasarkan bukti agregat. Tanpa bukti positif, cluster dilabeli Unknown.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {clusters.map(c => (
          <article key={c.id} className={card} style={{ borderLeft: `4px solid ${LABEL_COLOR[c.label]}` }}>
            <div className="flex items-start justify-between gap-3">
              <div><h4 className="text-lg font-extrabold">Sumber {c.id}</h4><p className="text-sm text-ink/60">{c.n} klip{c.agreement !== undefined && ` · konsistensi voting ${Math.round(c.agreement * 100)}%`}</p></div>
              <div className="flex flex-col items-end gap-2"><LabelBadge label={c.label} /><Bird kind={KIND[c.label]} className="w-16" /></div>
            </div>
            <p className="mt-2 text-sm text-ink/75">{c.reason}</p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
              <Bar label="Terdeteksi Kutilang" value={c.evidence.fK} color={LABEL_COLOR.Kutilang} />
              <Bar label="Terdeteksi Bondol" value={c.evidence.fB} color={LABEL_COLOR["Bondol Jawa"]} />
              <Bar label="Terdeteksi Cendrawasih" value={c.evidence.fC} color={LABEL_COLOR.Cendrawasih} />
              <Bar label="Kemiripan ke group Bondol" value={Math.max(0, c.evidence.cB)} color="#8a5a3a" />
              <Bar label="Probabilitas Bondol" value={c.evidence.pB} color={LABEL_COLOR["Bondol Jawa"]} />
              <Bar label="Probabilitas Kutilang" value={c.evidence.pK} color={LABEL_COLOR.Kutilang} />
            </div>
            <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold text-forest-700">Daftar klip ({c.files.length})</summary><ul className="mt-2 max-h-40 list-disc space-y-0.5 overflow-auto pl-5 text-ink/70">{c.files.map(f => <li key={f} className="break-all">{f}</li>)}</ul></details>
          </article>))}
      </div>
    </div>
  );
}

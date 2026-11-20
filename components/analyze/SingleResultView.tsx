import { Bird } from "../Birds";
import { Bar, card, LabelBadge } from "../ui";
import { detectors, KIND, LABEL_COLOR, RULES, THRESHOLDS } from "@/lib/rules";
import type { ClipResult } from "@/lib/types";

export default function SingleResultView({ r, audioUrl }: { r: ClipResult; audioUrl: string | null }) {
  const d = detectors(r.evidence), e = r.evidence, n2 = (v: number) => v.toFixed(2).replace(".", ",");
  const rows = [
    { t: "Kutilang", s: "Pycnonotus aurigaster", v: e.kaur, th: `≥ ${THRESHOLDS.kutilang.kaur} dan pembeda bulbul ≥ ${n2(THRESHOLDS.kutilang.ksib)}`, on: d.kutilang },
    { t: "Bondol Jawa", s: "genus Lonchura", v: e.blon, th: `≥ ${THRESHOLDS.bondol.blon}`, on: d.bondol },
    { t: "Cendrawasih", s: "famili Paradisaeidae", v: e.cpar, th: `≥ ${THRESHOLDS.cendrawasih.cpar}`, on: d.cendrawasih },
  ];
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className={`${card} text-center`} style={{ borderTop: `4px solid ${LABEL_COLOR[r.label]}` }}>
          <Bird kind={KIND[r.label]} className="mx-auto w-48" />
          <div className="mt-2"><LabelBadge label={r.label} className="text-sm" /></div>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">{r.reason}</p>
          <p className="mt-2 break-all text-xs text-ink/50">{r.file}</p>
        </div>
        {audioUrl && <audio controls src={audioUrl} className="w-full" />}
        {r.label === "Cendrawasih" && <p className="rounded-lg border border-gold/50 bg-gold/10 p-3 text-sm text-ink/80">Deteksi Cendrawasih pada satu klip rentan positif palsu. Bila tersedia rekaman lain dari sumber yang sama, konfirmasi lewat mode Batch.</p>}
      </div>

      <div className="space-y-4">
        <div className={card}>
          <h3 className="font-bold">1. Detektor zero-shot taksonomi <span className="font-normal text-ink/55">· logit spesies Perch v2</span></h3>
          <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-xs uppercase tracking-wide text-ink/50"><th className="py-1">Kelas</th><th>Logit</th><th>Ambang</th><th className="text-right">Status</th></tr></thead>
            <tbody>{rows.map(x => (
              <tr key={x.t} className="border-t border-black/5"><td className="py-2"><b>{x.t}</b><div className="text-xs italic text-ink/55">{x.s}</div></td><td className="tabular-nums">{n2(x.v)}</td><td className="text-ink/65">{x.th}</td>
                <td className="text-right"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${x.on ? "bg-forest-700 text-white" : "bg-mist text-ink/60"}`}>{x.on ? "Terpicu" : "Tidak"}</span></td></tr>))}</tbody></table>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={card}><h3 className="font-bold">2. Probabilitas classifier</h3><p className="text-xs text-ink/55">Logistic Regression, ensemble tiga sudut pandang.</p>
            <div className="mt-3 space-y-3"><Bar label="Bondol Jawa" value={e.pB} color={LABEL_COLOR["Bondol Jawa"]} /><Bar label="Cendrawasih" value={e.pC} color={LABEL_COLOR.Cendrawasih} /><Bar label="Kutilang" value={e.pK} color={LABEL_COLOR.Kutilang} /></div></div>
          <div className={card}><h3 className="font-bold">3. Kemiripan ke group latih</h3><p className="text-xs text-ink/55">Kosinus ke centroid group terdekat per kelas.</p>
            <div className="mt-3 space-y-3"><Bar label="Bondol Jawa" value={e.mB} color={LABEL_COLOR["Bondol Jawa"]} /><Bar label="Cendrawasih" value={e.mC} color={LABEL_COLOR.Cendrawasih} /><Bar label="Kutilang" value={e.mK} color={LABEL_COLOR.Kutilang} /></div></div>
        </div>
        <div className={card}>
          <h3 className="font-bold">4. Veto spesies lain</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><Bar label="Logit spesies non-target" value={e.medNonTarget} max={14} suffix="" note="Veto bila ≥ 7" /><Bar label="Selisih terhadap rentang group latih" value={Math.max(0, e.e)} max={10} note="Veto bila ≥ 3" /></div>
          <p className="mt-2 text-sm text-ink/70">{e.medNonTarget >= 7 && e.e >= 3 ? "Veto aktif: spesies lain terdeteksi jauh di atas rentang data latih." : "Veto tidak aktif."}</p>
        </div>
        <div className={card}>
          <h3 className="font-bold">Jejak aturan</h3>
          <ol className="mt-3 space-y-1.5">{RULES.map(x => (
            <li key={x.n} className={`flex gap-3 rounded px-2 py-1.5 text-sm ${x.n === r.rule ? "bg-forest-700 text-white" : "text-ink/60"}`}><b className="w-4 shrink-0">{x.n}</b><span><b>{x.t}</b>{x.n === r.rule && <span className="block text-white/85">{x.d}</span>}</span></li>))}</ol>
        </div>
      </div>
    </div>
  );
}

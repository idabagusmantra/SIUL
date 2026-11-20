"use client";
import { useRef, useState } from "react";
import type { AnalyzeMode as Mode, AnalyzeResponse, ClusterResult } from "@/lib/types";
import { LABEL_COLOR, type Evidence } from "@/lib/rules";
import { Bar, LabelChip } from "@/components/ui";

const MIN_BATCH = 6;
const AUDIO = /\.(flac|wav|mp3|ogg|m4a)$/i;

const MODES: { id: Mode; title: string; hint: string }[] = [
  { id: "single", title: "Klip tunggal", hint: "Satu berkas, uji cepat" },
  { id: "batch", title: "Batch per sumber", hint: `Minimal ${MIN_BATCH} berkas dari satu lokasi` },
];

function EvidenceBars({ e }: { e: Evidence }) {
  return (
    <div className="space-y-1.5">
      <Bar name="Zero-shot Kutilang" value={e.fK} /><Bar name="Zero-shot Cendr." value={e.fC} /><Bar name="Zero-shot Bondol" value={e.fB} />
      <Bar name="Mirip Bondol" value={Math.max(0, e.mB)} /><Bar name="Mirip Kutilang" value={Math.max(0, e.mK)} />
      <Bar name="Prob. Bondol" value={e.pB} /><Bar name="Prob. Kutilang" value={e.pK} />
      <Bar name="Logit nontarget" value={e.medNonTarget} max={15} />
    </div>
  );
}

function ClusterMap({ clusters, selected, onSelect }: { clusters: ClusterResult[]; selected: string; onSelect: (id: string) => void }) {
  const cols = Math.min(3, clusters.length);
  const rows = Math.ceil(clusters.length / cols);
  const W = 560, cell = W / cols, H = rows * 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-sage-200 bg-sage-50" role="group" aria-label="Peta cluster sumber">
      {clusters.map((c, i) => {
        const cx = (i % cols) * cell + cell / 2, cy = Math.floor(i / cols) * 150 + 75;
        const r = Math.min(58, 22 + Math.sqrt(c.n) * 9);
        const on = c.cluster === selected;
        return (
          <g key={c.cluster} role="button" tabIndex={0} aria-label={`${c.cluster}, ${c.n} klip, ${c.label}`} className="cursor-pointer"
            onClick={() => onSelect(c.cluster)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(c.cluster)}>
            <circle cx={cx} cy={cy} r={r} fill={LABEL_COLOR[c.label]} fillOpacity={on ? 0.95 : 0.7} stroke={on ? "#143a22" : "none"} strokeWidth="3" />
            <text x={cx} y={cy - 2} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">{c.cluster}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="#fff" fontSize="11">{c.n} klip</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AnalyzeClient() {
  const [mode, setMode] = useState<Mode>("single");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [res, setRes] = useState<AnalyzeResponse | null>(null);
  const [sel, setSel] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const pick = (list: FileList | null, m: Mode = mode) => {
    if (!list) return;
    const all = Array.from(list);
    const ok = all.filter((f) => AUDIO.test(f.name));
    setError(""); setNote(""); setRes(null);
    if (ok.length < all.length) setNote("Berkas non-audio diabaikan.");
    if (m === "single" && ok.length > 1) { setNote("Mode klip tunggal hanya memakai satu berkas. Gunakan mode batch untuk beberapa berkas."); setFiles(ok.slice(0, 1)); }
    else setFiles(ok);
  };

  const switchMode = (m: Mode) => { setMode(m); setRes(null); setError(""); setNote(""); if (m === "single") setFiles((f) => f.slice(0, 1)); };
  const ready = mode === "single" ? files.length === 1 : files.length >= MIN_BATCH;

  const run = async () => {
    setBusy(true); setError(""); setRes(null);
    const fd = new FormData(); fd.append("mode", mode); files.forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/analyze", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Analisis gagal.");
      setRes(j); setSel(j.clusters?.[0]?.cluster ?? "");
    } catch (e) { setError(e instanceof Error ? e.message : "Analisis gagal."); }
    finally { setBusy(false); }
  };

  const cur = res?.clusters.find((c) => c.cluster === sel);

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Mode inferensi" className="grid gap-3 sm:grid-cols-2">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => switchMode(m.id)}
            className={`rounded border-2 p-4 text-left ${mode === m.id ? "border-forest-800 bg-forest-800 text-white" : "border-sage-200 hover:border-forest-600"}`}>
            <span className="block font-serif text-lg font-semibold">{m.title}</span>
            <span className={`text-sm ${mode === m.id ? "text-sage-100" : "text-mute"}`}>{m.hint}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-4">
        <p className="rounded border-l-4 border-teak bg-sage-50 px-4 py-3 text-sm leading-relaxed">
          {mode === "single"
            ? "Evaluasi mandiri per klip: setiap berkas dinilai tanpa konteks sumber. Tanpa kelompok pembanding, klip dari sumber yang belum pernah dilihat lebih sering ditolak sebagai Unknown. Untuk hasil yang lebih andal, gunakan mode batch."
            : "Pengelompokan per sumber: klip dikelompokkan dengan graf SNN dan Leiden pada ruang WCCN, lalu satu label ditetapkan untuk tiap kelompok dari bukti gabungannya. Mengasumsikan satu kelompok berisi satu spesies."}
        </p>

        <div className="mt-4 rounded border-2 border-dashed border-sage-200 p-8 text-center"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files); }}>
          <p className="font-medium">{mode === "single" ? "Letakkan satu berkas audio di sini" : "Letakkan beberapa berkas audio di sini"}</p>
          <button onClick={() => input.current?.click()} className="mt-3 rounded bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-700">Pilih berkas</button>
          <input ref={input} type="file" accept=".flac,.wav,.mp3,.ogg,.m4a,audio/*" multiple={mode === "batch"} className="sr-only" onChange={(e) => pick(e.target.files)} aria-label="Pilih berkas audio" />
        </div>

        {note && <p className="mt-3 text-sm text-bark" role="status">{note}</p>}
        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">{files.length} berkas dipilih{mode === "batch" && files.length < MIN_BATCH && <span className="font-normal text-mute"> (butuh minimal {MIN_BATCH})</span>}</p>
            <ul className="mt-2 max-h-40 overflow-auto text-sm text-mute">{files.map((f) => <li key={f.name + f.size} className="truncate">{f.name}</li>)}</ul>
          </div>
        )}
        <button onClick={run} disabled={!ready || busy} className="mt-5 rounded bg-forest-800 px-6 py-3 font-semibold text-white hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-sage-200 disabled:text-mute">
          {busy ? "Menganalisis…" : mode === "single" ? "Analisis klip" : "Kelompokkan dan analisis"}
        </button>
        {error && <p role="alert" className="mt-4 rounded border border-[#a3452c] bg-[#f6e3dc] px-4 py-3 text-sm text-[#7a2f1c]">{error}</p>}
      </div>

      {res && (
        <section aria-live="polite" className="mt-10 border-t border-sage-200 pt-8">
          {res.mode === "demo" && (
            <p className="mb-6 rounded border border-teak bg-[#f7ecc9] px-4 py-3 text-sm text-[#6b5208]">
              Mode demonstrasi: layanan inferensi belum dihubungkan, jadi angka di bawah adalah simulasi untuk pratinjau antarmuka, bukan hasil model. Atur <code>SIUL_BACKEND_URL</code> untuk inferensi nyata.
            </p>
          )}
          {res.kind === "single" ? (
            <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div className="rounded border border-sage-200 p-6">
                <p className="truncate text-sm text-mute">{res.clusters[0].files[0]}</p>
                <div className="mt-3"><LabelChip label={res.clusters[0].label} /></div>
                <p className="mt-4 leading-relaxed">{res.clusters[0].reason}</p>
                <p className="mt-2 text-sm text-mute">Aturan {res.clusters[0].rule} · evaluasi mandiri per klip</p>
              </div>
              <div className="rounded border border-sage-200 p-6"><h2 className="mb-4 text-lg font-semibold">Bukti klip</h2><EvidenceBars e={res.clusters[0].evidence} /></div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="mb-3 text-lg font-semibold">{res.clusters.length} kelompok sumber dari {res.clusters.reduce((a, c) => a + c.n, 0)} klip</h2>
                <ClusterMap clusters={res.clusters} selected={sel} onSelect={setSel} />
                <ul className="mt-4 divide-y divide-sage-100 text-sm">
                  {res.clusters.map((c) => (
                    <li key={c.cluster}>
                      <button onClick={() => setSel(c.cluster)} className={`flex w-full items-center justify-between gap-3 px-2 py-2.5 text-left ${c.cluster === sel ? "bg-sage-100" : "hover:bg-sage-50"}`}>
                        <span><span className="font-semibold">{c.cluster}</span> <span className="text-mute">· {c.n} klip</span></span>
                        <LabelChip label={c.label} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {cur && (
                <div className="rounded border border-sage-200 p-6">
                  <h2 className="text-lg font-semibold">Kelompok {cur.cluster}</h2>
                  <div className="mt-3"><LabelChip label={cur.label} /></div>
                  <p className="mt-3 leading-relaxed">{cur.reason}</p>
                  <p className="mt-1 text-sm text-mute">Aturan {cur.rule}, berdasarkan bukti agregat {cur.n} klip</p>
                  <div className="mt-5"><EvidenceBars e={cur.evidence} /></div>
                  <details className="mt-5 text-sm"><summary className="cursor-pointer font-medium text-forest-800">Berkas dalam kelompok</summary>
                    <ul className="mt-2 max-h-40 overflow-auto text-mute">{cur.files.map((f) => <li key={f} className="truncate">{f}</li>)}</ul>
                  </details>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

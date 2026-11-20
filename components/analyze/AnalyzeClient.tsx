"use client";
import { useEffect, useRef, useState } from "react";
import SingleResultView from "./SingleResultView";
import BatchResultView from "./BatchResultView";
import { card } from "../ui";
import type { BatchResponse, SingleResponse, StatusResponse } from "@/lib/types";

type M = "single" | "batch";
const MAX_FILES = 200, MAX_MB = 60;
const OK_EXT = /\.(flac|wav|mp3|ogg|m4a)$/i;

const MODES: { id: M; t: string; chip: string; d: string }[] = [
  { id: "single", t: "Klip Tunggal", chip: "Evaluasi mandiri per klip", d: "Satu berkas audio dinilai sendiri: detektor zero-shot, probabilitas classifier, kemiripan ke group latih, dan veto spesies." },
  { id: "batch", t: "Batch Sumber", chip: "Pengelompokan SNN + Leiden", d: "Beberapa berkas dari satu lokasi atau rekaman dikelompokkan per sumber, lalu tiap kelompok mendapat satu label konsensus." },
];

export default function AnalyzeClient() {
  const [mode, setMode] = useState<M>("single");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [single, setSingle] = useState<SingleResponse | null>(null);
  const [batch, setBatch] = useState<BatchResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/status").then(r => r.json()).then(setStatus).catch(() => setStatus({ mode: "live", backendOk: false })); }, []);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  function pick(list: FileList | File[]) {
    const all = [...list], good = all.filter(f => OK_EXT.test(f.name) && f.size <= MAX_MB * 1048576).slice(0, MAX_FILES);
    setErr(good.length < all.length ? `Sebagian berkas dilewati: hanya FLAC, WAV, MP3, OGG, atau M4A hingga ${MAX_MB} MB (maksimum ${MAX_FILES} berkas).` : "");
    setFiles(good); setSingle(null); setBatch(null);
    setAudioUrl(good.length === 1 ? URL.createObjectURL(good[0]) : null);
  }
  const remove = (i: number) => pick(files.filter((_, k) => k !== i));
  const change = (m: M) => { setMode(m); setSingle(null); setBatch(null); setErr(""); };

  const mismatch = mode === "single" ? files.length > 1 : files.length === 1;
  const ready = files.length > 0 && !mismatch && !busy;

  async function run() {
    setBusy(true); setErr(""); setSingle(null); setBatch(null);
    try {
      const fd = new FormData(); files.forEach(f => fd.append("files", f));
      const res = await fetch(`/api/analyze/${mode}`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Analisis gagal.");
      if (mode === "single") setSingle(j); else setBatch(j);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  const demo = (single ?? batch)?.mode === "demo" || (!single && !batch && status?.mode === "demo");

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {status && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${status.mode === "demo" ? "border-gold/60 bg-gold/10 text-ink/80" : status.backendOk ? "border-forest-600/40 bg-forest-700/5 text-forest-800" : "border-red-300 bg-red-50 text-red-800"}`}>
          {status.mode === "demo" && <><b>Mode demonstrasi.</b> Backend belum terhubung, sehingga hasil dibangkitkan dari nama berkas untuk mencoba alur antarmuka. Hasil ini bukan prediksi model.</>}
          {status.mode === "live" && status.backendOk && <><b>Backend terhubung.</b> Analisis dijalankan oleh model inferensi.</>}
          {status.mode === "live" && !status.backendOk && <><b>Backend tidak dapat dijangkau.</b> Periksa SIUL_API_URL dan pastikan server inferensi berjalan.</>}
        </div>
      )}

      <div role="tablist" aria-label="Mode inferensi" className="grid gap-3 md:grid-cols-2">
        {MODES.map(m => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => change(m.id)}
            className={`rounded-lg border-2 p-5 text-left transition ${mode === m.id ? "border-forest-700 bg-forest-700 text-white" : "border-black/10 bg-white hover:border-forest-700/50"}`}>
            <div className="flex items-center justify-between gap-3"><span className="text-xl font-extrabold">{m.t}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${mode === m.id ? "bg-leaf text-forest-950" : "bg-mist text-forest-800"}`}>{m.chip}</span></div>
            <p className={`mt-2 text-sm leading-relaxed ${mode === m.id ? "text-white/85" : "text-ink/65"}`}>{m.d}</p>
          </button>))}
      </div>

      <div className={`${card} mt-6`}>
        <div className="rounded-lg border-2 border-dashed border-forest-700/30 bg-mist/40 p-8 text-center"
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files); }}>
          <p className="font-semibold text-ink">{mode === "single" ? "Letakkan satu berkas audio di sini" : "Letakkan beberapa berkas audio dari satu lokasi atau rekaman"}</p>
          <p className="mt-1 text-sm text-ink/60">FLAC, WAV, MP3, OGG, M4A · maksimum {MAX_MB} MB per berkas{mode === "batch" && " · minimal 2 berkas"}</p>
          <input ref={input} type="file" accept=".flac,.wav,.mp3,.ogg,.m4a,audio/*" multiple={mode === "batch"} hidden onChange={e => e.target.files && pick(e.target.files)} />
          <button type="button" onClick={() => input.current?.click()} className="mt-4 rounded bg-forest-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-forest-800">Pilih berkas</button>
        </div>

        {files.length > 0 && (
          <ul className="mt-4 max-h-48 divide-y divide-black/5 overflow-auto text-sm">
            {files.map((f, i) => <li key={f.name + i} className="flex items-center justify-between gap-3 py-2"><span className="break-all">{f.name} <span className="text-ink/45">· {(f.size / 1048576).toFixed(1)} MB</span></span><button onClick={() => remove(i)} className="shrink-0 text-xs font-semibold text-red-700 hover:underline">Hapus</button></li>)}
          </ul>)}

        {mismatch && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-gold/60 bg-gold/10 px-4 py-3 text-sm">
            <span>{mode === "single" ? `Anda memilih ${files.length} berkas, sedangkan mode Klip Tunggal hanya menerima satu.` : "Mode Batch membutuhkan minimal 2 berkas agar sumber dapat dikelompokkan."}</span>
            <button onClick={() => change(mode === "single" ? "batch" : "single")} className="rounded border border-forest-700 px-3 py-1 font-bold text-forest-700 hover:bg-forest-700 hover:text-white">Beralih ke {mode === "single" ? "Batch" : "Klip Tunggal"}</button>
          </div>)}
        {err && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{err}</p>}
        <div className="mt-5 flex items-center gap-4"><button disabled={!ready} onClick={run} className="rounded bg-leaf px-6 py-3 font-extrabold text-forest-950 transition hover:bg-leaf-dark disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Menganalisis…" : "Jalankan analisis"}</button>
          {busy && <span className="text-sm text-ink/60">{mode === "batch" ? "Ekstraksi embedding dan clustering dapat memakan waktu beberapa menit." : "Mengekstrak embedding dari klip…"}</span>}</div>
      </div>

      {single && <>{single.mode === "demo" && demo && <p className="mt-6 text-sm font-semibold text-ink/60">Hasil demonstrasi, bukan prediksi model.</p>}<SingleResultView r={single.result} audioUrl={audioUrl} /></>}
      {batch && <>{batch.mode === "demo" && <p className="mt-6 text-sm font-semibold text-ink/60">Hasil demonstrasi, bukan prediksi model.</p>}<BatchResultView data={batch} /></>}
    </div>
  );
}

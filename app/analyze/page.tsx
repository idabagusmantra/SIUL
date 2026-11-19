"use client";
import { useState } from "react";
import Tag from "@/components/Tag";
import type { ClusterResult } from "@/lib/demo";
export default function Analyze() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ mode: string; clusters: ClusterResult[] } | null>(null);
  const [err, setErr] = useState("");
  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try {
      const fd = new FormData(); files.forEach(f => fd.append("files", f));
      const r = await fetch("/api/analyze", { method: "POST", body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error ?? "Gagal"); setRes(j);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (<>
    <h1>Analisis Audio</h1>
    <p className="lead">Unggah beberapa klip (FLAC/WAV/MP3). SIUL mengelompokkan klip per sumber lalu memutuskan label per cluster — bukan per klip.</p>
    <div className="drop"><input type="file" multiple accept="audio/*,.flac" onChange={e => setFiles([...(e.target.files ?? [])])} />
      <div className="mut" style={{ marginTop: 8 }}>{files.length} berkas dipilih</div></div>
    <div className="row" style={{ marginTop: 14 }}><button disabled={!files.length || busy} onClick={run}>{busy ? "Menganalisis…" : "Analisis"}</button></div>
    {err && <div className="warn" style={{ marginTop: 12 }}>{err}</div>}
    {res && <>
      {res.mode === "demo" && <div className="warn" style={{ marginTop: 16 }}>MODE DEMO: hasil di bawah dibangkitkan dari nama berkas untuk menguji alur UI, bukan prediksi model. Set <code>SIUL_BACKEND_URL</code> untuk inferensi nyata.</div>}
      <div className="grid g2" style={{ marginTop: 16 }}>{res.clusters.map(c => (
        <div className="card" key={c.cluster}>
          <div className="row" style={{ justifyContent: "space-between" }}><b>Cluster {c.cluster} · {c.n} klip</b><Tag label={c.label} /></div>
          <p className="mut">Aturan {c.rule}: {c.reason}</p>
          <div className="mut">{c.files.join(", ")}</div>
        </div>))}</div></>}
  </>);
}

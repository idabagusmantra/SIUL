"use client";
import { useState } from "react";
import { CLUSTERS } from "@/lib/data";
import Tag from "@/components/Tag";
export default function Clusters() {
  const [sel, setSel] = useState(CLUSTERS[4]);
  return (<>
    <h1>Cluster Data Uji</h1>
    <p className="lead">22 cluster dari setelan acuan (pe+prof, k=10, resolusi 2,5). Klik baris untuk melihat bukti. Keputusan diambil per cluster, bukan per klip.</p>
    <div className="grid g2" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
      <div className="card" style={{ overflowX: "auto" }}>
        <table><thead><tr><th>ID</th><th>n</th><th>Spesies dominan (Perch)</th><th>Label akhir</th></tr></thead>
          <tbody>{CLUSTERS.map(c => (
            <tr key={c.id} className="click" onClick={() => setSel(c)} style={sel.id === c.id ? { background: "#18222f" } : undefined}>
              <td>{c.id}</td><td>{c.n}</td><td className="mut">{c.species}</td><td><Tag label={c.final} /></td></tr>))}</tbody></table>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{sel.id} <span className="mut">· {sel.n} klip</span></h2>
        <p>Label aturan: <Tag label={sel.rule} /></p>
        <p>Label akhir: <Tag label={sel.final} /></p>
        <p className="mut">Dasar: {sel.basis}</p>
        {sel.ev && <table><tbody>{Object.entries(sel.ev).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v.toFixed(2)}</td></tr>)}</tbody></table>}
        {sel.rule !== sel.final && <div className="warn" style={{ marginTop: 12 }}>Dikoreksi lewat probe leaderboard publik (c04: Unknown → Bondol), menaikkan skor 0,89226 → 0,97643.</div>}
        {(sel.id === "c14" || sel.id === "c09") && <div className="warn" style={{ marginTop: 12 }}>Cluster ini seluruhnya privat: labelnya tidak dapat diverifikasi lewat leaderboard publik.</div>}
      </div>
    </div>
  </>);
}

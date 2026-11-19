import Link from "next/link";
import { HEADLINE, FINAL_DIST } from "@/lib/data";
import Tag from "@/components/Tag";
const STEPS = [
  ["Ekstraksi representasi", "Embedding Perch v2 & BirdNET v2.4, 750 fitur akustik, logit spesies (sekali jalan)."],
  ["Detektor zero-shot taksonomi", "Logit Perch: P. aurigaster (Kutilang), Lonchura (Bondol), Paradisaeidae (Cendrawasih) sebagai bukti positif."],
  ["Clustering sumber", "Ruang WCCN → graf SNN → Leiden, voting 18 setelan; kemurnian 0,796 → 0,941."],
  ["Aturan open-set per cluster", "Label hanya diberikan bila ada bukti positif; default Unknown."],
];
export default function Home() {
  return (<>
    <h1>SIUL</h1>
    <p className="lead">Prototype aplikasi untuk klasifikasi suara burung <i>open-set</i>: Bondol Jawa, Cendrawasih, Kutilang, atau Unknown. Berbasis hasil NPC DSC 2026 — Tim IRIS Darsana.</p>
    <div className="grid g4" style={{ marginTop: 24 }}>
      {HEADLINE.map(h => <div className="card" key={h.l}><div className="kpi">{h.k}</div><div>{h.l}</div><div className="mut">{h.s}</div></div>)}
    </div>
    <h2>Alur pipeline</h2>
    <div className="grid g2">
      {STEPS.map((s, i) => <div className="card step" key={s[0]}><i>{i + 1}</i><div><b>{s[0]}</b><div className="mut">{s[1]}</div></div></div>)}
    </div>
    <h2>Submission akhir (814 klip uji)</h2>
    <div className="card row">{FINAL_DIST.map(d => <div key={d.label}><Tag label={d.label} /> <b>{d.n}</b> <span className="mut">({(d.n / 814 * 100).toFixed(1)}%)</span></div>)}</div>
    <h2>Jelajahi</h2>
    <div className="row">
      <Link className="btn" href="/analyze">Coba analisis audio</Link>
      <Link className="btn btn2" href="/clusters">Cluster uji</Link>
      <Link className="btn btn2" href="/rules">Simulator aturan</Link>
      <Link className="btn btn2" href="/validation">Validasi</Link>
    </div>
  </>);
}

"use client";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ABLATION, CLOSED_SET, LB_HISTORY, LOGO_SOURCES } from "@/lib/data";
const ax = { stroke: "#8da0b5", fontSize: 12 };
export default function Validation() {
  const ok = LOGO_SOURCES.filter(s => s.ok).length;
  return (<>
    <h1>Validasi</h1>
    <p className="lead">Seluruh angka dari laporan teknis. Validasi memakai leave-one-group-out (LOGO) karena hanya ada 15 source_group.</p>
    <div className="grid g2">
      <div className="card"><b>Riwayat skor leaderboard publik</b>
        <ResponsiveContainer width="100%" height={240}><LineChart data={LB_HISTORY}><CartesianGrid stroke="#1f2a38" /><XAxis dataKey="v" {...ax} /><YAxis domain={[0.4, 1]} {...ax} /><Tooltip contentStyle={{ background: "#121923", border: "1px solid #1f2a38" }} /><Line dataKey="lb" stroke="#4cc9a6" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
      <div className="card"><b>Macro-F1 LOGO closed-set (3 kelas)</b>
        <ResponsiveContainer width="100%" height={240}><BarChart data={CLOSED_SET}><CartesianGrid stroke="#1f2a38" /><XAxis dataKey="view" {...ax} /><YAxis domain={[0.7, 1]} {...ax} /><Tooltip contentStyle={{ background: "#121923", border: "1px solid #1f2a38" }} /><Bar dataKey="f1" fill="#4cc9a6" /></BarChart></ResponsiveContainer></div>
      <div className="card"><b>Ablasi simulasi open-set (macro-F1 4 kelas)</b>
        <ResponsiveContainer width="100%" height={260}><BarChart data={ABLATION} layout="vertical" margin={{ left: 60 }}><CartesianGrid stroke="#1f2a38" /><XAxis type="number" domain={[0.5, 1]} {...ax} /><YAxis type="category" dataKey="v" width={150} {...ax} /><Tooltip contentStyle={{ background: "#121923", border: "1px solid #1f2a38" }} /><Bar dataKey="f1">{ABLATION.map((a, i) => <Cell key={i} fill={i === 0 ? "#4cc9a6" : "#3a4a5e"} />)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="card"><b>LOGO tingkat sumber: {ok} dari 15 diterima</b>
        <div className="mut">Tidak ada salah kelas; semua kegagalan berupa kelas dikenal → Unknown.</div>
        <table><thead><tr><th>Group</th><th>Kelas</th><th>n</th><th>Hasil</th><th>Dasar</th></tr></thead><tbody>
          {LOGO_SOURCES.map(s => <tr key={s.g}><td>{s.g}</td><td>{s.label}</td><td>{s.n}</td><td style={{ color: s.ok ? "#4cc9a6" : "#e5484d" }}>{s.ok ? "✓" : "✗"}</td><td className="mut">{s.basis}</td></tr>)}</tbody></table></div>
    </div>
    <div className="warn" style={{ marginTop: 20 }}>Catatan jujur (dari laporan): subset publik dibagi per sumber, sehingga 0,97643 hanya mencerminkan sumber publik; skor privat dapat lebih rendah. Simulasi mengasumsikan clustering sempurna (batas atas).</div>
  </>);
}

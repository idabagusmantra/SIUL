"""WAJIB dijalankan sebelum ekstraktor live dipercaya (LANGKAH_SELANJUTNYA, langkah 3).

Mengekstraksi ulang beberapa klip kompetisi dari AUDIO ASLI lalu membandingkannya dengan nilai di paket npc_extract_all
(yang dibuat notebook ekstraksi di GPU), dan memastikan label akhir sama.

    python scripts/verify_live.py --pack D:\\npc_extract_all --audio D:\\schematics-2026\\train\\audio -n 6
(--audio boleh folder test/audio; nama berkas harus <file_id>.flac)
"""
import argparse, glob, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from siul_core import SiulService, load_bundle
from siul_core.extract import PackExtractor, make_live_extractor

ap = argparse.ArgumentParser()
ap.add_argument("--pack", required=True); ap.add_argument("--audio", required=True)
ap.add_argument("-n", type=int, default=6); ap.add_argument("--models", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models"))
a = ap.parse_args()

bundle = load_bundle(os.path.join(a.models, "npc_open_set_pipeline.pkl"))
svc = SiulService(bundle)
pack = PackExtractor.from_dir(a.pack)
live = make_live_extractor(bundle.features, a.models)
if live.problems():
    sys.exit("Ekstraktor live belum siap:\n - " + "\n - ".join(live.problems()))

files = [p for p in sorted(glob.glob(os.path.join(a.audio, "*"))) if os.path.splitext(os.path.basename(p))[0] in pack.index]
if not files:
    sys.exit("Tidak ada berkas audio yang namanya cocok dengan file_id di paket.")
rng = np.random.default_rng(0)
files = [files[i] for i in rng.choice(len(files), min(a.n, len(files)), replace=False)]

cos = lambda u, v: float(u @ v / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-12))
bad = 0
print(f"{'klip':12s} {'cos pe':>7s} {'cos bn':>7s} {'cos hf':>7s} {'|d logit P|':>11s} {'|d logit B|':>11s}  label pack -> live")
for p in files:
    name = os.path.basename(p)
    rp, rl = pack.extract(name), live.extract(name, p)
    c = [cos(rp.pe, rl.pe), cos(rp.bn, rl.bn), cos(rp.hf, rl.hf)]
    dp, db = np.abs(rp.perch_logit - rl.perch_logit).mean(), np.abs(rp.bn_logit - rl.bn_logit).mean()
    lp, ll = svc.analyze_single(rp)["result"]["label"], svc.analyze_single(rl)["result"]["label"]
    ok = min(c) > 0.99 and dp < 0.5 and db < 0.5 and lp == ll
    bad += not ok
    print(f"{name[:10]:12s} {c[0]:7.4f} {c[1]:7.4f} {c[2]:7.4f} {dp:11.3f} {db:11.3f}  {lp} -> {ll}  {'OK' if ok else 'BEDA'}")
print("\nSEMUA COCOK" if not bad else f"\n{bad} klip BEDA: jangan percaya hasil live. Periksa sample rate, jendela, urutan kolom logit, versi model.")
sys.exit(1 if bad else 0)

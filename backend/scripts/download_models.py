"""Siapkan bobot model untuk ekstraktor live (butuh internet, sekali saja).

    python scripts/download_models.py            # BirdNET + Perch v2 (varian CPU) -> backend/models/
    python scripts/download_models.py --only birdnet

BirdNET v2.4 : diambil dari paket pip `birdnetlib` (sumber yang sama dengan notebook ekstraksi). Lisensi bobot CC BY-NC-SA 4.0.
Perch v2     : SavedModel varian CPU dari URL yang dipakai notebook ekstraksi. Lisensi Apache 2.0.
Bila URL Perch sudah tidak berlaku, unduh SavedModel Perch v2 sendiri, taruh di backend/models/perch_v2/
(folder yang berisi saved_model.pb) atau arahkan SIUL_PERCH_DIR ke sana.
"""
import argparse, glob, importlib.util, os, shutil, subprocess, sys, urllib.request, zipfile

MODELS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
BN_NAME = "BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite"
BN_LABELS = "BirdNET_GLOBAL_6K_V2.4_Labels.txt"
PERCH_CPU_URL = "https://tuc.cloud/index.php/s/z3eo89G9MmHexG6/download"


def birdnet():
    dst = os.path.join(MODELS, "birdnet"); os.makedirs(dst, exist_ok=True)
    if os.path.exists(os.path.join(dst, BN_NAME)):
        print("BirdNET sudah ada:", dst); return
    if importlib.util.find_spec("birdnetlib") is None:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "birdnetlib==0.18.1", "--no-deps"])
    base = list(importlib.util.find_spec("birdnetlib").submodule_search_locations)[0]
    src = os.path.join(base, "models", "analyzer", BN_NAME)
    if not os.path.exists(src):
        sys.exit(f"{BN_NAME} tidak ada di paket birdnetlib ({src}). Unduh manual dari BirdNET-Analyzer ke {dst}.")
    shutil.copy(src, dst)
    lab = os.path.join(os.path.dirname(src), BN_LABELS)
    if os.path.exists(lab):
        shutil.copy(lab, dst)
    print("BirdNET ->", dst)


def perch():
    dst = os.path.join(MODELS, "perch_v2")
    if glob.glob(os.path.join(dst, "**", "saved_model.pb"), recursive=True):
        print("Perch sudah ada:", dst); return
    os.makedirs(dst, exist_ok=True)
    zp = dst + ".zip"
    print("mengunduh Perch v2 (CPU), ratusan MB ...")
    req = urllib.request.Request(PERCH_CPU_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(zp, "wb") as f:
        shutil.copyfileobj(r, f, 1 << 22)
    with zipfile.ZipFile(zp) as z:
        z.extractall(dst)
    os.remove(zp)
    if not glob.glob(os.path.join(dst, "**", "saved_model.pb"), recursive=True):
        sys.exit("saved_model.pb tidak ada di arsip Perch.")
    print("Perch ->", dst)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--only", choices=["birdnet", "perch"])
    a = ap.parse_args()
    if a.only != "perch": birdnet()
    if a.only != "birdnet": perch()

"""Kontrak backend SIUL (FastAPI). Frontend Next.js memanggil lewat SIUL_API_URL.

    uvicorn main:app --host 0.0.0.0 --port 8000

Endpoint:
  GET  /v1/health
  POST /v1/analyze/single   multipart, field `files` (tepat 1 berkas)  -> {"result": ClipResult}
  POST /v1/analyze/batch    multipart, field `files` (>= 2 berkas)     -> {"clips": [...], "clusters": [...]}

Bentuk respons ada di lib/types.ts. Aturan di lib/rules.ts HARUS sama dengan notebook final (Bagian 5.3).
Port dari DatSci_IRIS_Darsana_Notebook.ipynb: ekstraksi Perch/BirdNET + fitur hf, fitur zero-shot (4.3),
StandardScaler -> PCA 96 -> WCCN -> L2 (4.4), LogReg ensemble (5.1), SNN + Leiden voting 18 setelan (5.2), aturan (5.3).
Artefak latih (scaler, PCA, WCCN, centroid group, LogReg) disimpan sekali dengan joblib lalu dimuat saat startup.
"""
import os
from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, File

app = FastAPI(title="SIUL backend")
API_KEY = os.getenv("SIUL_API_KEY")


def auth(authorization: str | None = Header(default=None)):
    if API_KEY and authorization != f"Bearer {API_KEY}":
        raise HTTPException(401, "Tidak berwenang")


@app.get("/v1/health")
def health():
    return {"ok": True}


@app.post("/v1/analyze/single", dependencies=[Depends(auth)])
async def analyze_single(files: list[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Tepat 1 berkas")
    # TODO: embed -> fitur zero-shot (kaur, ksib, blon, cpar) -> probabilitas LogReg (pB, pC, pK)
    #       -> kemiripan ke centroid group latih (mB, mC, mK, cB) -> veto (medNonTarget, e) -> decide_clip
    # return {"result": {"file": ..., "label": ..., "rule": ..., "reason": ..., "evidence": {...}}}
    raise HTTPException(501, "Belum diimplementasikan")


@app.post("/v1/analyze/batch", dependencies=[Depends(auth)])
async def analyze_batch(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "Minimal 2 berkas")
    # TODO: embed semua klip -> ruang WCCN -> SNN + Leiden (18 setelan, voting) -> bukti per cluster -> decide
    # clips: [{file, cluster, label, x, y}] (x,y = proyeksi 2D, mis. t-SNE/UMAP, dinormalisasi ke [-1, 1])
    # clusters: [{id, n, files, evidence{fK,fC,fB,mB,mC,mK,cB,pB,pK,medNonTarget,e}, label, rule, reason, agreement}]
    raise HTTPException(501, "Belum diimplementasikan")

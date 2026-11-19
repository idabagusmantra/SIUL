"""Kontrak backend SIUL. Next.js memanggil POST /analyze (multipart, field `files`).
Respons: {"clusters": [{cluster, n, files, evidence{fK,fC,fB,mB,mC,mK,cB,pB,pK,medNonTarget,e}, label, rule, reason}]}

TODO (port dari DatSci_IRIS_Darsana_Notebook.ipynb):
  1. Ekstraksi: Perch v2 + BirdNET v2.4 + 750 fitur hf (notebook ekstraksi terpisah, bukan notebook final)
  2. Bagian 4.3: fitur zero-shot (Kaur, Ksib, Blon, Cpar)
  3. Bagian 4.4: StandardScaler -> PCA 96 -> WCCN -> L2 (fit pada data latih)
  4. Bagian 5.2: SNN + Leiden, voting 18 setelan
  5. Bagian 5.3: bukti per cluster + aturan (sama dengan lib/rules.ts)
Catatan: clustering butuh banyak klip uji; satu klip tunggal tidak bermakna.
"""
from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="SIUL backend")


@app.post("/analyze")
async def analyze(files: list[UploadFile] = File(...)):
    raise HTTPException(501, "Belum diimplementasikan: port pipeline dari notebook (lihat docstring).")

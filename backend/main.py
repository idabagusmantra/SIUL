"""Backend SIUL (FastAPI).

    SIUL_MODEL_DIR=./models SIUL_EXTRACTOR=pack SIUL_PACK_DIR=/data/npc_extract_all uvicorn main:app --port 8000

Kontrak respons: lihat ../lib/types.ts. Butuh models/npc_open_set_pipeline.pkl.
"""
import hmac, logging, os, tempfile
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from siul_core import SiulService, load_bundle
from fastapi.middleware.cors import CORSMiddleware
from siul_core.extract import ClipNotInPack, ExtractorUnavailable, PackExtractor, make_live_extractor

log = logging.getLogger("siul")
MODEL_DIR = os.getenv("SIUL_MODEL_DIR", os.path.join(os.path.dirname(__file__), "models"))
API_KEY = os.getenv("SIUL_API_KEY")
MAX_BYTES = int(os.getenv("SIUL_MAX_UPLOAD_MB", "60")) * 1024 * 1024
MAX_FILES = int(os.getenv("SIUL_MAX_FILES", "200"))
MAX_TOTAL = int(os.getenv("SIUL_MAX_TOTAL_MB", "600")) * 1024 * 1024
state: dict = {}


def build_extractor():
    kind = os.getenv("SIUL_EXTRACTOR", "live")
    if kind == "pack":
        return PackExtractor.from_dir(os.environ["SIUL_PACK_DIR"])
    return make_live_extractor(state["service"].b.features, MODEL_DIR)


@asynccontextmanager
async def lifespan(app: FastAPI):
    state["service"] = SiulService(load_bundle(os.path.join(MODEL_DIR, "npc_open_set_pipeline.pkl")))
    state["extractor"] = build_extractor()
    if os.getenv("SIUL_PRELOAD") == "1" and hasattr(state["extractor"], "preload"):
        await run_in_threadpool(state["extractor"].preload)   # muat model saat start, bukan saat klip pertama
    log.info("SIUL siap; ekstraktor=%s", state["extractor"].name)
    yield
    state.clear()


app = FastAPI(title="SIUL backend", lifespan=lifespan)
# Hanya perlu bila browser memanggil backend LANGSUNG (mode unggah langsung untuk Vercel). Contoh: SIUL_CORS_ORIGINS=https://siul.vercel.app
_origins = [o.strip() for o in os.getenv("SIUL_CORS_ORIGINS", "").split(",") if o.strip()]
if _origins:
    app.add_middleware(CORSMiddleware, allow_origins=_origins, allow_methods=["GET", "POST"], allow_headers=["Authorization"])


def auth(authorization: str | None = Header(default=None)):
    if API_KEY and not hmac.compare_digest((authorization or "").encode(), f"Bearer {API_KEY}".encode()):
        raise HTTPException(401, "Tidak berwenang")


@app.get("/v1/health")
def health():
    ok = "service" in state
    ex = state.get("extractor")
    ready = bool(ok and getattr(ex, "ready", ex.name != "live"))
    out = {"ok": ok, "extractor": ex.name if ok else None, "extractor_ready": ready}
    if ok and not ready and hasattr(ex, "problems"):
        out["problems"] = ex.problems()
    return out


async def _read_limited(f: UploadFile, budget: int) -> bytes:
    """Baca berkas bertahap dan berhenti begitu melewati batas, agar berkas raksasa tidak memenuhi memori."""
    limit = min(MAX_BYTES, budget)
    chunks, size = [], 0
    while chunk := await f.read(1024 * 1024):
        size += len(chunk)
        if size > limit:
            raise HTTPException(413, f"{f.filename} atau total unggahan melebihi batas ({MAX_BYTES // 1048576} MB per berkas, {MAX_TOTAL // 1048576} MB total)")
        chunks.append(chunk)
    return b"".join(chunks)


async def _reps(files: list[UploadFile]):
    ex, reps, missing, budget = state["extractor"], [], [], MAX_TOTAL
    for f in files:
        data = await _read_limited(f, budget)
        budget -= len(data)
        # Windows tidak mengizinkan membuka ulang NamedTemporaryFile yang masih terbuka: tulis, tutup, lalu hapus manual.
        fd, path = tempfile.mkstemp(suffix=os.path.splitext(f.filename or "")[1])
        try:
            with os.fdopen(fd, "wb") as tmp:
                tmp.write(data)
            try:
                reps.append(await run_in_threadpool(ex.extract, f.filename or "klip", path))
            except ClipNotInPack:
                missing.append(f.filename)
            except ExtractorUnavailable as e:
                raise HTTPException(503, str(e))
            except ValueError as e:                      # audio rusak/kosong
                raise HTTPException(422, f"{f.filename}: {e}")
        finally:
            try:
                os.remove(path)
            except OSError:
                pass
    if missing:
        raise HTTPException(422, "Klip tidak ada di paket ekstraksi: " + ", ".join(missing))
    return reps


@app.post("/v1/analyze/single", dependencies=[Depends(auth)])
async def analyze_single(files: list[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Tepat 1 berkas")
    rep = (await _reps(files))[0]
    return await run_in_threadpool(state["service"].analyze_single, rep)


@app.post("/v1/analyze/batch", dependencies=[Depends(auth)])
async def analyze_batch(files: list[UploadFile] = File(...)):
    if not 2 <= len(files) <= MAX_FILES:
        raise HTTPException(400, f"Batch membutuhkan 2 sampai {MAX_FILES} berkas")
    return await run_in_threadpool(state["service"].analyze_batch, await _reps(files))

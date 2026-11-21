# Backend SIUL (FastAPI + ekstraktor live). Dibangun dari root proyek:  docker build -t siul-backend .
# Cocok untuk Hugging Face Spaces (SDK Docker, port 7860), Render, Railway, Fly.io. Butuh RAM >= 4 GB (disarankan 8 GB).
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 TF_CPP_MIN_LOG_LEVEL=2
RUN apt-get update && apt-get install -y --no-install-recommends libsndfile1 ffmpeg libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 user
WORKDIR /app
COPY backend/requirements.txt backend/requirements-live.txt ./
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt -r requirements-live.txt
COPY --chown=user backend/ ./
# Bobot BirdNET + Perch v2 diunduh saat build (butuh internet). npc_open_set_pipeline.pkl harus ada di backend/models/.
RUN python scripts/download_models.py && chown -R user /app
USER user
ENV SIUL_EXTRACTOR=live SIUL_PRELOAD=1 PORT=7860
EXPOSE 7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]

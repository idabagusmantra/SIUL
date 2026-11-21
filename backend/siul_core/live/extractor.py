"""LiveExtractor: audio mentah -> ClipRep (pe, bn, hf, logit Perch, logit BirdNET)."""
from __future__ import annotations
import importlib.util, logging, os, threading
import numpy as np
from ..rep import ClipRep
from . import audio as A, quant as Q

log = logging.getLogger("siul")
PE_HOP = float(os.environ.get("SIUL_PERCH_HOP", A.PE_HOP))   # 2,5 s sama dengan paket latih (manifest: hop_sec = 2.5)


class LiveExtractor:
    name = "live"

    def __init__(self, features: dict, models_dir: str):
        from ..extract import ExtractorUnavailable
        self._Unavail = ExtractorUnavailable
        self.f, self.models_dir = features, models_dir
        self.cols_p, self.cols_b = np.asarray(features["perch_logit_cols"]), np.asarray(features["birdnet_logit_cols"])
        self.sc_p, self.sc_b = float(features["perch_logit_scale"]), float(features["birdnet_logit_scale"])
        self._lock = threading.Lock()          # TensorFlow CPU: satu klip pada satu waktu (hemat RAM)
        self._bn = self._pe = None

    # ---- kesiapan (tanpa memuat model)
    def problems(self) -> list[str]:
        from . import birdnet, perch
        miss = []
        for mod, pip in (("torch", "torch"), ("librosa", "librosa"), ("soundfile", "soundfile")):
            if importlib.util.find_spec(mod) is None:
                miss.append(f"paket python '{pip}' belum terpasang")
        if importlib.util.find_spec("tensorflow") is None:
            miss.append("paket python 'tensorflow' belum terpasang (dibutuhkan Perch v2)")
        if importlib.util.find_spec("ai_edge_litert") is None and importlib.util.find_spec("tensorflow") is None:
            miss.append("paket python 'ai-edge-litert' belum terpasang (dibutuhkan BirdNET)")
        if birdnet.find_model(self.models_dir) is None:
            miss.append(f"berkas BirdNET {birdnet.MODEL_NAME} tidak ditemukan (jalankan scripts/download_models.py)")
        if perch.find_saved_model(self.models_dir) is None:
            miss.append("folder Perch v2 (saved_model.pb) tidak ditemukan (jalankan scripts/download_models.py)")
        return miss

    @property
    def ready(self) -> bool:
        return not self.problems()

    def _load(self):
        if self._bn is not None:
            return
        from . import birdnet, perch
        pr = self.problems()
        if pr:
            raise self._Unavail("Ekstraktor audio belum lengkap: " + "; ".join(pr))
        log.info("memuat BirdNET dan Perch v2 ...")
        self._bn = birdnet.BirdNet(birdnet.find_model(self.models_dir), int(os.environ.get("SIUL_TFLITE_THREADS", "2")))
        self._pe = perch.Perch(perch.find_saved_model(self.models_dir))
        if self._pe.n_logit < int(self.cols_p.max()) + 1 or self._pe.n_emb != 1536:
            raise self._Unavail(f"Model Perch tidak cocok dengan paket latih (logit {self._pe.n_logit}, emb {self._pe.n_emb}).")
        log.info("model siap")

    def preload(self):
        with self._lock:
            self._load()

    # ---- ekstraksi satu klip
    def extract(self, filename: str, audio_path: str | None = None) -> ClipRep:
        from . import hf
        if not audio_path:
            raise self._Unavail("Jalur audio tidak tersedia.")
        try:
            with self._lock:
                self._load()
                x, sr = A.read_native(audio_path)
                x32, x48 = A.resample(x, sr, A.PE_SR), A.resample(x, sr, A.BN_SR)
                ep, lp = self._pe.run(x32, PE_HOP, A.PE_SR)
                eb, lb = self._bn.run(x48, A.BN_HOP, A.BN_SR)
                rep = ClipRep(file=os.path.basename(filename),
                              pe=Q.emb_mean_like_pack(ep), bn=Q.emb_mean_like_pack(eb),
                              hf=hf.hf_from_wave(hf.load_wave(audio_path)),
                              perch_logit=Q.logit_like_pack(lp.max(0), self.cols_p, self.sc_p),
                              bn_logit=Q.logit_like_pack(lb.max(0), self.cols_b, self.sc_b))
        except A.AudioError as e:
            raise ValueError(str(e)) from e
        assert rep.pe.shape == (1536,) and rep.bn.shape == (1024,) and rep.hf.shape == (750,)
        assert rep.perch_logit.shape == self.cols_p.shape and rep.bn_logit.shape == self.cols_b.shape
        return rep

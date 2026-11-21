"""Sumber representasi klip.

PackExtractor : membaca paket hasil notebook ekstraksi (01_meta_tech_hf.npz, 02_birdnet.npz, 03_perch.npz) dan mencocokkan
                nama berkas unggahan dengan `file_id`. Berguna untuk mencoba backend dengan klip kompetisi.
LiveExtractor : audio mentah -> Perch v2 + BirdNET v2.4 + 750 fitur hf (paket siul_core.live, port notebook ekstraksi).
"""
from __future__ import annotations
import os
from typing import Protocol
import numpy as np
from .rep import ClipRep


class ExtractorUnavailable(RuntimeError):
    pass


class ClipNotInPack(KeyError):
    pass


class Extractor(Protocol):
    name: str
    def extract(self, filename: str, audio_path: str | None) -> ClipRep: ...


def _mean_pool(p) -> np.ndarray:
    W = p["win_emb"].astype(np.float32) * p["win_scale"][:, None]
    off = np.r_[0, np.cumsum(p["n_win"])]
    return np.stack([W[off[i]:off[i + 1]].mean(0) for i in range(len(off) - 1)]).astype(np.float32)


class PackExtractor:
    name = "pack"

    def __init__(self, meta, bn, pe):
        ids = [str(x) for x in meta["file_id"]]
        self.index = {os.path.splitext(i)[0]: k for k, i in enumerate(ids)}
        self.hf = meta["hf"].astype(np.float32)
        self.pe, self.bn = _mean_pool(pe), _mean_pool(bn)
        self.lp = pe["logit"]; self.lp_s = float(pe["logit_scale"])
        self.lb = bn["logit"]; self.lb_s = float(bn["logit_scale"])

    @classmethod
    def from_dir(cls, d: str) -> "PackExtractor":
        import glob
        def find(n):
            hits = sorted(glob.glob(os.path.join(d, "**", n), recursive=True))
            if not hits:
                raise FileNotFoundError(f"{n} tidak ditemukan di {d}")
            return np.load(hits[0], allow_pickle=False)
        return cls(find("01_meta_tech_hf.npz"), find("02_birdnet.npz"), find("03_perch.npz"))

    def extract(self, filename: str, audio_path: str | None = None) -> ClipRep:
        stem = os.path.splitext(os.path.basename(filename))[0]
        if stem not in self.index:
            raise ClipNotInPack(filename)
        i = self.index[stem]
        return ClipRep(file=os.path.basename(filename), pe=self.pe[i], bn=self.bn[i], hf=self.hf[i],
                       perch_logit=self.lp[i].astype(np.float32) * self.lp_s, bn_logit=self.lb[i].astype(np.float32) * self.lb_s)


def make_live_extractor(features: dict, models_dir: str):
    """Pembuat LiveExtractor (impor malas agar backend tetap start tanpa torch/tensorflow)."""
    from .live.extractor import LiveExtractor
    return LiveExtractor(features, models_dir)

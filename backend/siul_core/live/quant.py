"""Meniru kuantisasi paket ekstraksi (notebook sel 12: pack_logit, pack_emb).

Model dilatih pada nilai yang SUDAH terkuantisasi (logit int8 langkah 0,25; embedding per jendela int8 dengan skala
per jendela, sebelumnya dibulatkan ke float16). Ekstraktor live harus meniru langkah yang sama agar sebaran sama.
"""
import numpy as np


def logit_like_pack(max_logit_full: np.ndarray, cols: np.ndarray, scale: float = 0.25) -> np.ndarray:
    sub = max_logit_full[cols].astype(np.float32)
    return (np.clip(np.round(sub / scale), -127, 127) * scale).astype(np.float32)


def emb_mean_like_pack(win_emb: np.ndarray) -> np.ndarray:
    """win_emb (W, D) float32 -> rata-rata antarjendela setelah float16 lalu int8 per jendela."""
    e = win_emb.astype(np.float16).astype(np.float32)
    sc = np.maximum(np.abs(e).max(1), 1e-6) / 127.0
    q = np.round(e / sc[:, None]) * sc[:, None]
    return q.mean(0).astype(np.float32)

"""Perch v2 (TensorFlow SavedModel) -- notebook sel 11 (PERCH_SCRIPT). Keluaran: 'embedding' (1536) dan 'label' (logit)."""
import glob, os
import numpy as np
from .audio import PE_WIN, make_windows


def find_saved_model(models_dir: str) -> str | None:
    root = os.environ.get("SIUL_PERCH_DIR") or os.path.join(models_dir, "perch_v2")
    hits = glob.glob(os.path.join(root, "**", "saved_model.pb"), recursive=True)
    return os.path.dirname(hits[0]) if hits else None


class Perch:
    BS = 8

    def __init__(self, saved_model_dir: str):
        import tensorflow as tf
        self.tf = tf
        self.fn = tf.saved_model.load(saved_model_dir).signatures["serving_default"]
        o = self.fn(inputs=tf.constant(np.zeros((1, PE_WIN), np.float32)))
        self.n_logit = int(o["label"].shape[-1]); self.n_emb = int(o["embedding"].shape[-1])

    def run(self, x32: np.ndarray, hop_sec: float, sr: int):
        W = make_windows(x32, PE_WIN, int(hop_sec * sr))
        lo, em = [], []
        for b in range(0, len(W), self.BS):
            out = self.fn(inputs=self.tf.constant(W[b:b + self.BS]))
            lo.append(out["label"].numpy()); em.append(out["embedding"].numpy())
        return np.concatenate(em).astype(np.float32), np.concatenate(lo).astype(np.float32)

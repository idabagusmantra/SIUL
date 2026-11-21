"""BirdNET v2.4 (TFLite) -- notebook sel 10. Embedding dipulihkan dari logit lewat pseudo-inverse kepala linear."""
import glob, importlib.util, os
import numpy as np
from .audio import BN_WIN, make_windows

MODEL_NAME = "BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite"


def find_model(models_dir: str) -> str | None:
    p = os.environ.get("SIUL_BIRDNET_MODEL")
    if p and os.path.exists(p):
        return p
    for cand in (os.path.join(models_dir, "birdnet", MODEL_NAME), os.path.join(models_dir, MODEL_NAME)):
        if os.path.exists(cand):
            return cand
    spec = importlib.util.find_spec("birdnetlib")
    if spec and spec.submodule_search_locations:
        hits = glob.glob(os.path.join(list(spec.submodule_search_locations)[0], "models", "analyzer", MODEL_NAME))
        if hits:
            return hits[0]
    return None


def _interpreter(path: str, threads: int):
    try:
        from ai_edge_litert.interpreter import Interpreter
        return Interpreter(model_path=path, num_threads=threads)
    except Exception:
        import tensorflow as tf
        return tf.lite.Interpreter(model_path=path, num_threads=threads)


class BirdNet:
    BS = 8

    def __init__(self, model_path: str, threads: int = 2):
        self.itp = _interpreter(model_path, threads)
        self.itp.allocate_tensors()
        det = self.itp.get_tensor_details()
        by = {d["name"]: d["index"] for d in det}
        wi = by.get("model/CLASS_DENSE_LAYER/MatMul") or [d["index"] for d in det if tuple(d["shape"]) == (6522, 1024)][0]
        bi = by.get("model/CLASS_DENSE_LAYER/BiasAdd/ReadVariableOp/resource") or \
            [d["index"] for d in det if tuple(d["shape"]) == (6522,) and "Bias" in d["name"]][0]
        W = self.itp.get_tensor(wi).astype(np.float64)
        self.b = self.itp.get_tensor(bi).astype(np.float32)
        self.Wp = np.linalg.pinv(W).T.astype(np.float32)          # emb = (logit - b) @ Wp
        self.inp = self.itp.get_input_details()[0]
        self.out = self.itp.get_output_details()[0]
        self.itp.resize_tensor_input(self.inp["index"], [self.BS, BN_WIN])
        self.itp.allocate_tensors()

    def run(self, x48: np.ndarray, hop_sec: float, sr: int):
        """-> (emb per jendela (W,1024) float32, logit per jendela (W,6522) float32)"""
        W = make_windows(x48, BN_WIN, int(hop_sec * sr))
        lo = []
        for s in range(0, len(W), self.BS):
            w = W[s:s + self.BS]; k = len(w)
            if k < self.BS:
                w = np.concatenate([w, np.zeros((self.BS - k, BN_WIN), np.float32)])
            self.itp.set_tensor(self.inp["index"], w); self.itp.invoke()
            lo.append(np.array(self.itp.get_tensor(self.out["index"])[:k]))
        lo = np.concatenate(lo)
        return ((lo - self.b) @ self.Wp).astype(np.float32), lo.astype(np.float32)

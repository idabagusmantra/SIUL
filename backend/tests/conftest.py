import os, numpy as np, pytest
from siul_core import load_bundle, SiulService, ClipRep

MODEL_DIR = os.getenv("SIUL_MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
PIPELINE = os.path.join(MODEL_DIR, "npc_open_set_pipeline.pkl")
PREDICTIONS = os.getenv("SIUL_PREDICTIONS_PKL", os.path.join(MODEL_DIR, "npc_predictions_final.pkl"))
need_model = pytest.mark.skipif(not os.path.exists(PIPELINE), reason="npc_open_set_pipeline.pkl tidak ada")


@pytest.fixture(scope="session")
def bundle():
    return load_bundle(PIPELINE)


@pytest.fixture(scope="session")
def service(bundle):
    return SiulService(bundle)


def synth_rep(b, name, seed, **over):
    """Representasi sintetis (BUKAN suara sungguhan): hanya untuk menguji perpipaan dan skema."""
    r = np.random.default_rng(seed)
    s = lambda v: (b.clf[v]["scaler"].mean_ + b.clf[v]["scaler"].scale_ * r.normal(0, 0.5, b.clf[v]["scaler"].mean_.shape)).astype(np.float32)
    f = b.features
    lp = r.normal(-3, 1, len(f["perch_labels"])).astype(np.float32)
    lb = r.normal(-3, 1, len(f["birdnet_labels"])).astype(np.float32)
    rep = ClipRep(file=name, pe=s("pe"), bn=b.wspace["bn"].scaler.mean_.astype(np.float32) + r.normal(0, 0.1, 1024).astype(np.float32), hf=s("hf"), perch_logit=lp, bn_logit=lb)
    for k, v in over.items():
        setattr(rep, k, v)
    return rep

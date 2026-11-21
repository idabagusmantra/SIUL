"""Pembentukan view dan fitur zero-shot (notebook Bagian 4.1-4.3)."""
import numpy as np
from sklearn.preprocessing import normalize
from .bundle import Bundle
from .rep import ClipRep


def log_sig(x):
    return -np.logaddexp(0, -x)


def build_views(b: Bundle, reps: list[ClipRep]) -> tuple[dict[str, np.ndarray], np.ndarray]:
    f = b.features
    LP = np.stack([r.perch_logit for r in reps]).astype(np.float32)
    LB = np.stack([r.bn_logit for r in reps]).astype(np.float32)
    views = {
        "pe": np.stack([r.pe for r in reps]).astype(np.float32),
        "bn": np.stack([r.bn for r in reps]).astype(np.float32),
        "hf": np.stack([r.hf for r in reps]).astype(np.float32),
        "prof": np.hstack([log_sig(LP[:, f["prof_mask_perch"]]), log_sig(LB[:, f["prof_mask_birdnet"]])]).astype(np.float32),
    }
    return views, LP


def taxonomy(b: Bundle, LP: np.ndarray) -> dict[str, np.ndarray]:
    f = b.features
    g = lambda idx: LP[:, idx].max(1) if len(idx) else np.full(len(LP), -99.0)
    aur, pyc = g(f["i_aur"]), g(f["i_pyc"])
    return {"K_aur": aur, "K_sib": aur - pyc, "B_lon": g(f["i_lon"]), "C_par": g(f["i_par"])}


def zs_flags(T: dict[str, np.ndarray], th: dict) -> dict[str, np.ndarray]:
    return {"K": (T["K_aur"] >= th["K_aur"]) & (T["K_sib"] >= th["K_sib"]), "C": T["C_par"] >= th["C_par"], "B": T["B_lon"] >= th["B_lon"]}


def lr_emb(m: dict, X: np.ndarray) -> np.ndarray:
    return normalize(m["pca"].transform(m["scaler"].transform(X))) * np.sqrt(m["pca"].n_components_) / 3


def ens_proba(b: Bundle, views: dict[str, np.ndarray]) -> np.ndarray:
    """Rata-rata log-probabilitas LogReg tiga view (prof, hf, pe); urutan kelas: Bondol, Cendrawasih, Kutilang."""
    lps = [np.log(np.clip(b.clf[v]["lr"].predict_proba(lr_emb(b.clf[v], views[v])), 1e-6, 1)) for v in b.config["CLF_SPECS"]]
    lp = np.mean(lps, 0)
    p = np.exp(lp - lp.max(1, keepdims=True))
    return p / p.sum(1, keepdims=True)


def wspace(b: Bundle, views: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
    out = {}
    for v in b.config["SIM_VIEWS"]:
        t = b.wspace[v]
        out[v] = normalize(t.pca.transform(t.scaler.transform(views[v])) @ t.wccn)
    return out


def clip_group_sim(b: Bundle, WS: dict[str, np.ndarray]) -> np.ndarray:
    """S_clip (n, 3): kemiripan maksimum ke centroid group latih per kelas, rata-rata antar view."""
    S = np.mean([WS[v] @ b.centroids[v].T for v in b.config["SIM_VIEWS"]], 0)
    return np.stack([S[:, b.group_class == c].max(1) for c in range(3)], 1)

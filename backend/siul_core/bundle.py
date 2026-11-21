"""Memuat npc_open_set_pipeline.pkl.

Pickle dapat mengeksekusi kode saat dimuat. Karena itu load_bundle memakai unpickler dengan DAFTAR PUTIH EKSAK: hanya
delapan kelas yang memang dibutuhkan bundle (ndarray, dtype, PCA, LogisticRegression, StandardScaler, dan helper
rekonstruksi numpy). Mengizinkan seluruh paket numpy/sklearn tidak aman karena di dalamnya ada fungsi yang dapat
menjalankan kode. Tetap hanya muat berkas dari sumber tepercaya.
"""
from __future__ import annotations
import builtins, logging, pickle
from dataclasses import dataclass
from typing import Any
import numpy as np

log = logging.getLogger("siul")

# Dihasilkan dengan merekam semua find_class saat memuat bundle (lihat test_allowlist_matches_bundle).
ALLOWED_GLOBALS: frozenset[tuple[str, str]] = frozenset({
    ("numpy", "dtype"), ("numpy", "ndarray"),
    ("numpy._core.multiarray", "_reconstruct"), ("numpy._core.multiarray", "scalar"), ("numpy._core.numeric", "_frombuffer"),
    ("numpy.core.multiarray", "_reconstruct"), ("numpy.core.multiarray", "scalar"), ("numpy.core.numeric", "_frombuffer"),
    ("sklearn.decomposition._pca", "PCA"),
    ("sklearn.linear_model._logistic", "LogisticRegression"),
    ("sklearn.preprocessing._data", "StandardScaler"),
})
# Hanya untuk berkas uji non-produksi (mis. prediksi berisi pandas); jangan dipakai untuk model.
_LEGACY_ROOTS = {"numpy", "scipy", "sklearn", "collections", "copyreg", "_codecs"}
_LEGACY_BUILTINS = {"slice", "set", "frozenset", "complex", "bytearray", "range", "list", "dict", "tuple", "int", "float", "str", "bool", "bytes", "object"}


class _Restricted(pickle.Unpickler):
    extra_roots: set[str] | None = None   # None = mode ketat (daftar putih eksak)

    def find_class(self, module: str, name: str):
        if self.extra_roots is None:
            if (module, name) in ALLOWED_GLOBALS:
                return super().find_class(module, name)
            raise pickle.UnpicklingError(f"Kelas tidak diizinkan di pickle: {module}.{name}")
        root = module.split(".")[0]
        if root == "builtins" and name in _LEGACY_BUILTINS:
            return getattr(builtins, name)
        if root in _LEGACY_ROOTS | self.extra_roots and root != "builtins":
            if root == "_codecs" and name != "encode":
                raise pickle.UnpicklingError(f"dilarang: {module}.{name}")
            return super().find_class(module, name)
        raise pickle.UnpicklingError(f"Kelas tidak diizinkan di pickle: {module}.{name}")


def safe_load(path: str, extra_roots: set[str] | None = None) -> Any:
    """extra_roots=None: mode ketat. Memberi extra_roots (mis. {"pandas"}) memakai mode longgar khusus berkas uji."""
    class U(_Restricted):
        pass
    U.extra_roots = None if extra_roots is None else set(extra_roots)
    with open(path, "rb") as f:
        return U(f).load()


@dataclass
class Transform:
    scaler: Any
    pca: Any
    wccn: np.ndarray


@dataclass
class Bundle:
    cfg: dict            # config['CFG'] (ambang aturan)
    config: dict         # seluruh config (ZS, CLUSTERINGS, ...)
    features: dict
    clf: dict            # view -> {scaler, pca, lr}
    wspace: dict[str, Transform]
    group_list: list
    group_class: np.ndarray
    centroids: dict[str, np.ndarray]
    ref_max: np.ndarray
    versions: dict

    @property
    def names(self) -> list[str]:
        return list(self.config["CLASSES"]) + [self.config["UNKNOWN"]]


def load_bundle(path: str) -> Bundle:
    raw = safe_load(path)
    import sklearn
    v = raw.get("versions", {})
    if v.get("sklearn") and v["sklearn"].split(".")[:2] != sklearn.__version__.split(".")[:2]:
        log.warning("scikit-learn %s != %s saat pelatihan; pasang versi yang sama (lihat requirements.txt).", sklearn.__version__, v["sklearn"])
    return Bundle(
        cfg=raw["config"]["CFG"], config=raw["config"], features=raw["features"], clf=raw["clf_models"],
        wspace={k: Transform(t["scaler"], t["pca"], np.asarray(t["wccn"])) for k, t in raw["wspace_transforms"].items()},
        group_list=list(raw["group_list"]), group_class=np.asarray(raw["group_class"]),
        centroids={k: np.asarray(c) for k, c in raw["group_centroids"].items()},
        ref_max=np.asarray(raw["REF_MAX"]), versions=v,
    )

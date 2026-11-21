"""Orkestrasi: representasi klip -> hasil sesuai kontrak antarmuka (lib/types.ts)."""
from __future__ import annotations
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import normalize
from . import features as F, rules as R
from .bundle import Bundle
from .clustering import cluster_runs, ref_index, MIN_CLIPS
from .rep import ClipRep

RELIABLE_MIN = 20


def _ev_cluster(e: dict) -> dict:
    return dict(fK=e["fK"], fC=e["fC"], fB=e["fB"], mB=e["mB"], mC=e["mC"], mK=e["mK"], cB=e["cB"], pB=e["pB"], pK=e["pK"], medNonTarget=e["ex_logit"], e=e["ex"])


class SiulService:
    def __init__(self, bundle: Bundle):
        self.b = bundle
        self.names = bundle.names

    def _prepare(self, reps: list[ClipRep]):
        views, LP = F.build_views(self.b, reps)
        T = F.taxonomy(self.b, LP)
        ZF = F.zs_flags(T, self.b.config["ZS"])
        SF = F.zs_flags(T, self.b.config["ZS_STRONG"])
        P = F.ens_proba(self.b, views)
        WS = F.wspace(self.b, views)
        return LP, T, ZF, SF, P, WS, F.clip_group_sim(self.b, WS)

    # ---------- klip tunggal ----------
    def analyze_single(self, rep: ClipRep) -> dict:
        LP, T, ZF, SF, P, WS, S = self._prepare([rep])
        ii = np.array([0])
        e = R.unit_evidence(self.b, ii, LP, WS, S, ZF, P)
        lab, rule, reason = R.decide(e, self.b.cfg, self.names)
        flipped = R.strong_flip(np.array([lab]), {k: v[ii] for k, v in SF.items()}, self.b.cfg)[0]
        if flipped != lab:
            lab, rule, reason = int(flipped), 1, f"Detektor zero-shot kuat {self.names[flipped]} terpicu pada klip ini."
        ev = dict(kaur=float(T["K_aur"][0]), ksib=float(T["K_sib"][0]), blon=float(T["B_lon"][0]), cpar=float(T["C_par"][0]),
                  pB=e["pB"], pC=e["pC"], pK=e["pK"], mB=e["mB"], mC=e["mC"], mK=e["mK"], cB=e["cB"], medNonTarget=e["ex_logit"], e=e["ex"])
        return {"result": {"file": rep.file, "label": self.names[lab], "rule": rule, "reason": reason, "evidence": ev}}

    # ---------- batch ----------
    def analyze_batch(self, reps: list[ClipRep]) -> dict:
        n = len(reps)
        LP, T, ZF, SF, P, WS, S = self._prepare(reps)
        runs = cluster_runs(self.b, WS)
        votes = np.zeros((n, 4))
        for cl in runs:
            d = np.array([R.decide(R.unit_evidence(self.b, np.where(cl == u)[0], LP, WS, S, ZF, P), self.b.cfg, self.names)[0] for u in range(cl.max() + 1)])
            votes[np.arange(n), d[cl]] += 1
        votes /= len(runs)
        lab = R.strong_flip(votes.argmax(1), SF, self.b.cfg)
        conf = votes.max(1)

        ref = runs[ref_index(self.b)]
        order = sorted(range(ref.max() + 1), key=lambda u: -(ref == u).sum())
        cid = {u: f"S{i + 1:02d}" for i, u in enumerate(order)}
        clusters = []
        for u in order:
            ii = np.where(ref == u)[0]
            e = R.unit_evidence(self.b, ii, LP, WS, S, ZF, P)
            l, rule, reason = R.decide(e, self.b.cfg, self.names)
            clusters.append({"id": cid[u], "n": len(ii), "files": [reps[i].file for i in ii], "evidence": _ev_cluster(e),
                             "label": self.names[l], "rule": rule, "reason": reason, "agreement": float(conf[ii].mean())})
        xy = self._project(WS)
        clips = [{"file": reps[i].file, "cluster": cid[ref[i]], "label": self.names[lab[i]], "x": float(xy[i, 0]), "y": float(xy[i, 1])} for i in range(n)]
        warnings = []
        if n < MIN_CLIPS:
            warnings.append(f"Hanya {n} klip: pengelompokan dilewati dan seluruh klip dianggap satu sumber.")
        elif n < RELIABLE_MIN:
            warnings.append(f"Hanya {n} klip: pengelompokan sumber kurang stabil. Pipeline divalidasi pada ratusan klip; gunakan lebih banyak klip dari lokasi yang sama bila ada.")
        return {"clips": clips, "clusters": clusters, "warnings": warnings}

    @staticmethod
    def _project(WS: dict[str, np.ndarray]) -> np.ndarray:
        Z = normalize(np.hstack([WS[v] for v in ("pe", "prof") if v in WS]))
        xy = PCA(2, svd_solver="full").fit_transform(Z) if len(Z) > 2 else np.c_[np.arange(len(Z)), np.zeros(len(Z))].astype(float)
        m = np.abs(xy).max()
        return xy / m if m > 0 else xy

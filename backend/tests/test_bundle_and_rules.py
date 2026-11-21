import os, pickle, numpy as np, pytest
from siul_core.bundle import safe_load
from siul_core import rules as R, features as F
from conftest import need_model, PREDICTIONS

NAMES = ["Bondol Jawa", "Cendrawasih", "Kutilang", "Unknown"]


@need_model
def test_bundle_dimensions(bundle):
    f = bundle.features
    assert f["prof_mask_perch"].sum() + f["prof_mask_birdnet"].sum() == 17855
    assert bundle.names == NAMES
    assert bundle.group_class.tolist() == [0] * 7 + [1] * 4 + [2] * 4
    for v in ("pe", "prof", "bn"):
        assert bundle.centroids[v].shape == (15, 96) and bundle.wspace[v].wccn.shape == (96, 96)


def test_restricted_unpickler_blocks_code(tmp_path):
    class Evil:
        def __reduce__(self):
            return (os.system, ("echo pwned",))
    p = tmp_path / "evil.pkl"; p.write_bytes(pickle.dumps(Evil()))
    with pytest.raises(pickle.UnpicklingError):
        safe_load(str(p))


def ev(**o):
    base = dict(fK=0, fC=0, fB=0, pB=0.1, pC=0.1, pK=0.1, mB=0.1, mC=0.0, mK=0.1, cB=0.1, cC=0, cK=0, ex=0.0, ex_logit=0.0, ex_species="x")
    base.update(o); return base


@need_model
@pytest.mark.parametrize("e,label,rule", [
    (ev(fK=0.8), 2, 1), (ev(fC=0.6), 1, 1), (ev(fB=0.9), 0, 1),
    (ev(pK=0.7, mK=0.5), 2, 2),
    (ev(ex=4, ex_logit=8, mB=0.6, cB=0.9, pB=0.9), 3, 3),          # veto menang atas Bondol-saudara
    (ev(mB=0.6, cB=0.8, pB=0.7), 0, 4),
    (ev(mK=0.45, pK=0.55, fK=0.25), 2, 5),
    (ev(fC=0.43, pC=0.92), 3, 6),                                   # kasus kakatua: di bawah ambang
    (ev(), 3, 6),
])
def test_decide_branches(bundle, e, label, rule):
    l, r, reason = R.decide(e, bundle.cfg, bundle.names)
    assert (l, r) == (label, rule) and reason


@need_model
@pytest.mark.skipif(not os.path.exists(PREDICTIONS), reason="npc_predictions_final.pkl tidak ada")
def test_rules_reproduce_notebook_cluster_decisions(bundle):
    """Setiap cluster acuan: aturan di backend harus menghasilkan keputusan yang sama dengan notebook."""
    p = safe_load(PREDICTIONS, extra_roots={"pandas"})
    cr = p["cluster_evidence"]
    assert len(cr) == 22
    for _, row in cr.iterrows():
        e = {k: float(row[k]) if k not in ("ex_species",) else row[k] for k in ["fK", "fC", "fB", "mB", "mC", "mK", "cB", "cC", "cK", "pB", "pC", "pK", "ex", "ex_species", "ex_logit"]}
        assert NAMES[R.decide(e, bundle.cfg, NAMES)[0]] == row["keputusan"], row["cluster"]


@need_model
@pytest.mark.skipif(not os.path.exists(PREDICTIONS), reason="npc_predictions_final.pkl tidak ada")
def test_zero_shot_flags_match_notebook(bundle):
    p = safe_load(PREDICTIONS, extra_roots={"pandas"})
    T = {k: p["TAX"][k].values for k in ("K_aur", "K_sib", "B_lon", "C_par")}
    for name, th, key in (("ZF", bundle.config["ZS"], "ZF"), ("ZS_STRONG", bundle.config["ZS_STRONG"], "ZF_STRONG")):
        got = F.zs_flags(T, th)
        for c in "KCB":
            assert (got[c] == p[key][c].values).all(), (key, c)


def test_strict_loader_blocks_numpy_gadget(tmp_path):
    """Modul numpy mengandung fungsi yang dapat mengeksekusi kode; mode ketat harus menolaknya."""
    import numpy.testing._private.utils as u
    class Evil:
        def __reduce__(self):
            return (u.runstring, ("print('pwned')", {}))
    p = tmp_path / "gadget.pkl"; p.write_bytes(pickle.dumps(Evil()))
    with pytest.raises(pickle.UnpicklingError):
        safe_load(str(p))


@need_model
def test_allowlist_matches_bundle():
    """Daftar putih harus cukup untuk bundle asli (load_bundle sukses) dan tidak lebih dari yang dipakai."""
    from siul_core import bundle as B
    seen = set(); orig = B._Restricted.find_class
    B._Restricted.find_class = lambda self, m, n: (seen.add((m, n)), orig(self, m, n))[1]
    try:
        B.safe_load(__import__("conftest").PIPELINE)
    finally:
        B._Restricted.find_class = orig
    assert seen and seen <= B.ALLOWED_GLOBALS

"""Perpipaan end-to-end dengan representasi SINTETIS (bukan suara). Menguji bentuk, skema, determinisme, dan jalur aturan."""
import numpy as np
from conftest import need_model, synth_rep

LABELS = {"Bondol Jawa", "Cendrawasih", "Kutilang", "Unknown"}


@need_model
def test_single_zero_shot_kutilang(bundle, service):
    f = bundle.features
    lp = np.full(len(f["perch_labels"]), -5, np.float32)
    lp[f["i_aur"]] = 8.0                      # P. aurigaster kuat, bulbul lain rendah
    r = service.analyze_single(synth_rep(bundle, "k.flac", 1, perch_logit=lp))["result"]
    assert (r["label"], r["rule"]) == ("Kutilang", 1)
    e = r["evidence"]
    assert e["kaur"] == 8.0 and e["ksib"] >= 13 and 0 <= e["pK"] <= 1 and abs(e["pB"] + e["pC"] + e["pK"] - 1) < 1e-6


@need_model
def test_single_default_unknown_and_schema(bundle, service):
    r = service.analyze_single(synth_rep(bundle, "x.flac", 2))["result"]
    assert r["label"] in LABELS and 1 <= r["rule"] <= 6 and r["reason"]
    assert set(r["evidence"]) == {"kaur", "ksib", "blon", "cpar", "pB", "pC", "pK", "mB", "mC", "mK", "cB", "medNonTarget", "e"}
    assert r == service.analyze_single(synth_rep(bundle, "x.flac", 2))["result"]      # deterministik


@need_model
def test_single_strong_cendrawasih_does_not_flip_by_default(bundle, service):
    f = bundle.features
    lp = np.full(len(f["perch_labels"]), -5, np.float32); lp[f["i_par"][0]] = 6.0       # >= 4 (normal) dan >= 5.5 (kuat)
    r = service.analyze_single(synth_rep(bundle, "c.flac", 3, perch_logit=lp))["result"]
    assert r["label"] == "Cendrawasih" and r["rule"] == 1                                # frac_zs: 1/1 >= 0,5


@need_model
def test_batch_schema_and_determinism(bundle, service):
    reps = [synth_rep(bundle, f"clip{i:02d}.flac", i) for i in range(30)]
    a = service.analyze_batch(reps); b = service.analyze_batch(reps)
    assert a == b
    assert len(a["clips"]) == 30 and sum(c["n"] for c in a["clusters"]) == 30
    ids = {c["id"] for c in a["clusters"]}
    assert all(c["cluster"] in ids and c["label"] in LABELS and -1.0001 <= c["x"] <= 1.0001 for c in a["clips"])
    for c in a["clusters"]:
        assert 0 < c["agreement"] <= 1 and set(c["evidence"]) == {"fK", "fC", "fB", "mB", "mC", "mK", "cB", "pB", "pK", "medNonTarget", "e"}
    assert a["warnings"] == []


@need_model
def test_batch_small_warns_and_tiny_is_single_source(bundle, service):
    two = service.analyze_batch([synth_rep(bundle, f"a{i}.flac", i) for i in range(2)])
    assert len(two["clusters"]) == 1 and two["warnings"]
    ten = service.analyze_batch([synth_rep(bundle, f"b{i}.flac", 10 + i) for i in range(10)])
    assert ten["warnings"] and sum(c["n"] for c in ten["clusters"]) == 10


@need_model
def test_batch_kutilang_group_is_labelled_by_consensus(bundle, service):
    f = bundle.features
    reps = []
    for i in range(24):
        lp = np.full(len(f["perch_labels"]), -5, np.float32); lp[f["i_aur"]] = 8.0
        reps.append(synth_rep(bundle, f"k{i}.flac", 100 + i, perch_logit=lp))
    out = service.analyze_batch(reps)
    assert {c["label"] for c in out["clips"]} == {"Kutilang"}

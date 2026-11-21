import io, numpy as np, pytest
from fastapi.testclient import TestClient
from conftest import need_model, synth_rep
from siul_core.extract import PackExtractor, ClipNotInPack


def make_pack(b, ids, seeds):
    n = len(ids); f = b.features
    reps = [synth_rep(b, i, s) for i, s in zip(ids, seeds)]
    def pk(embs, logits, scale):
        W = np.repeat(np.stack(embs)[:, None, :], 2, 1).reshape(2 * n, -1)           # 2 jendela identik per klip
        return {"win_emb": (W / 0.01).astype(np.int8) if False else W.astype(np.float32), "win_scale": np.ones(2 * n, np.float32),
                "n_win": np.full(n, 2), "logit": (np.stack(logits) / scale).astype(np.float32), "logit_scale": scale}
    meta = {"file_id": np.array(ids), "hf": np.stack([r.hf for r in reps])}
    return meta, pk([r.bn for r in reps], [r.bn_logit for r in reps], 0.25), pk([r.pe for r in reps], [r.perch_logit for r in reps], 0.25), reps


@need_model
def test_pack_extractor_roundtrip(bundle):
    meta, bn, pe, reps = make_pack(bundle, ["abc", "def"], [1, 2])
    ex = PackExtractor(meta, bn, pe)
    r = ex.extract("abc.flac")
    assert np.allclose(r.pe, reps[0].pe, atol=1e-5) and np.allclose(r.perch_logit, reps[0].perch_logit, atol=1e-4) and np.allclose(r.hf, reps[0].hf)
    with pytest.raises(ClipNotInPack):
        ex.extract("zzz.flac")


@need_model
def test_api_live_extractor_is_503_and_pack_works(bundle, monkeypatch):
    import main
    monkeypatch.setenv("SIUL_EXTRACTOR", "live")
    with TestClient(main.app) as c:
        h = c.get("/v1/health").json(); assert h["ok"] and h["extractor"] == "live" and not h["extractor_ready"]
        r = c.post("/v1/analyze/single", files=[("files", ("a.flac", b"x", "audio/flac"))])
        assert r.status_code == 503 and "Ekstraktor" in r.json()["detail"]
        assert c.post("/v1/analyze/single", files=[("files", ("a.flac", b"x")), ("files", ("b.flac", b"x"))]).status_code == 400
        assert c.post("/v1/analyze/batch", files=[("files", ("a.flac", b"x"))]).status_code == 400

    ids = [f"clip{i:02d}" for i in range(24)]
    meta, bn, pe, _ = make_pack(bundle, ids, range(24))
    monkeypatch.setattr(main, "build_extractor", lambda: PackExtractor(meta, bn, pe))
    with TestClient(main.app) as c:
        assert c.get("/v1/health").json()["extractor_ready"]
        one = c.post("/v1/analyze/single", files=[("files", ("clip03.flac", b"x"))]); assert one.status_code == 200
        assert one.json()["result"]["file"] == "clip03.flac"
        many = c.post("/v1/analyze/batch", files=[("files", (f"{i}.flac", b"x")) for i in ids]); assert many.status_code == 200 and len(many.json()["clips"]) == 24
        miss = c.post("/v1/analyze/single", files=[("files", ("nope.flac", b"x"))]); assert miss.status_code == 422


@need_model
def test_api_key_enforced(bundle, monkeypatch):
    import main
    monkeypatch.setattr(main, "API_KEY", "rahasia")
    with TestClient(main.app) as c:
        assert c.post("/v1/analyze/single", files=[("files", ("a.flac", b"x"))]).status_code == 401
        assert c.post("/v1/analyze/single", files=[("files", ("a.flac", b"x"))], headers={"Authorization": "Bearer rahasia"}).status_code == 503


@need_model
def test_upload_size_limit_413(bundle, monkeypatch):
    import main
    monkeypatch.setattr(main, "MAX_BYTES", 1024)
    with TestClient(main.app) as c:
        r = c.post("/v1/analyze/single", files=[("files", ("a.flac", b"x" * 5000))])
        assert r.status_code == 413

"""Tes ekstraktor live TANPA model/torch/tensorflow: menguji jendela, kuantisasi, orkestrasi, dan 503 saat model belum ada.
Pemeriksaan terhadap audio nyata ada di scripts/verify_live.py."""
import numpy as np, pytest
from siul_core.live import audio as A, quant as Q
from siul_core.live.extractor import LiveExtractor


def test_windows_match_notebook_rule():
    assert A.make_windows(np.zeros(32000 * 12, np.float32), A.PE_WIN, int(2.5 * 32000)).shape == (4, 160000)   # 0, 2.5, 5, 7 (digeser)
    assert A.make_windows(np.zeros(32000, np.float32), A.PE_WIN, 80000).shape == (1, 160000)                   # dipad nol
    w = A.make_windows(np.arange(48000 * 10, dtype=np.float32), A.BN_WIN, int(1.5 * 48000))
    assert w.shape[0] == 6 and w[-1][-1] == 48000 * 10 - 1                                                      # jendela terakhir menempel ke ujung


def test_logit_quantization_like_pack():
    cols = np.array([0, 2, 3])
    q = Q.logit_like_pack(np.array([1.13, 9, -50.0, 40.0], np.float32), cols, 0.25)
    assert np.allclose(q, [1.25, -31.75, 31.75])      # dibulatkan ke langkah 0,25 dan dipotong di +-127*0,25


def test_embedding_quantization_close_and_deterministic():
    r = np.random.default_rng(0).normal(size=(5, 1536)).astype(np.float32)
    a, b = Q.emb_mean_like_pack(r), Q.emb_mean_like_pack(r)
    assert np.array_equal(a, b) and np.abs(a - r.astype(np.float16).astype(np.float32).mean(0)).max() < 0.01


@pytest.fixture
def feats():
    return dict(perch_logit_cols=np.arange(0, 100), birdnet_logit_cols=np.arange(0, 40), perch_logit_scale=0.25, birdnet_logit_scale=0.25)


def test_extractor_reports_missing_models_as_503(feats, tmp_path):
    from siul_core.extract import ExtractorUnavailable
    ex = LiveExtractor(feats, str(tmp_path))
    assert not ex.ready and ex.problems()
    with pytest.raises(ExtractorUnavailable):
        ex.extract("a.flac", "/tmp/x.flac")


def test_extractor_orchestration_with_fakes(feats, tmp_path, monkeypatch):
    from siul_core.live import extractor as X, hf
    ex = LiveExtractor(feats, str(tmp_path))
    class FakePe:
        n_logit, n_emb = 14795, 1536
        def run(self, x, hop, sr): w = 3; return np.ones((w, 1536), np.float32), np.full((w, 14795), 2.0, np.float32)
    class FakeBn:
        def run(self, x, hop, sr): w = 5; return np.ones((w, 1024), np.float32), np.full((w, 6522), -1.0, np.float32)
    ex._pe, ex._bn = FakePe(), FakeBn()
    monkeypatch.setattr(ex, "problems", lambda: [])
    monkeypatch.setattr(A, "read_native", lambda p: (np.zeros(48000, np.float32), 48000))
    monkeypatch.setattr(hf, "load_wave", lambda p: None)
    monkeypatch.setattr(hf, "hf_from_wave", lambda w: np.zeros(750, np.float32))
    r = ex.extract("klip.flac", "/tmp/klip.flac")
    assert r.file == "klip.flac" and r.pe.shape == (1536,) and r.bn.shape == (1024,) and r.hf.shape == (750,)
    assert r.perch_logit.shape == (100,) and np.allclose(r.perch_logit, 2.0) and np.allclose(r.bn_logit, -1.0)

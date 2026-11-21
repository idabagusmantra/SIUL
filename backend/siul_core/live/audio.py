"""Baca audio dan potong jendela untuk model pretrained (notebook sel 9: read_mono + make_windows)."""
import math
import numpy as np
from scipy.signal import resample_poly

MAX_SEC = 20.0
PE_SR, PE_WIN, PE_HOP = 32000, 160000, 2.5   # Perch v2: jendela 5 s, geser 2,5 s
BN_SR, BN_WIN, BN_HOP = 48000, 144000, 1.5   # BirdNET v2.4: jendela 3 s, geser 1,5 s


class AudioError(ValueError):
    pass


def read_native(path: str):
    """-> (mono float32 pada sample-rate asli, sr). Rata-rata kanal, dipotong MAX_SEC detik pertama.
    Notebook asli diam-diam memakai nol bila berkas rusak; di sini dilaporkan sebagai AudioError."""
    try:
        import soundfile as sf
        x, sr = sf.read(path, dtype="float32", always_2d=True)
        x = x.mean(1)
    except Exception:
        try:
            import librosa
            x, sr = librosa.load(path, sr=None, mono=True)
        except Exception as e:
            raise AudioError(f"Berkas audio tidak dapat dibaca: {e}") from e
    if len(x) == 0:
        raise AudioError("Berkas audio kosong")
    return x[: int(MAX_SEC * sr)].astype(np.float32), int(sr)


def resample(x: np.ndarray, sr: int, sr_out: int) -> np.ndarray:
    if sr != sr_out:
        g = math.gcd(sr, sr_out)
        x = resample_poly(x, sr_out // g, sr // g)
    return np.ascontiguousarray(x, dtype=np.float32)


def make_windows(x: np.ndarray, win: int, hop: int) -> np.ndarray:
    if len(x) < win:
        x = np.pad(x, (0, win - len(x)))
    starts = list(range(0, len(x) - win + 1, hop))
    if starts[-1] + win < len(x):
        starts.append(len(x) - win)
    return np.stack([x[s:s + win] for s in starts]).astype(np.float32)

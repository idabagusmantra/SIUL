"""750 fitur akustik (hf): salinan LANGSUNG dari notebook ekstraksi (sel 6, 5, dan bagian log-mel sel 4).

Perbedaan dari notebook hanya: berjalan per klip di CPU, tanpa batch GPU. Jangan ubah konstanta atau rumus:
sedikit saja berbeda akan menggeser fitur dari distribusi data latih.
"""
import math
import numpy as np
import scipy.fft
import scipy.ndimage as ndi
from scipy.signal import resample_poly

SR, N_FFT, HOP, N_MELS, FMIN, FMAX, MAX_SEC = 32000, 1024, 320, 128, 300, 14000, 20.0
N_HF = 750

_S = {}


def _setup():
    """Inisialisasi malas: torch dan librosa baru dimuat saat dibutuhkan."""
    if _S:
        return _S
    import torch, librosa
    import torch.nn.functional as F
    torch.set_num_threads(max(1, int(__import__("os").environ.get("SIUL_TORCH_THREADS", "2"))))
    g = globals()
    g["torch"], g["F"], g["librosa"] = torch, F, librosa
    g["DEVICE"] = torch.device("cpu")
    g["MEL_FB"] = torch.tensor(librosa.filters.mel(sr=SR, n_fft=N_FFT, n_mels=N_MELS, fmin=FMIN, fmax=FMAX), dtype=torch.float32)
    g["MEL_F"] = librosa.mel_frequencies(n_mels=N_MELS + 2, fmin=FMIN, fmax=FMAX)[1:-1].astype(np.float32)
    g["MEL_OCT"] = np.log2(g["MEL_F"] / 1000.0).astype(np.float32)
    g["MEL_F_T"] = torch.tensor(g["MEL_F"])
    g["MEL_OCT_T"] = torch.tensor(g["MEL_OCT"])
    g["WIN"] = torch.hann_window(N_FFT)
    g["ACT_DB"], g["SEG_DB"] = 5.0, 5.0
    g["_DCT"] = torch.tensor(scipy.fft.dct(np.eye(N_MELS), type=2, norm="ortho", axis=0)[:20], dtype=torch.float32)
    g["_LAGS"] = torch.tensor(np.unique(np.round(np.geomspace(2, 150, 16)).astype(int)))
    _BAND6 = [(300, 1000), (1000, 2000), (2000, 3000), (3000, 5000), (5000, 8000), (8000, 14001)]
    g["_B6"] = [torch.tensor((g["MEL_F"] >= a) & (g["MEL_F"] < b)) for a, b in _BAND6]
    g["_MODB"] = np.geomspace(0.5, 40, 17)
    g["_DUR_E"] = np.array([0, 5, 15, 40, 1e9]); g["_FC_E"] = np.array([-2, -1, -0.3, 0.4, 1.2, 2, 4.5])
    _S["ok"] = True
    return _S


# =====================================================================================
# 5. DENOISE 2 SUMBU
# =====================================================================================
def denoise(db):
    """db [..., M, T] -> (E: 2-sumbu, D: median-band), keduanya >= 0 (dB di atas background)."""
    bm = db.median(dim=-1, keepdim=True).values
    fm = db.median(dim=-2, keepdim=True).values
    E = (db - torch.maximum(bm + 3.0, fm + 6.0)).clamp(min=0)
    D = (db - bm).clamp(min=0)
    return E, D

# =====================================================================================
# 6. EKSTRAKSI FITUR AKUSTIK (GPU + segmen di CPU)
# =====================================================================================


def _stats5(v):
    if v.numel() == 0:
        return torch.zeros(5)
    q = torch.quantile(v, torch.tensor([0.1, 0.5, 0.9]))
    return torch.cat([v.mean().view(1), v.std(unbiased=False).view(1), q])


def _np_stats5(v):
    v = np.asarray(v, np.float64)
    if len(v) == 0:
        return np.zeros(5)
    return np.array([v.mean(), v.std(), *np.percentile(v, [10, 50, 90])])


def seg_features(E_np, Es_np):
    """Segmen suku kata (komponen terhubung) dari E yang dihaluskan."""
    T = E_np.shape[1]
    mask = Es_np > SEG_DB
    lab, n = ndi.label(mask, structure=np.ones((3, 3)))
    rows = []
    if n > 0:
        for i, sl in enumerate(ndi.find_objects(lab)):
            if sl is None:
                continue
            sub = lab[sl] == (i + 1)
            area = int(sub.sum())
            if area < 8:
                continue
            f0, f1 = sl[0].start, sl[0].stop; t0, t1 = sl[1].start, sl[1].stop
            e = E_np[sl] * sub
            tot = e.sum() + 1e-6
            fc = float((e.sum(1) * MEL_OCT[f0:f1]).sum() / tot)
            pk = MEL_OCT[f0 + e.argmax(0)]
            slope = float((pk[-1] - pk[0]) / max(t1 - t0, 1) * 100.0)
            rows.append((t0, t1 - t0, fc, MEL_OCT[f1 - 1] - MEL_OCT[f0], slope, float(e.max())))
    out = [len(rows) / (T / 100.0)]
    if rows:
        r = np.array(rows, np.float64)
        for j in (1, 2, 3, 4, 5):
            out += list(_np_stats5(r[:, j]))
        out += [(r[:, 4] > 1).mean(), (r[:, 4] < -1).mean()]
        st = np.sort(r[:, 0]); ioi = np.diff(st)
        out += [ioi.mean(), ioi.std(), np.median(ioi), ioi.std() / (ioi.mean() + 1e-6)] if len(ioi) else [0, 0, 0, 0]
        h, _, _ = np.histogram2d(r[:, 1], r[:, 2], bins=[_DUR_E, _FC_E])
        out += list((h / max(len(rows), 1)).ravel())
    else:
        out += [0] * (25 + 2 + 4 + 24)
    return np.array(out, np.float32)


def clip_features(db):
    """db [M, T] float32 di DEVICE -> vektor fitur numpy."""
    M, T = db.shape
    E, D = denoise(db)
    Es = F.avg_pool2d(E[None, None], 3, stride=1, padding=1)[0, 0]
    E64 = 0.5 * (E[0::2] + E[1::2]); D64 = 0.5 * (D[0::2] + D[1::2])
    emax = Es.amax(0)
    act = emax > ACT_DB
    if int(act.sum()) < 5:
        k = min(5, T)
        act = emax >= torch.topk(emax, k).values[-1]
    f = []
    Ea64, Da64 = E64[:, act], D64[:, act]
    f += [E64.mean(1), Ea64.mean(1), Ea64.std(1, unbiased=False), E64.amax(1), torch.quantile(E64, 0.9, dim=1)]
    f += [Da64.mean(1), Da64.std(1, unbiased=False), torch.quantile(D64, 0.9, dim=1)]
    # bentuk spektrum per frame aktif
    Ea = E[:, act]
    W = torch.pow(10.0, Ea / 10.0) - 1.0
    s = W.sum(0) + 1e-8
    mo = MEL_OCT_T[:, None]
    cen = (W * mo).sum(0) / s
    bw = torch.sqrt((W * (mo - cen) ** 2).sum(0) / s)
    roll = MEL_OCT_T[((W.cumsum(0) / s) < 0.85).sum(0).clamp(max=M - 1)]
    Wd = torch.pow(10.0, D[:, act] / 10.0)
    flat = torch.exp(torch.log(Wd + 1e-6).mean(0)) / (Wd.mean(0) + 1e-6)
    pk = Ea.argmax(0); pkf = MEL_OCT_T[pk]; pkv = Ea.amax(0)
    for v in (cen, bw, roll, flat, pkf, pkv):
        f.append(_stats5(v))
    hist = torch.zeros(32).index_add_(0, (pk * 32) // M, pkv)
    f.append(hist / (hist.sum() + 1e-6))
    # dinamika FM antar frame aktif berurutan
    pk_all = E.argmax(0)
    valid = act[:-1] & act[1:]
    d = (MEL_OCT_T[pk_all[1:]] - MEL_OCT_T[pk_all[:-1]])[valid]
    if d.numel() > 0:
        ad = d.abs()
        f.append(torch.stack([ad.mean(), d.std(unbiased=False), torch.quantile(ad, 0.9), (d > 0.02).float().mean(), (d < -0.02).float().mean()]))
        hd = torch.histc(d.clamp(-0.5, 0.5), bins=9, min=-0.5, max=0.5)
        f.append(hd / (hd.sum() + 1e-6))
    else:
        f.append(torch.zeros(14))
    # temporal: aktivitas, autokorelasi envelope, spektrum modulasi, onset
    env = E.sum(0); env = env - env.mean()
    ac0 = (env * env).sum() + 1e-6
    acs = torch.stack([(env[:-L] * env[L:]).sum() / ac0 if L < T else torch.zeros(()) for L in _LAGS.tolist()])
    spec = torch.fft.rfft(env).abs() ** 2
    fq = np.arange(spec.numel()) * 100.0 / T
    mod = torch.stack([spec[torch.tensor((fq >= _MODB[i]) & (fq < _MODB[i + 1]))].sum() for i in range(16)])
    mod = mod / (mod.sum() + 1e-6)
    onset = (act[1:] & ~act[:-1]).float().sum() / (T / 100.0)
    f += [act.float().mean().view(1), acs, mod, onset.view(1)]
    # MFCC dari E
    Cc = _DCT @ E
    Ca = Cc[:, act]
    f += [Ca.mean(1), Ca.std(1, unbiased=False), (Cc[:, 1:] - Cc[:, :-1]).std(1, unbiased=False)]
    # rasio energi 6 pita & aktivitas per pita
    tot = W.sum() + 1e-6
    f.append(torch.stack([W[b].sum() / tot for b in _B6]))
    f.append(torch.stack([(Es[b].amax(0) > ACT_DB).float().mean() for b in _B6]))
    v = torch.cat([x.reshape(-1) for x in f]).float().cpu().numpy()
    seg = seg_features(E.cpu().numpy(), Es.cpu().numpy())
    return np.concatenate([v, seg])




def load_wave(path):
    """Decode -> mono tengah (L+R)/2 -> potong 20 dtk asli -> 32 kHz -> buang DC -> RMS 0,05 (notebook sel 3)."""
    import soundfile as sf
    try:
        x, sr = sf.read(path, dtype="float32", always_2d=True)
    except Exception:
        import librosa as _l
        x, sr = _l.load(path, sr=None, mono=False)
        x = np.atleast_2d(x).T.astype(np.float32)
    mid = 0.5 * (x[:, 0] + x[:, 1]) if x.shape[1] >= 2 else x[:, 0]
    mid = mid[: int(MAX_SEC * sr)]
    if int(sr) != SR:
        g = math.gcd(int(sr), SR)
        mid = resample_poly(mid, SR // g, int(sr) // g)
    mid = mid.astype(np.float32)
    mid -= mid.mean()
    mid = mid / (np.sqrt((mid ** 2).mean()) + 1e-8) * 0.05
    if len(mid) < SR:
        mid = np.pad(mid, (0, SR - len(mid)))
    return mid


def logmel_db(w):
    """Log-mel dB satu klip [128, T]. Ekor klip di-nol-kan seperti batch notebook (STFT center=True pada larik
    berpadding nol), lalu dibulatkan lewat float16 karena notebook menyimpan LOGMEL sebagai float16."""
    _setup()
    n_frames = 1 + len(w) // HOP
    x = torch.from_numpy(np.pad(w, (0, N_FFT))).unsqueeze(0)
    S = torch.stft(x, N_FFT, HOP, window=WIN, center=True, return_complex=True)
    P = S.real ** 2 + S.imag ** 2
    db = 10.0 * torch.log10(torch.matmul(MEL_FB, P) + 1e-10)
    return db[0, :, :n_frames].to(torch.float16).to(torch.float32)


def hf_from_wave(w):
    _setup()
    with torch.no_grad():
        v = clip_features(logmel_db(w))
    v = np.nan_to_num(v, nan=0.0, posinf=0.0, neginf=0.0).astype(np.float32)
    if v.shape != (N_HF,):
        raise RuntimeError(f"hf berdimensi {v.shape}, seharusnya ({N_HF},)")
    return v

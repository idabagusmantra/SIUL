"""Aturan keputusan open-set (notebook Bagian 5.3), port apa adanya.

Nomor aturan mengikuti antarmuka: 1 zero-shot, 2 classifier Kutilang, 3 veto, 4 Bondol 'group saudara',
5 kemiripan (Kutilang/Cendrawasih), 6 bawaan Unknown.
"""
import numpy as np
from .bundle import Bundle

B_, C_, K_, U_ = 0, 1, 2, 3


def decide(e: dict, cfg: dict, names: list[str]) -> tuple[int, int, str]:
    f = {0: e["fB"] if cfg["use_munia"] else 0.0, 1: e["fC"], 2: e["fK"]}
    b = max(f, key=f.get)
    if f[b] >= cfg["frac_zs"]:
        return b, 1, f"Detektor zero-shot {names[b]} terpicu pada {f[b] * 100:.0f}% klip."
    if cfg["k_clf"] and e["pK"] >= cfg["k_clf_min"] and e["mK"] >= max(e["mB"], e["mC"], cfg["k_sim_min"]):
        return K_, 2, f"Probabilitas classifier Kutilang {e['pK']:.2f} dengan kemiripan tertinggi ke group Kutilang (tipe bulbul)."
    if e["ex"] >= cfg["veto_ex"] and e["ex_logit"] >= cfg["veto_logit"]:
        return U_, 3, f"Veto: spesies lain ({e['ex_species']}) terdeteksi sangat kuat (logit {e['ex_logit']:.1f})."
    if e["mB"] >= cfg["theta_b"] and e["cB"] >= cfg["theta_b_cent"] and e["mB"] > e["mK"] and e["pB"] >= cfg["clf_min"][0]:
        return B_, 4, f"Sangat mirip group Bondol Jawa yang dikenal (klip {e['mB']:.2f}, centroid {e['cB']:.2f})."
    if e["mK"] >= cfg["theta_k"] and e["pK"] >= cfg["clf_min"][2] and (e["fK"] >= cfg["fk_min"] or cfg["k_no_zs"]):
        return K_, 5, f"Kemiripan ke group Kutilang memadai ({e['mK']:.2f})."
    if e["mC"] >= cfg["theta_c"] and e["fC"] >= cfg["fc_min"] and e["pC"] >= cfg["clf_min"][1]:
        return C_, 5, f"Kemiripan ke Cendrawasih ({e['mC']:.2f})."
    return U_, 6, "Tidak ada bukti positif yang cukup, sehingga dikembalikan sebagai Unknown."


def unit_evidence(b: Bundle, ii: np.ndarray, LP, WS, S_clip, ZF, P) -> dict:
    """Bukti satu unit (cluster atau klip tunggal) dari indeks anggota `ii`."""
    f = b.features
    labP = f["perch_labels"]
    med = np.median(LP[ii], 0)
    ex = med - b.ref_max
    ex[f["WHITE"]] = -99
    j = int(np.argmax(ex))
    cen = np.mean([_unit(WS[v][ii].mean(0, keepdims=True)) @ b.centroids[v].T for v in b.config["SIM_VIEWS"]], 0)[0]
    gc = b.group_class
    return dict(
        n=len(ii), fK=float(ZF["K"][ii].mean()), fC=float(ZF["C"][ii].mean()), fB=float(ZF["B"][ii].mean()),
        mB=float(np.median(S_clip[ii, 0])), mC=float(np.median(S_clip[ii, 1])), mK=float(np.median(S_clip[ii, 2])),
        cB=float(cen[gc == 0].max()), cC=float(cen[gc == 1].max()), cK=float(cen[gc == 2].max()),
        pB=float(P[ii, 0].mean()), pC=float(P[ii, 1].mean()), pK=float(P[ii, 2].mean()),
        ex=float(ex[j]), ex_species=str(labP[j]), ex_logit=float(med[j]),
    )


def _unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=1, keepdims=True), 1e-12)


def strong_flip(lab: np.ndarray, SF: dict, cfg: dict) -> np.ndarray:
    """Detektor zero-shot kuat boleh membalik Unknown (dan Kutilang kuat menimpa), seperti run_rules di notebook."""
    lab = lab.copy()
    strong = np.stack([SF["B"] & cfg["use_munia"], SF["C"] & cfg["c_clip_flip"], SF["K"]], 1)
    one = strong.sum(1) == 1
    flip = one & (lab == U_)
    lab[flip] = strong[flip].argmax(1)
    kflip = SF["K"] & one & (lab != K_)
    lab[kflip] = K_
    return lab

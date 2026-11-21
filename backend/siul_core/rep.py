from dataclasses import dataclass
import numpy as np


@dataclass
class ClipRep:
    """Representasi satu klip (keluaran notebook ekstraksi), sudah di-pool per klip.

    pe          (1536,)  rata-rata embedding Perch v2 antarjendela
    bn          (1024,)  rata-rata embedding BirdNET v2.4 antarjendela
    hf          (750,)   fitur akustik handcrafted
    perch_logit (13938,) logit Perch per klip, SUDAH dikali logit_scale, hanya kolom `perch_logit_cols`
    bn_logit    (4182,)  logit BirdNET per klip, SUDAH dikali logit_scale, hanya kolom `birdnet_logit_cols`
    """
    file: str
    pe: np.ndarray
    bn: np.ndarray
    hf: np.ndarray
    perch_logit: np.ndarray
    bn_logit: np.ndarray

"""Graf SNN + Leiden (notebook Bagian 5.2). Louvain (networkx) dipakai bila igraph/leidenalg tidak terpasang."""
import numpy as np
from sklearn.preprocessing import normalize
from .bundle import Bundle

MIN_CLIPS = 4


def snn_graph(Z: np.ndarray, k: int) -> dict:
    Sg = Z @ Z.T
    np.fill_diagonal(Sg, -np.inf)
    nb = np.argpartition(-Sg, k, axis=1)[:, :k]
    sets = [set(r) for r in nb]
    E = {}
    for i in range(len(nb)):
        for j in nb[i]:
            a, c = (i, j) if i < j else (j, i)
            if (a, c) not in E:
                E[(a, c)] = len(sets[i] & sets[j]) + 1
    return E


def cluster_graph(Z: np.ndarray, k: int, res: float, seed: int) -> np.ndarray:
    n = len(Z)
    if n < MIN_CLIPS:
        return np.zeros(n, int)
    E = snn_graph(Z, min(k, n - 1))
    try:
        import igraph as ig, leidenalg as la
        g = ig.Graph(n=n, edges=list(E.keys()))
        g.es["weight"] = list(E.values())
        part = la.find_partition(g, la.RBConfigurationVertexPartition, weights="weight", resolution_parameter=res, seed=seed)
        return np.array(part.membership)
    except ImportError:
        import networkx as nx
        G = nx.Graph(); G.add_nodes_from(range(n))
        G.add_weighted_edges_from([(a, c, w) for (a, c), w in E.items()])
        comms = nx.community.louvain_communities(G, weight="weight", resolution=res, seed=seed)
        lab = np.zeros(n, int)
        for ci, cset in enumerate(sorted(comms, key=len, reverse=True)):
            lab[list(cset)] = ci
        return lab


def cluster_runs(b: Bundle, WS: dict[str, np.ndarray]) -> list[np.ndarray]:
    seed = b.config["SEED"]
    return [cluster_graph(normalize(np.hstack([WS[v] for v in views])), k, res, seed) for views, k, res in b.config["CLUSTERINGS"]]


def ref_index(b: Bundle) -> int:
    return list(b.config["CLUSTERINGS"]).index(b.config["REF_CLUSTERING"])

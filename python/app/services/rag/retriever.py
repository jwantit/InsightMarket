# app/rag/retriever.py
# ============================================================
# [기능] Retriever (의미 검색)
# - query vector → Qdrant REST search → hits 반환
# - 검색 결과 dedupe(중복 제거) 포함
# ============================================================

import time
from typing import Any, Dict, List, Tuple

import requests


def _now():
    return time.strftime("%H:%M:%S")


def _log(msg: str, trace: str = "-"):
    print(f"[{_now()}][retriever][{trace}] {msg}")


def _dedupe_hits(hits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    uniq: Dict[Tuple[str, str], Dict[str, Any]] = {}

    for h in hits:
        p = h.get("payload", {}) or {}
        url = (p.get("url") or "").strip()
        title = (p.get("title") or "").strip()
        chunk = (p.get("chunkText") or "").strip()

        key = (url if url else title, chunk)

        prev = uniq.get(key)
        if prev is None or float(h.get("score", 0) or 0) > float(prev.get("score", 0) or 0):
            uniq[key] = h

    return list(uniq.values())


def retrieve(
    *,
    qdrant_url: str,
    collection: str,
    vector: List[float],
    brand_id: int,
    top_k: int = 5,
    trace: str = "-",
) -> List[Dict[str, Any]]:
    t0 = time.perf_counter()

    body = {
        "vector": vector,
        "limit": top_k,
        "filter": {"must": [{"key": "brandId", "match": {"value": brand_id}}]},
        "with_payload": True,
    }

    url = f"{qdrant_url}/collections/{collection}/points/search"

    r = requests.post(url, json=body, timeout=60)
    r.raise_for_status()

    hits = r.json().get("result", []) or []
    raw = len(hits)
    hits = _dedupe_hits(hits)

    _log(f"qdrant_search ok elapsed_sec={(time.perf_counter() - t0):.3f} hits_deduped={len(hits)} raw={raw}", trace)
    return hits

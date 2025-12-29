# ============================================================
# [기능] 질문(query) 임베딩 → Qdrant REST /points/search → topK 출력
# [로그] 단계별 start/end + elapsed_sec
# ============================================================

import time
from contextlib import contextmanager

import requests
from sentence_transformers import SentenceTransformer

QDRANT_URL = "http://localhost:6333"
COLLECTION = "im_chunks"
EMBED_MODEL_NAME = "nlpai-lab/KoE5"


def log(msg: str) -> None:
    now = time.strftime("%H:%M:%S")
    print(f"[{now}][search] {msg}")


@contextmanager
def timer(name: str, log_fn):
    t0 = time.perf_counter()
    log_fn(f"{name} start")
    try:
        yield
        sec = time.perf_counter() - t0
        log_fn(f"{name} end elapsed_sec={sec:.3f}")
    except Exception as e:
        sec = time.perf_counter() - t0
        log_fn(f"{name} failed elapsed_sec={sec:.3f} err={type(e).__name__}: {e}")
        raise

def dedupe_hits(result):
    uniq = {}
    for item in result:
        payload = item.get("payload", {}) or {}
        url = (payload.get("url") or "").strip()
        title = (payload.get("title") or "").strip()
        chunk = (payload.get("chunkText") or "").strip()

        key = (url if url else title, chunk)

        prev = uniq.get(key)
        if prev is None or float(item.get("score", 0) or 0) > float(prev.get("score", 0) or 0):
            uniq[key] = item

    # score 높은 순으로 정렬 (출력 안정화)
    return sorted(uniq.values(), key=lambda x: float(x.get("score", 0) or 0), reverse=True)


def main():
    run_t0 = time.perf_counter()
    log("run start")

    with timer("load_embed_model", log):
        model = SentenceTransformer(EMBED_MODEL_NAME)

    question = "스타벅스 가격이 비싸다는 불만 있어?"
    brand_id = 1
    top_k = 5

    log(f"question = {question}")

    with timer("query_embed", log):
        qvec = model.encode([f"query: {question}"], normalize_embeddings=True)[0].tolist()

    body = {
        "vector": qvec,
        "limit": top_k,
        "filter": {"must": [{"key": "brandId", "match": {"value": brand_id}}]},
        "with_payload": True,
    }

    url = f"{QDRANT_URL}/collections/{COLLECTION}/points/search"
    with timer("qdrant_search", log):
        r = requests.post(url, json=body, timeout=60)
        r.raise_for_status()
        data = r.json()

    result = data.get("result", [])
    raw = len(result)
    result = dedupe_hits(result)
    log(f"hits_deduped={len(result)} (raw={raw})")

    for i, item in enumerate(result, start=1):
        score = item.get("score")
        payload = item.get("payload", {}) or {}
        print(f"\n[{i}] score={score:.4f}")
        print(f"- title: {payload.get('title')}")
        print(f"- chunkText: {payload.get('chunkText')}")
        print(f"- url: {payload.get('url')}")

    total_sec = time.perf_counter() - run_t0
    log(f"run end total_sec={total_sec:.3f}")


if __name__ == "__main__":
    main()

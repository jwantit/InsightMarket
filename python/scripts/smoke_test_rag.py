# scripts/smoke_test_rag.py
# ============================================================
# [기능] RAG 스모크 테스트(E2E) - 실행기(얇게)
# - 임베딩 모델 로드
# - app.rag.pipeline.run_rag 호출
# - 결과 print
# ============================================================

import json
import time
from contextlib import contextmanager

from sentence_transformers import SentenceTransformer

from app.rag.pipeline import run_rag

# ---------- 설정 ----------
QDRANT_URL = "http://localhost:6333"
COLLECTION = "im_chunks"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen3:8b"

EMBED_MODEL_NAME = "nlpai-lab/KoE5"


def log(msg: str) -> None:
    now = time.strftime("%H:%M:%S")
    print(f"[{now}][smoke] {msg}")


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


def main():
    run_t0 = time.perf_counter()
    log("run start")

    question = "스타벅스에 불만이 요즘 뭐가 있어? 있다면 근거 기반으로 문제와 해결책을 알려줘."
    brand_id = 1
    top_k = 5

    with timer("load_embed_model", log):
        embed_model = SentenceTransformer(EMBED_MODEL_NAME)

    with timer("run_rag(pipeline)", log):
        result = run_rag(
            question=question,
            brand_id=brand_id,
            qdrant_url=QDRANT_URL,
            collection=COLLECTION,
            embed_model=embed_model,
            ollama_url=OLLAMA_URL,
            ollama_model=OLLAMA_MODEL,
            top_k=top_k,
            trace="smoke",
            ollama_timeout_sec=300,
            ollama_options=None,  # 품질 우선이면 None 유지
        )

    if result.get("ok") is True:
        print(json.dumps(result["data"], ensure_ascii=False, indent=2))
    else:
        log(f"failed reason={result.get('reason')}")
        print("\n----- RAW LLM OUTPUT -----\n")
        print(result.get("raw", ""))

    total_sec = time.perf_counter() - run_t0
    log(f"run end total_sec={total_sec:.3f}")


if __name__ == "__main__":
    main()

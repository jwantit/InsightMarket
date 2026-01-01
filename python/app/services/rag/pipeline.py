# app/rag/pipeline.py
# ============================================================
# [기능] RAG Pipeline (오케스트레이션)
# - query 임베딩 → retriever → prompt → generator → JSON parse → dict 반환
# [로그] 단계별 elapsed_sec + trace
# ============================================================

import json
import time
from typing import Any, Dict, List, Optional, Tuple

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from app.services.rag.retriever import retrieve
from app.services.rag.prompt import build_prompt
from app.services.rag.generator import generate_with_ollama
from app.services.rag.validators import validate_and_fix_response

# ============================================================
# [테스트용] indexer 임시 연결
# TODO: 테스트 완료 후 삭제 예정
# - brand_{id}.jsonl 원천 파일 직접 Qdrant 인덱싱
# ============================================================
from app.services.rag.indexer import ingest_brand_jsonl_to_qdrant


def _now():
    return time.strftime("%H:%M:%S")


def _log(msg: str, trace: str = "-"):
    print(f"[{_now()}][pipeline][{trace}] {msg}")


def _try_parse_json(text: str) -> Optional[Dict[str, Any]]:
    """
    LLM이 앞뒤에 설명을 붙이거나 중간에 공백이 있어도,
    가장 바깥 JSON만 추출해서 파싱 시도.
    """
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    chunk = text[start : end + 1]
    try:
        return json.loads(chunk)
    except Exception:
        return None


def run_rag(
    question: str,
    brand_id: int,
    *,
    qdrant_url: str,
    collection: str,
    embed_model: SentenceTransformer,
    ollama_url: str,
    ollama_model: str,
    top_k: int = 5,
    trace: str = "-",
    ollama_timeout_sec: int = 300,
    ollama_options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    [입력]
    - question, brand_id
    - 각종 의존성/설정은 명시적으로 받음(테스트/DI 쉬움)

    [출력]
    - 성공: {"ok": True, "data": <json dict>, "sources": [...]}
    - 실패: {"ok": False, "raw": <llm output>, "sources": [...], "reason": "..."}
    """
    t0 = time.perf_counter()
    _log("run start", trace)
    
    # ============================================================
    # [테스트용] 브랜드별 인덱싱 자동 실행
    # TODO: 테스트 완료 후 삭제 예정
    # - brand_{id}.jsonl 원천 파일 직접 Qdrant 인덱싱
    # ============================================================
    try:
        _log(f"[TEST] indexing brand_id={brand_id} from raw JSONL", trace)
        qdrant_client = QdrantClient(url=qdrant_url)
        index_result = ingest_brand_jsonl_to_qdrant(
            brand_id=brand_id,
            embed_model=embed_model,
            qdrant_client=qdrant_client,
        )
        _log(f"[TEST] indexing complete: indexed={index_result.get('indexed', 0)} errors={len(index_result.get('errors', []))}", trace)
        
    except Exception as e:
        # 테스트용이므로 에러가 나도 RAG 파이프라인은 계속 진행
        _log(f"[TEST] indexing error (ignored): {str(e)}", trace)
    # ============================================================

    # 1) query embed
    t_embed0 = time.perf_counter()
    qvec: List[float] = embed_model.encode([f"query: {question}"], normalize_embeddings=True)[0].tolist()
    _log(f"query_embed elapsed_sec={(time.perf_counter() - t_embed0):.3f}", trace)

    # 2) retrieve (qdrant search + dedupe)
    t_ret0 = time.perf_counter()
    hits = retrieve(
        qdrant_url=qdrant_url,
        collection=collection,
        vector=qvec,
        brand_id=brand_id,
        top_k=top_k,
        trace=trace,
    )
    _log(f"retrieve elapsed_sec={(time.perf_counter() - t_ret0):.3f} hits={len(hits)}", trace)

    # 3) prompt build
    t_pr0 = time.perf_counter()
    prompt, sources = build_prompt(question, hits)
    _log(f"build_prompt elapsed_sec={(time.perf_counter() - t_pr0):.3f} sources={len(sources)}", trace)

    # 4) LLM generate
    out = generate_with_ollama(
        ollama_url=ollama_url,
        model=ollama_model,
        prompt=prompt,
        timeout_sec=ollama_timeout_sec,
        options=ollama_options,
        trace=trace,
    )

    # 5) parse
    parsed = _try_parse_json(out)
    if parsed is None:
        _log("json_parse failed", trace)
        _log(f"run end total_sec={(time.perf_counter() - t0):.3f}", trace)
        return {
            "ok": False,
            "reason": "json_parse_failed",
            "raw": out,
            "sources": sources,  # 근거는 우리가 고정
        }

    # sources는 우리가 준 걸로 고정(LLM이 멋대로 바꾸는 것 방지)
    parsed["sources"] = sources
    
    # JSON 스키마 검증 및 보정
    parsed = validate_and_fix_response(parsed)

    _log(f"run end total_sec={(time.perf_counter() - t0):.3f}", trace)
    return {
        "ok": True,
        "data": parsed,
        "sources": sources,
    }

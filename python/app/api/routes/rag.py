# app/api/routes/rag.py
# ============================================================
# [기능] POST /rag/ask
# - 요청 수신 → run_rag 호출 → 결과 반환(JSON UTF-8 고정)
# ============================================================

import time
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer

from app.config.settings import settings
from app.services.rag.pipeline import run_rag
from app.services.rag.validators import validate_and_fix_response
from app.schemas.rag_request import RagAskRequest

router = APIRouter(prefix="/rag", tags=["rag"])

# ---- 모델은 서버 시작 시 1번만 로드(매 요청 로드 금지) ----
_embed_model: SentenceTransformer | None = None


def get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        t0 = time.perf_counter()
        _embed_model = SentenceTransformer(settings.embed_model_name)
        print(f"[api][rag] embed_model loaded elapsed_sec={(time.perf_counter() - t0):.3f}")
    return _embed_model


@router.post("/ask")
def ask(req: RagAskRequest, request: Request):
    # Spring에서 전달한 X-Trace-Id 헤더 읽기
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    
    try:
        print(f"[api][rag] /ask request traceId={trace_id} brandId={req.brandId} topK={req.topK} questionLen={len(req.question) if req.question else 0}")
        
        embed_model = get_embed_model()

        result = run_rag(
            question=req.question,
            brand_id=req.brandId,
            qdrant_url=settings.qdrant_url,
            collection=settings.qdrant_collection,
            embed_model=embed_model,
            ollama_url=settings.ollama_url,
            ollama_model=settings.ollama_model,
            top_k=req.topK,
            trace=trace_id,
            ollama_timeout_sec=settings.ollama_timeout_sec,
            ollama_options=None,
        )

        # JSON 스키마 검증 및 보정
        if result.get("ok") and result.get("data"):
            result["data"] = validate_and_fix_response(result["data"])

        print(f"[api][rag] /ask response traceId={trace_id} ok={result.get('ok', False)}")
        
        # ✅ 응답을 항상 JSONResponse로 감싸서 charset 강제
        return JSONResponse(
            content=result,
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[api][rag] /ask ERROR traceId={trace_id}: {error_msg}")
        print(f"[api][rag] /ask TRACEBACK traceId={trace_id}:\n{error_trace}")
        
        # 에러 발생 시에도 ok=false 형태로 반환
        error_result = {
            "ok": False,
            "reason": f"server_error: {error_msg}",
            "raw": None,
            "sources": [],
        }
        
        return JSONResponse(
            content=error_result,
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=500,
        )

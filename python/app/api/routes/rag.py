# app/api/routes/rag.py
# ============================================================
# [기능] POST /rag/ask
# - 요청 수신 → run_rag 호출 → 결과 반환(JSON UTF-8 고정)
# ============================================================

import time
import traceback
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer

from app.rag.pipeline import run_rag
from app.schemas.rag_request import RagAskRequest

router = APIRouter(prefix="/rag", tags=["rag"])

# ---- 설정(일단 하드코딩, 나중에 config로 이동) ----
QDRANT_URL = "http://localhost:6333"
COLLECTION = "im_chunks"
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen3:1.7b"
EMBED_MODEL_NAME = "nlpai-lab/KoE5"

# ---- 모델은 서버 시작 시 1번만 로드(매 요청 로드 금지) ----
_embed_model: SentenceTransformer | None = None


def get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        t0 = time.perf_counter()
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
        print(f"[api][rag] embed_model loaded elapsed_sec={(time.perf_counter() - t0):.3f}")
    return _embed_model


@router.post("/ask")
def ask(req: RagAskRequest):
    try:
        print(f"[api][rag] /ask request brandId={req.brandId} topK={req.topK} questionLen={len(req.question) if req.question else 0}")
        
        embed_model = get_embed_model()

        result = run_rag(
            question=req.question,
            brand_id=req.brandId,
            qdrant_url=QDRANT_URL,
            collection=COLLECTION,
            embed_model=embed_model,
            ollama_url=OLLAMA_URL,
            ollama_model=OLLAMA_MODEL,
            top_k=req.topK,
            trace="api",
            ollama_timeout_sec=600,
            ollama_options=None,
        )

        print(f"[api][rag] /ask response ok={result.get('ok', False)}")
        
        # ✅ 응답을 항상 JSONResponse로 감싸서 charset 강제
        return JSONResponse(
            content=result,
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[api][rag] /ask ERROR: {error_msg}")
        print(f"[api][rag] /ask TRACEBACK:\n{error_trace}")
        
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

# app/api/routes/rag.py
# ============================================================
# [기능] POST /rag/ask
# - 요청 수신 → run_rag 호출 → 결과 반환(JSON UTF-8 고정)
# ============================================================

import time
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
OLLAMA_MODEL = "qwen3:8b"
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

    # ✅ 응답을 항상 JSONResponse로 감싸서 charset 강제
    return JSONResponse(
        content=result,
        media_type="application/json",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )

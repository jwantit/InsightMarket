# app/api/routes/warmup.py
# ============================================================
# [기능] GET /internal/warmup
# - embed_model preload
# - Ollama 1회 짧게 호출해서 cold-start 제거
# - traceId는 main middleware에서 자동 생성/전파됨
# ============================================================

import time
import logging
import requests
from fastapi import APIRouter

# ✅ rag.py에 있는 싱글톤 embed_model 로더를 재사용 (중복 로딩 방지)
from app.api.routes.rag import get_embed_model, OLLAMA_URL, OLLAMA_MODEL

router = APIRouter(prefix="/internal", tags=["internal"])

log = logging.getLogger(__name__)


@router.get("/warmup")
def warmup():
    t0 = time.perf_counter()
    detail = {}

    # 1) embed_model 예열
    t1 = time.perf_counter()
    _ = get_embed_model()
    detail["embed_model_sec"] = round(time.perf_counter() - t1, 3)

    # 2) Ollama 예열 (짧게 1회)
    # - stream: False 로 응답 단일 JSON
    # - 옵션은 최소 출력만(모델/환경 따라 무시될 수 있음)
    t2 = time.perf_counter()
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": "ping",
        "stream": False,
        "options": {
            "num_predict": 16
        }
    }

    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=30)
        detail["ollama_status"] = r.status_code
        detail["ollama_sec"] = round(time.perf_counter() - t2, 3)

        # 응답을 전부 로그로 찍으면 지저분하니 길이만
        txt = r.text or ""
        detail["ollama_resp_len"] = len(txt)

    except Exception as e:
        # warmup 실패해도 서버가 죽으면 안 되니 상태만 반환
        detail["ollama_error"] = str(e)
        detail["ollama_sec"] = round(time.perf_counter() - t2, 3)

    elapsed = round(time.perf_counter() - t0, 3)
    log.info("[api][warmup] done elapsed_sec=%s detail=%s", elapsed, detail)

    return {
        "ok": True,
        "elapsedSec": elapsed,
        "detail": detail
    }

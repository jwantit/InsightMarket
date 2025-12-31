# app/main.py
# ✅ FastAPI 엔트리: 라우터 등록 + 로깅 + TraceId 미들웨어 + (자동) Warmup

import logging
import uuid
import time
import requests

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.rag import router as rag_router
from app.api.routes.warmup import router as warmup_router

# ✅ rag 라우트의 싱글톤 embed_model 로더 재사용
from app.api.routes.rag import get_embed_model
from app.config.settings import settings

class TraceIdFilter(logging.Filter):
    """로그 포맷에 traceId가 항상 들어가도록 보정"""
    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "traceId"):
            record.traceId = "-"
        return True


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | traceId=%(traceId)s | %(message)s",
    )

    # ✅ root logger(전역)에 필터를 걸어서 모든 라이브러리 로그에도 traceId 기본값 주입
    root = logging.getLogger()
    for h in root.handlers:
        h.addFilter(TraceIdFilter())


setup_logging()
log = logging.getLogger(__name__)

app = FastAPI(title="InsightMarket AI (RAG)", version="0.1.0")

# ✅ 온디바이스 MVP용 CORS (나중에 Spring만 호출하도록 고정하면 더 좁혀도 됨)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP: 전부 허용 / 연결 안정화 후 Spring Origin만 허용 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# [기능] 서버 시작 시 자동 warmup
# - embed_model preload
# - Ollama 짧게 1회 호출해서 cold-start 제거
# ============================================================
@app.on_event("startup")
def startup_warmup():
    t0 = time.perf_counter()
    log.info("[startup][warmup] start")

    detail = {}

    # 1) embed_model preload
    t1 = time.perf_counter()
    _ = get_embed_model()
    detail["embed_model_sec"] = round(time.perf_counter() - t1, 3)

    # 2) Ollama warm-up (짧게 1회)
    t2 = time.perf_counter()
    payload = {
        "model": settings.ollama_model,
        "prompt": "ping",
        "stream": False,
        "options": {
            "num_predict": 8
        }
    }

    try:
        r = requests.post(settings.ollama_url, json=payload, timeout=120)
        detail["ollama_status"] = r.status_code
        detail["ollama_sec"] = round(time.perf_counter() - t2, 3)
        detail["ollama_resp_len"] = len(r.text or "")
    except Exception as e:
        detail["ollama_error"] = str(e)
        detail["ollama_sec"] = round(time.perf_counter() - t2, 3)

    elapsed = round(time.perf_counter() - t0, 3)
    log.info("[startup][warmup] end elapsed_sec=%s detail=%s", elapsed, detail)


# ============================================================
# [기능] TraceId 미들웨어
# - 요청 헤더 X-Trace-Id 우선
# - 없으면 생성
# - 응답 헤더에도 동일 traceId 내려줌
# ============================================================
@app.middleware("http")
async def trace_id_middleware(request: Request, call_next):
    trace_id = request.headers.get("X-Trace-Id")
    if not trace_id:
        trace_id = f"t-{uuid.uuid4().hex[:12]}"

    request.state.trace_id = trace_id

    response = await call_next(request)
    response.headers["X-Trace-Id"] = trace_id
    return response


# ============================================================
# [기능] 라우터 등록
# ============================================================
app.include_router(health_router, tags=["health"])
app.include_router(rag_router, tags=["rag"])
app.include_router(warmup_router, tags=["internal"])


# app/main.py
# ✅ FastAPI 엔트리: 라우터 등록 + 로깅 + TraceId 미들웨어

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.strategy import router as strategy_router
from app.api.routes.collect import api_router as collect_router
from app.api.routes.analyze import router as analyze_router


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
app.include_router(strategy_router, tags=["strategy"])
app.include_router(collect_router, tags=["collect"])
app.include_router(analyze_router, tags=["analyze"])


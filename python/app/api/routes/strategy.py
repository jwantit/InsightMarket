# app/api/routes/strategy.py
# ============================================================
# [기능] 전략 분석 및 리포트 생성 엔드포인트
# ============================================================

import time
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer

from app.config.settings import settings
from app.services.rag.validators import validate_and_fix_response
from app.schemas.strategy_request import StrategyAskRequest, SolutionReportRequest
from app.services.pipeline.strategy_pipeline import run_strategy_analysis
from app.services.strategy.template_indexer import index_templates
from app.services.strategy.solution_report_generator import generate_solution_report
from qdrant_client import QdrantClient
from pathlib import Path

router = APIRouter(prefix="/api/strategy", tags=["strategy"])

# ---- 모델은 서버 시작 시 1번만 로드(매 요청 로드 금지) ----
_embed_model: SentenceTransformer | None = None


def get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        t0 = time.perf_counter()
        _embed_model = SentenceTransformer(settings.embed_model_name)
        print(f"[api][strategy] embed_model loaded elapsed_sec={(time.perf_counter() - t0):.3f}")
    return _embed_model


@router.post("/ask-strategy")
def ask_strategy(req: StrategyAskRequest, request: Request):
    """
    전략 분석 엔드포인트 (Query Engineering 방식)
    - 프로젝트 키워드 통계 추출
    - 부정 키워드 + 카테고리 + 질문으로 자연어 쿼리 생성
    - Qdrant에서 템플릿 매칭
    """
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    
    try:
        print(f"[api][strategy] /ask-strategy request traceId={trace_id} brandId={req.brandId} projectId={req.projectId} topK={req.topK} questionLen={len(req.question) if req.question else 0}")
        
        if not req.question or not req.question.strip():
            return JSONResponse(
                content={"ok": False, "reason": "질문은 필수입니다."},
                media_type="application/json",
                headers={"Content-Type": "application/json; charset=utf-8"},
                status_code=400,
            )
        
        embed_model = get_embed_model()
        
        # Qdrant 클라이언트 초기화
        try:
            qdrant_client = QdrantClient(url=settings.qdrant_url)
        except Exception as e:
            print(f"[api][strategy] QdrantClient 초기화 실패, REST API 사용: {e}")
            qdrant_client = None
        
        result = run_strategy_analysis(
            project_id=req.projectId,
            brand_id=req.brandId,
            brand_name=req.brandName,
            question=req.question,
            project_keyword_ids=req.projectKeywordIds,
            qdrant_client=qdrant_client,
            qdrant_url=settings.qdrant_url,
            collection_name="strategy_templates",
            embed_model=embed_model,
            top_k=req.topK,
            trace=trace_id
        )
        
        print(f"[api][strategy] /ask-strategy response traceId={trace_id} ok={result.get('ok', False)}")
        
        return JSONResponse(
            content=result,
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[api][strategy] /ask-strategy ERROR traceId={trace_id}: {error_msg}")
        print(f"[api][strategy] /ask-strategy TRACEBACK traceId={trace_id}:\n{error_trace}")
        
        error_result = {
            "ok": False,
            "reason": f"server_error: {error_msg}",
            "data": None,
            "sources": []
        }
        
        return JSONResponse(
            content=error_result,
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=500,
        )


@router.post("/index-templates")
def index_strategy_templates(request: Request):
    """
    전략 템플릿을 Qdrant에 인덱싱하는 엔드포인트
    - strategy_templates.json 파일을 로드
    - 벡터로 변환하여 Qdrant에 저장
    """
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    
    try:
        print(f"[api][strategy] /index-templates request traceId={trace_id}")
        
        embed_model = get_embed_model()
        
        # Qdrant 클라이언트 초기화
        try:
            qdrant_client = QdrantClient(url=settings.qdrant_url)
        except Exception as e:
            return JSONResponse(
                content={"ok": False, "reason": f"Qdrant 연결 실패: {str(e)}"},
                media_type="application/json",
                headers={"Content-Type": "application/json; charset=utf-8"},
                status_code=500,
            )
        
        # 템플릿 인덱싱
        count = index_templates(
            qdrant_client=qdrant_client,
            embed_model=embed_model,
            collection_name="strategy_templates"
        )
        
        print(f"[api][strategy] /index-templates response traceId={trace_id} count={count}")
        
        return JSONResponse(
            content={
                "ok": True,
                "message": f"{count}개 템플릿 인덱싱 완료",
                "count": count
            },
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[api][strategy] /index-templates ERROR traceId={trace_id}: {error_msg}")
        print(f"[api][strategy] /index-templates TRACEBACK traceId={trace_id}:\n{error_trace}")
        
        return JSONResponse(
            content={"ok": False, "reason": f"인덱싱 실패: {error_msg}"},
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=500,
        )


@router.post("/generate-solution-report")
def generate_solution_report_endpoint(req: SolutionReportRequest, request: Request):
    """
    솔루션별 리포트 생성 엔드포인트
    - 특정 솔루션에 대한 상세 리포트를 LLM으로 생성
    - 리포트 타입: "marketing" (광고 전략) or "improvement" (개선사항)
    """
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    
    try:
        print(f"[api][strategy] /generate-solution-report request traceId={trace_id} brandId={req.brandId} projectId={req.projectId} solutionTitle={req.solutionTitle} reportType={req.reportType}")
        
        # 리포트 생성
        report = generate_solution_report(
            brand_name=req.brandName,
            project_name=req.projectName or f"프로젝트 {req.projectId}",
            question=req.question,
            solution_title=req.solutionTitle,
            solution_description=req.solutionDescription,
            related_problems=req.relatedProblems,
            related_insights=req.relatedInsights,
            keyword_stats_summary=req.keywordStatsSummary,
            report_type=req.reportType,
            openai_api_key=settings.openai_api_key,
            openai_model=settings.openai_model,
            timeout_sec=settings.openai_timeout_sec,
            trace=trace_id
        )
        
        print(f"[api][strategy] /generate-solution-report response traceId={trace_id} ok=True")
        
        return JSONResponse(
            content={
                "ok": True,
                "report": report
            },
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"[api][strategy] /generate-solution-report ERROR traceId={trace_id}: {error_msg}")
        print(f"[api][strategy] /generate-solution-report TRACEBACK traceId={trace_id}:\n{error_trace}")
        
        return JSONResponse(
            content={
                "ok": False,
                "reason": f"리포트 생성 실패: {error_msg}",
                "report": None
            },
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=500,
        )


# app/api/routes/image.py
# ============================================================
# [기능] 이미지 콘텐츠 분석 엔드포인트
# ============================================================

import traceback
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.schemas.image_request import ImageAnalysisRequest, ImageAnalysisResponse
from app.services.image.image_analyzer import analyze_image_content

router = APIRouter(prefix="/api/image", tags=["image"])


@router.post("/analyze", response_model=ImageAnalysisResponse)
def analyze_image(req: ImageAnalysisRequest, request: Request):
    """
    이미지 콘텐츠 분석 엔드포인트
    - SNS 게시물 이미지에서 텍스트 추출
    - 경쟁사 광고 이미지 분석
    - 인포그래픽 데이터 추출
    - 마케팅 톤앤매너 분석
    """
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    
    try:
        # Base64 이미지 검증
        if not req.base64Image or not req.base64Image.strip():
            return JSONResponse(
                content={
                    "ok": False,
                    "reason": "이미지 데이터가 필요합니다.",
                    "error": "empty_image"
                },
                media_type="application/json",
                headers={"Content-Type": "application/json; charset=utf-8"},
                status_code=400,
            )
        
        # Provider 확인 (기본값: openai)
        provider = req.provider if req.provider else "openai"
        if provider not in ["ollama", "openai"]:
            return JSONResponse(
                content={
                    "ok": False,
                    "reason": f"지원하지 않는 provider입니다: {provider}. 'ollama' 또는 'openai'를 사용하세요.",
                    "error": "invalid_provider"
                },
                media_type="application/json",
                headers={"Content-Type": "application/json; charset=utf-8"},
                status_code=400,
            )
        
        # 이미지 분석 실행
        result = analyze_image_content(
            base64_image=req.base64Image,
            provider=provider,
            trace_id=trace_id,
        )
        
        # 응답 반환
        response = ImageAnalysisResponse(
            extractedText=result.get("extractedText", ""),
            metrics=result.get("metrics", {}),
            pros=result.get("pros", []),
            cons=result.get("cons", []),
            recommendations=result.get("recommendations", ""),
        )
        
        return JSONResponse(
            content=response.dict(),
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
        )
        
    except ValueError as e:
        # 검증 오류 (이미지 형식 오류 등)
        error_msg = str(e)
        
        return JSONResponse(
            content={
                "ok": False,
                "reason": error_msg,
                "error": "validation_error"
            },
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=400,
        )
        
    except Exception as e:
        # 서버 오류
        error_msg = str(e)
        error_trace = traceback.format_exc()
        # 에러는 로깅만 하고 클라이언트에는 간단한 메시지만 전달
        import logging
        logging.error(f"[api][image] /analyze ERROR traceId={trace_id}: {error_msg}\n{error_trace}")
        
        return JSONResponse(
            content={
                "ok": False,
                "reason": f"서버 오류가 발생했습니다: {error_msg}",
                "error": "server_error"
            },
            media_type="application/json",
            headers={"Content-Type": "application/json; charset=utf-8"},
            status_code=500,
        )


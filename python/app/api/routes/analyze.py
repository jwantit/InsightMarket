"""
분석 API 엔드포인트
Raw 데이터를 분석하여 Spring으로 JSON 반환
"""
from fastapi import APIRouter, Request, HTTPException
import os

from app.services.pipeline.analysis_pipeline import run_analysis_pipeline
from app.schemas.analyze_request import AnalyzeRequest
from app.schemas.analyze_response import AnalyzeResponse, AnalyzeErrorResponse

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: Request, body: AnalyzeRequest):
    """
    Raw 데이터 분석 엔드포인트
    
    Args:
        request: FastAPI Request 객체
        body: AnalyzeRequest DTO
    
    Returns:
        AnalyzeResponse: 분석 결과 JSON
    """
    try:
        trace_id = getattr(request.state, 'trace_id', 'unknown')
        print(f"[analyze] POST /api/analyze traceId={trace_id} file_path={body.file_path} brand_id={body.brand_id}")
        
        # 파일 경로 처리
        file_path = body.file_path
        if not file_path:
            raise HTTPException(status_code=400, detail="파일 경로가 필요합니다.")
        
        if not os.path.isabs(file_path):
            # 상대 경로인 경우 프로젝트 루트 기준
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            file_path = os.path.join(project_root, file_path)
        
        # 분석 파이프라인 실행
        result = run_analysis_pipeline(file_path, body.brand_id)
        
        if result.get("status") == "error":
            error_response = AnalyzeErrorResponse(
                status="error",
                message=result.get("message", "분석 중 오류가 발생했습니다.")
            )
            raise HTTPException(status_code=500, detail=error_response.message)
        
        # 응답 스키마로 변환
        response = AnalyzeResponse(**result)
        
        print(f"[analyze] POST /api/analyze response traceId={trace_id} status={response.status}")
        return response
    
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"파일을 찾을 수 없습니다: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = f"분석 중 오류 발생: {str(e)}"
        print(f"[analyze] 오류: {error_msg}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


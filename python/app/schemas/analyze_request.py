# app/schemas/analyze_request.py
# ============================================================
# [기능] /api/analyze 요청 스키마
# ============================================================

from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    """분석 요청 DTO"""
    file_path: Optional[str] = Field(
        default=None,
        description="분석할 raw 데이터 파일 경로 (None이면 최신 파일 자동 선택)"
    )
    brand_id: Optional[int] = Field(
        default=None,
        ge=1,
        description="특정 브랜드만 분석 (None이면 전체)"
    )


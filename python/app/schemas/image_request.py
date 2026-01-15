# app/schemas/image_request.py
# ============================================================
# [기능] 이미지 분석 요청/응답 스키마
# ============================================================

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ImageAnalysisRequest(BaseModel):
    """이미지 분석 요청 스키마"""
    base64Image: str = Field(..., description="Base64 인코딩된 이미지 문자열")
    brandId: Optional[int] = Field(None, description="브랜드 ID (선택사항)")
    provider: Optional[str] = Field("ollama", description="LLM 제공자: 'ollama' 또는 'openai' (기본값: ollama)")


class ImageAnalysisResponse(BaseModel):
    """이미지 분석 응답 스키마"""
    extractedText: str = Field(..., description="추출된 텍스트 (OCR 결과)")
    metrics: Dict[str, int] = Field(..., description="마케팅 지표 (자극성, 가독성, 감성, 전문성, 신뢰도)")
    pros: List[str] = Field(default_factory=list, description="장점 리스트")
    cons: List[str] = Field(default_factory=list, description="단점 리스트")
    recommendations: str = Field(..., description="AI 추천사항")


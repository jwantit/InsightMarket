# app/schemas/strategy_request.py
# ============================================================
# [기능] 전략 분석 요청/응답 스키마
# ============================================================

from typing import List, Optional
from pydantic import BaseModel, Field


class StrategyAskRequest(BaseModel):
    """전략 분석 요청 스키마 (Query Engineering 방식)"""
    question: str = Field(..., description="사용자 질문 (필수)")
    brandId: int = Field(..., description="브랜드 ID")
    brandName: str = Field(..., description="브랜드명")
    projectId: int = Field(..., description="프로젝트 ID (필수)")
    projectKeywordIds: List[int] = Field(default_factory=list, description="프로젝트 키워드 ID 리스트")
    topK: int = Field(3, ge=1, le=10, description="선택할 템플릿 개수 (기본값: 3)")


class MatchedTemplate(BaseModel):
    """매칭된 템플릿 스키마"""
    template: dict = Field(..., description="템플릿 정보")
    category: str = Field(..., description="카테고리 (solutions, causes, insights)")
    similarity: float = Field(..., ge=0.0, le=1.0, description="유사도 점수")


class FilteredRawData(BaseModel):
    """필터링된 raw_data 스키마"""
    brandId: int = Field(..., description="브랜드 ID")
    brandName: str = Field(..., description="브랜드명")
    brandData: List[dict] = Field(default_factory=list, description="브랜드 데이터")
    projectKeywords: List[dict] = Field(default_factory=list, description="프로젝트 키워드 데이터")


class StrategyData(BaseModel):
    """전략 분석 데이터 스키마"""
    filteredRawData: FilteredRawData = Field(..., description="필터링된 raw_data")
    matchedTemplates: List[MatchedTemplate] = Field(default_factory=list, description="매칭된 템플릿 목록")


class StrategyAskResponse(BaseModel):
    """전략 분석 응답 스키마"""
    ok: bool = Field(..., description="성공 여부")
    data: Optional[StrategyData] = Field(None, description="분석 결과 데이터")
    reason: Optional[str] = Field(None, description="실패 시 사유")


class SolutionReportRequest(BaseModel):
    """솔루션별 리포트 생성 요청 스키마"""
    brandId: int = Field(..., description="브랜드 ID")
    brandName: str = Field(..., description="브랜드명")
    projectId: int = Field(..., description="프로젝트 ID")
    projectName: str = Field(default="", description="프로젝트명")
    question: str = Field(..., description="사용자 질문")
    solutionTitle: str = Field(..., description="솔루션 제목")
    solutionDescription: str = Field(default="", description="솔루션 설명")
    relatedProblems: List[str] = Field(default_factory=list, description="관련 문제점 리스트")
    relatedInsights: List[str] = Field(default_factory=list, description="관련 인사이트 리스트")
    keywordStatsSummary: str = Field(default="", description="키워드 통계 요약")
    reportType: str = Field(default="marketing", description="리포트 타입 (marketing or improvement)")


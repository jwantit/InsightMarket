# app/schemas/analyze_response.py
# ============================================================
# [기능] /api/analyze 응답 스키마
# ============================================================

from typing import List, Optional
from pydantic import BaseModel, Field


# 개별 통계 항목 스키마
class DailyStatsItem(BaseModel):
    """일일 언급량 통계 항목"""
    brandId: int
    projectId: Optional[int] = None
    keywordId: Optional[int] = None
    competitorId: Optional[int] = None
    analysisTargetType: str  # "BRAND", "KEYWORD", "COMPETITOR"
    statDate: str  # YYYY-MM-DD 형식
    source: str
    mentionCount: int


class SentimentStatsItem(BaseModel):
    """일일 감정 비율 통계 항목"""
    brandId: int
    projectId: Optional[int] = None
    keywordId: Optional[int] = None
    competitorId: Optional[int] = None
    analysisTargetType: str
    statDate: str
    source: str
    positiveRatio: float
    negativeRatio: float
    neutralRatio: float


class TokenStatsItem(BaseModel):
    """토큰별 감정 통계 항목"""
    brandId: int
    projectId: Optional[int] = None
    keywordId: Optional[int] = None
    competitorId: Optional[int] = None
    analysisTargetType: str
    statDate: str
    source: str
    token: str
    sentiment: str  # "POS", "NEG", "NEU"
    tokenCount: int


class BaselineStatsItem(BaseModel):
    """기준선 통계 항목"""
    brandId: int
    projectId: Optional[int] = None
    keywordId: Optional[int] = None
    competitorId: Optional[int] = None
    analysisTargetType: str
    source: str
    avgMentionCount: int
    stddevMentionCount: int


class InsightItem(BaseModel):
    """인사이트 결과 항목"""
    brandId: int
    projectId: Optional[int] = None
    keywordId: Optional[int] = None
    competitorId: Optional[int] = None
    analysisTargetType: str
    statDate: str
    source: str
    insightText: str
    confidenceScore: float


# 성공 응답 스키마
class AnalyzeResponse(BaseModel):
    """분석 성공 응답"""
    status: str = Field(default="success", description="응답 상태")
    daily_stats: List[DailyStatsItem] = Field(default_factory=list, description="일일 언급량 통계")
    sentiment_stats: List[SentimentStatsItem] = Field(default_factory=list, description="일일 감정 비율 통계")
    token_stats: List[TokenStatsItem] = Field(default_factory=list, description="토큰별 감정 통계")
    baseline_stats: List[BaselineStatsItem] = Field(default_factory=list, description="기준선 통계")
    insights: List[InsightItem] = Field(default_factory=list, description="인사이트 결과")


# 실패 응답 스키마
class AnalyzeErrorResponse(BaseModel):
    """분석 실패 응답"""
    status: str = Field(default="error", description="응답 상태")
    message: str = Field(..., description="오류 메시지")


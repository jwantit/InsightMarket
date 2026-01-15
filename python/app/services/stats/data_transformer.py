"""
데이터 변환 유틸리티
각 단계 간 데이터 형식 변환 및 Spring 엔티티 형식으로 변환
"""
from datetime import date
from typing import List, Dict, Tuple


def map_sentiment_to_spring(sentiment: str) -> str:
    """
    Python 감정 라벨을 Spring Sentiment enum으로 변환
    """
    mapping = {
        "positive": "POS",
        "negative": "NEG",
        "neutral": "NEU"
    }
    return mapping.get(sentiment.lower(), "NEU")


def map_type_to_analysis_target_type(
    project_id: int | None,
    keyword_id: int | None,
    competitor_id: int | None
) -> str:
    """
    타입 정보를 기반으로 AnalysisTargetType 결정
    
    우선순위:
    1. competitor_id가 있으면 COMPETITOR
    2. keyword_id가 있으면 KEYWORD (project_id는 Spring에서 ProjectKeyword로 조회 가능)
    3. 그 외는 BRAND
    """
    if competitor_id is not None:
        return "COMPETITOR"
    elif keyword_id is not None:  # project_id가 None이어도 keyword_id만 있으면 KEYWORD
        return "KEYWORD"
    else:
        return "BRAND"


def transform_to_spring_daily_stats(
    daily_stats: List[Tuple[int, int | None, int | None, int | None, date, str, int]]
) -> List[Dict]:
    """
    일일 통계를 Spring 엔티티 형식으로 변환
    """
    result = []
    for brand_id, project_id, keyword_id, competitor_id, stat_date, source, mention_count in daily_stats:
        result.append({
            "brandId": brand_id,
            "projectId": project_id,
            "keywordId": keyword_id,
            "competitorId": competitor_id,
            "analysisTargetType": map_type_to_analysis_target_type(
                project_id, keyword_id, competitor_id
            ),
            "statDate": stat_date.isoformat() if isinstance(stat_date, date) else str(stat_date),
            "source": source,
            "mentionCount": mention_count
        })
    return result


def transform_to_spring_sentiment_stats(
    sentiment_stats: List[Tuple[int, int | None, int | None, int | None, date, str, float, float, float]]
) -> List[Dict]:
    """
    감정 통계를 Spring 엔티티 형식으로 변환
    """
    result = []
    for brand_id, project_id, keyword_id, competitor_id, stat_date, source, pos, neg, neu in sentiment_stats:
        result.append({
            "brandId": brand_id,
            "projectId": project_id,
            "keywordId": keyword_id,
            "competitorId": competitor_id,
            "analysisTargetType": map_type_to_analysis_target_type(
                project_id, keyword_id, competitor_id
            ),
            "statDate": stat_date.isoformat() if isinstance(stat_date, date) else str(stat_date),
            "source": source,
            "positiveRatio": pos,
            "negativeRatio": neg,
            "neutralRatio": neu
        })
    return result


def transform_to_spring_token_stats(
    token_stats: List[Tuple[int, int | None, int | None, int | None, date, str, str, str, int]]
) -> List[Dict]:
    """
    토큰 통계를 Spring 엔티티 형식으로 변환
    """
    result = []
    for brand_id, project_id, keyword_id, competitor_id, stat_date, source, token, sentiment, count in token_stats:
        result.append({
            "brandId": brand_id,
            "projectId": project_id,
            "keywordId": keyword_id,
            "competitorId": competitor_id,
            "analysisTargetType": map_type_to_analysis_target_type(
                project_id, keyword_id, competitor_id
            ),
            "statDate": stat_date.isoformat() if isinstance(stat_date, date) else str(stat_date),
            "source": source,
            "token": token,
            "sentiment": sentiment,  # 이미 "POS", "NEG", "NEU" 형식
            "tokenCount": count
        })
    return result


def transform_to_spring_baseline_stats(
    baseline_stats: List[Tuple[int, int | None, int | None, int | None, str, int, int]]
) -> List[Dict]:
    """
    기준선 통계를 Spring 엔티티 형식으로 변환
    """
    result = []
    for brand_id, project_id, keyword_id, competitor_id, source, avg_count, stddev_count in baseline_stats:
        result.append({
            "brandId": brand_id,
            "projectId": project_id,
            "keywordId": keyword_id,
            "competitorId": competitor_id,
            "analysisTargetType": map_type_to_analysis_target_type(
                project_id, keyword_id, competitor_id
            ),
            "source": source,
            "avgMentionCount": avg_count,
            "stddevMentionCount": stddev_count
        })
    return result


def transform_to_spring_insights(
    insights: List[Dict]
) -> List[Dict]:
    """
    인사이트를 Spring 엔티티 형식으로 변환
    """
    result = []
    for info in insights:
        competitor_id = info.get("competitor_id")
        
        result.append({
            "brandId": info["brand_id"],
            "projectId": info.get("project_id"),
            "keywordId": info.get("keyword_id"),
            "competitorId": competitor_id,
            "analysisTargetType": map_type_to_analysis_target_type(
                info.get("project_id"),
                info.get("keyword_id"),
                competitor_id
            ),
            "statDate": info["stat_date"].isoformat() if isinstance(info["stat_date"], date) else str(info["stat_date"]),
            "source": info.get("source", "UNKNOWN"),
            "insightText": info.get("insight_text", ""),
            "confidenceScore": info.get("confidence_score", 1.0)
        })
    return result


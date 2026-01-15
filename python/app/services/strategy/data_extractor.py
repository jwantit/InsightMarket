# app/services/strategy/data_extractor.py
# ============================================================
# [기능] raw_data에서 데이터 추출 유틸리티
# - raw_data 아이템을 source 형식으로 변환
# ============================================================

from typing import Dict, List, Any


def item_to_source(item: Dict[str, Any], score: float = 0.0) -> Dict[str, Any]:
    """
    raw_data 아이템을 source 형식으로 변환
    
    [입력]
    - item: raw_data 아이템 딕셔너리
    - score: 유사도 점수 (기본값 0.0)
    
    [출력]
    - source 딕셔너리 (프론트엔드 형식)
    """
    return {
        "title": item.get("title", ""),
        "url": item.get("url", ""),
        "publishedAt": item.get("publishedAt", ""),
        "source": item.get("source", ""),
        "chunkText": item.get("text", ""),
        "score": score
    }


def extract_sources_from_data_list(data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    raw_data 아이템 리스트를 source 리스트로 변환
    
    [입력]
    - data_list: raw_data 아이템 리스트
    
    [출력]
    - source 리스트
    """
    sources = []
    for item in data_list:
        sources.append(item_to_source(item))
    return sources


# app/services/strategy/data_extractor.py
# ============================================================
# [기능] raw_data에서 데이터 추출 유틸리티 (재사용 가능한 함수들)
# - raw_data 아이템에서 텍스트 추출
# - raw_data 아이템을 source 형식으로 변환
# ============================================================

from typing import Dict, List, Any


def extract_text_from_item(item: Dict[str, Any]) -> List[str]:
    """
    raw_data 아이템에서 텍스트 추출
    
    [입력]
    - item: raw_data 아이템 딕셔너리 (title, text 필드 포함)
    
    [출력]
    - 텍스트 리스트 (title, text)
    """
    texts = []
    title = item.get("title", "")
    text = item.get("text", "")
    
    if title:
        texts.append(title)
    if text:
        texts.append(text)
    
    return texts


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


def extract_texts_from_data_list(data_list: List[Dict[str, Any]]) -> List[str]:
    """
    raw_data 아이템 리스트에서 모든 텍스트 추출
    
    [입력]
    - data_list: raw_data 아이템 리스트
    
    [출력]
    - 텍스트 리스트
    """
    texts = []
    for item in data_list:
        texts.extend(extract_text_from_item(item))
    return texts


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


def combine_texts(texts: List[str], max_length: int = 5000) -> str:
    """
    텍스트 리스트를 하나의 문자열로 결합 (최대 길이 제한)
    
    [입력]
    - texts: 텍스트 리스트
    - max_length: 최대 길이 (기본값 5000)
    
    [출력]
    - 결합된 텍스트 문자열
    """
    combined = " ".join(texts)
    return combined[:max_length] if len(combined) > max_length else combined


# app/services/strategy/strategy_pipeline.py
# ============================================================
# [기능] 전략 분석 파이프라인
# - raw_data 필터링 → 템플릿 매칭 → 요약본 생성 오케스트레이션
# - 필터링된 raw_data와 매칭된 템플릿을 프론트엔드 형식으로 변환
# ============================================================

from pathlib import Path
from typing import Dict, List, Any
from sentence_transformers import SentenceTransformer

from app.services.strategy.raw_data_filter import load_and_filter_today_data
from app.services.strategy.template_matcher import match_templates
from app.services.strategy.data_extractor import (
    extract_texts_from_data_list,
    extract_sources_from_data_list,
    combine_texts
)
from app.services.strategy.template_formatter import (
    convert_templates_to_frontend_format,
    ensure_minimum_templates
)

# 상수 정의
MAX_TEXT_LENGTH = 5000  # 텍스트 최대 길이
MATCH_MULTIPLIER = 3  # 카테고리별 최소 1개씩 포함되도록 매칭할 템플릿 수 배율


def _extract_raw_data_text(filtered_raw_data: Dict[str, Any]) -> str:
    """
    필터링된 raw_data에서 텍스트 내용 추출 (템플릿 매칭용)
    
    [입력]
    - filtered_raw_data: 필터링된 raw_data
    
    [출력]
    - 추출된 텍스트 문자열 (공백으로 구분, 최대 5000자)
    """
    texts = []
    
    # 브랜드 데이터에서 텍스트 추출
    brand_data = filtered_raw_data.get("brandData", [])
    texts.extend(extract_texts_from_data_list(brand_data))
    
    # 프로젝트 키워드 데이터에서 텍스트 추출
    project_keywords = filtered_raw_data.get("projectKeywords", [])
    for pk in project_keywords:
        pk_data = pk.get("data", [])
        texts.extend(extract_texts_from_data_list(pk_data))
    
    # 텍스트를 결합하고 최대 길이 제한
    return combine_texts(texts, max_length=MAX_TEXT_LENGTH)


def _extract_sources_from_raw_data(filtered_raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    필터링된 raw_data에서 sources 추출
    
    [입력]
    - filtered_raw_data: 필터링된 raw_data
    
    [출력]
    - sources 리스트 (프론트엔드 형식)
    """
    sources = []
    
    # 브랜드 데이터에서 sources 추출
    brand_data = filtered_raw_data.get("brandData", [])
    sources.extend(extract_sources_from_data_list(brand_data))
    
    # 프로젝트 키워드 데이터에서 sources 추출
    project_keywords = filtered_raw_data.get("projectKeywords", [])
    for pk in project_keywords:
        pk_data = pk.get("data", [])
        sources.extend(extract_sources_from_data_list(pk_data))
    
    return sources


def run_strategy_pipeline(
    question: str,
    brand_id: int,
    brand_name: str,
    project_keyword_ids: List[int],
    embed_model: SentenceTransformer,
    template_path: Path = None,
    top_k: int = 5
) -> Dict[str, Any]:
    """
    전략 분석 파이프라인 실행
    
    [입력]
    - question: 사용자 질문
    - brand_id: 브랜드 ID
    - brand_name: 브랜드명
    - project_keyword_ids: 프로젝트 키워드 ID 리스트
    - embed_model: SentenceTransformer 모델
    - template_path: 템플릿 파일 경로 (None이면 기본 경로)
    - top_k: 선택할 템플릿 개수
    
    [출력]
    - 결과 딕셔너리 (프론트엔드 형식):
      {
        "ok": True,
        "data": {
          "insights": [...],
          "problems": [...],
          "solutions": [...]
        },
        "sources": [...]
      }
    """
    try:
        # 1. 당일 raw_data 로드 및 필터링
        filtered_raw_data = load_and_filter_today_data(
            brand_id=brand_id,
            brand_name=brand_name,
            project_keyword_ids=project_keyword_ids
        )
        
        # 2. raw_data에서 텍스트 추출 (템플릿 매칭에 사용)
        raw_data_text = _extract_raw_data_text(filtered_raw_data)
        
        # 3. 템플릿 로드 및 유사도 매칭 (질문 + raw_data 기반)
        templates, matched_templates = match_templates(
            question=question,
            template_path=template_path,
            embed_model=embed_model,
            top_k=top_k * MATCH_MULTIPLIER,  # 각 카테고리별로 최소 1개씩 포함되도록 충분히 선택
            raw_data_text=raw_data_text
        )
        
        # 4. 템플릿을 프론트엔드 형식으로 변환
        frontend_data = convert_templates_to_frontend_format(matched_templates)
        
        # 5. 각 카테고리별로 최소 1개씩 포함되도록 보장
        frontend_data = ensure_minimum_templates(frontend_data, templates)
        
        # 6. sources 추출
        sources = _extract_sources_from_raw_data(filtered_raw_data)
        
        # 7. 결과 구성 (프론트엔드 형식)
        return {
            "ok": True,
            "data": frontend_data,
            "sources": sources
        }
        
    except Exception as e:
        return {
            "ok": False,
            "reason": str(e),
            "data": None,
            "sources": []
        }


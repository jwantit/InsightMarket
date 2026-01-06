# app/services/strategy/raw_data_filter.py
# ============================================================
# [기능] raw_data 필터링 유틸리티
# - 당일 raw_data 파일 로드
# - brandId, brandName, projectKeywordIds로 필터링
# - 분석용 정제된 데이터 반환
# ============================================================

from typing import Dict, List, Any, Optional

# collect 모듈의 함수 재사용
from app.api.routes.collect import (
    load_collected_data
)


def filter_raw_data_by_brand_and_keywords(
    brand_id: int,
    brand_name: str,
    project_keyword_ids: List[int],
    raw_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    raw_data에서 특정 브랜드와 프로젝트 키워드에 해당하는 데이터만 필터링
    
    [입력]
    - brand_id: 브랜드 ID
    - brand_name: 브랜드명
    - project_keyword_ids: 프로젝트 키워드 ID 리스트
    - raw_data: raw_data 딕셔너리 (None이면 당일 파일 자동 로드)
    
    [출력]
    - 필터링된 raw_data 구조:
      {
        "brandId": int,
        "brandName": str,
        "brandData": [...],  # 브랜드 데이터만
        "projectKeywords": [
          {
            "projectKeywordId": int,
            "keyword": str,
            "data": [...]  # 해당 키워드의 데이터만
          }
        ]
      }
    """
    # raw_data가 없으면 당일 파일 로드
    if raw_data is None:
        raw_data = load_collected_data()
    
    # 브랜드 찾기
    brands = raw_data.get("brands", [])
    target_brand = None
    for brand in brands:
        if brand.get("brandId") == brand_id:
            target_brand = brand
            break
    
    if target_brand is None:
        # 브랜드가 없으면 빈 구조 반환
        return {
            "brandId": brand_id,
            "brandName": brand_name,
            "brandData": [],
            "projectKeywords": []
        }
    
    # 필터링된 결과 초기화
    filtered_result = {
        "brandId": brand_id,
        "brandName": brand_name,
        "brandData": target_brand.get("brandData", []),
        "projectKeywords": []
    }
    
    # 프로젝트 키워드 필터링
    project_keywords = target_brand.get("projectKeywords", [])
    for pk in project_keywords:
        pk_id = pk.get("projectKeywordId")
        if pk_id in project_keyword_ids:
            # 해당 프로젝트 키워드의 데이터만 포함
            filtered_result["projectKeywords"].append({
                "projectKeywordId": pk_id,
                "keyword": pk.get("keyword", ""),
                "data": pk.get("data", [])
            })
    
    return filtered_result


def load_and_filter_today_data(
    brand_id: int,
    brand_name: str,
    project_keyword_ids: List[int]
) -> Dict[str, Any]:
    """
    당일 raw_data 파일을 로드하고 필터링하는 편의 함수
    
    [입력]
    - brand_id: 브랜드 ID
    - brand_name: 브랜드명
    - project_keyword_ids: 프로젝트 키워드 ID 리스트
    
    [출력]
    - 필터링된 raw_data
    """
    return filter_raw_data_by_brand_and_keywords(
        brand_id=brand_id,
        brand_name=brand_name,
        project_keyword_ids=project_keyword_ids
    )


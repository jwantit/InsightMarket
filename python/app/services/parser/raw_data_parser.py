"""
Raw 데이터 파서 모듈
collected_data.json 파일을 읽어 분석 가능한 형태로 변환
"""
import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


def parse_raw_data(file_path: str, brand_id: Optional[int] = None) -> List[Dict]:
    """
    collected_data.json 파일을 읽어 분석 가능한 형태로 변환
    
    Args:
        file_path: JSON 파일 경로
        brand_id: 특정 브랜드만 필터링 (None이면 전체)
    
    Returns:
        List[Dict]: 분석 가능한 형태의 데이터 리스트
            각 항목은 {
                'brand_id': int,
                'project_id': int | None,
                'keyword_id': int | None,
                'competitor_id': int | None,
                'text': str,  # title + text + comments 병합
                'source': str,
                'collected_at': str
            }
    """
    file = Path(file_path)
    if not file.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
    
    with open(file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    parsed_data = []
    brands = data.get("brands", [])
    
    for brand in brands:
        brand_id_from_data = brand.get("brandId")
        
        # brand_id 필터링
        if brand_id is not None and brand_id_from_data != brand_id:
            continue
        
        # 1. BRAND 타입 데이터 처리
        brand_data = brand.get("brandData", [])
        for item in brand_data:
            if item.get("type") != "BRAND":
                continue
            
            # text와 comments 병합
            text_parts = []
            if item.get("title"):
                text_parts.append(item["title"])
            if item.get("text"):
                text_parts.append(item["text"])
            if item.get("comments"):
                text_parts.extend(item["comments"])
            
            merged_text = " ".join(text_parts)
            if not merged_text.strip():
                continue
            
            parsed_data.append({
                "brand_id": brand_id_from_data,
                "project_id": None,
                "keyword_id": None,
                "competitor_id": None,
                "text": merged_text,
                "source": item.get("source", "UNKNOWN"),
                "collected_at": item.get("collectedAt") or item.get("publishedAt")
            })
        
        # 2. PROJECT 타입 데이터 처리
        project_keywords = brand.get("projectKeywords", [])
        for pk in project_keywords:
            project_keyword_id = pk.get("projectKeywordId")
            # project_id는 raw_data.json에 없을 수 있으므로 None으로 설정
            # Spring에서 저장 시 projectKeywordId로 ProjectKeyword를 조회하여 project_id를 설정할 수 있음
            project_id = pk.get("projectId")  # 프로젝트 ID가 있다면 사용, 없으면 None
            data_list = pk.get("data", [])
            
            for item in data_list:
                if item.get("type") != "PROJECT":
                    continue
                
                # text와 comments 병합
                text_parts = []
                if item.get("title"):
                    text_parts.append(item["title"])
                if item.get("text"):
                    text_parts.append(item["text"])
                if item.get("comments"):
                    text_parts.extend(item["comments"])
                
                merged_text = " ".join(text_parts)
                if not merged_text.strip():
                    continue
                
                parsed_data.append({
                    "brand_id": brand_id_from_data,
                    "project_id": project_id,  # None일 수 있음
                    "keyword_id": project_keyword_id,  # projectKeywordId를 keyword_id로 사용
                    "competitor_id": None,
                    "text": merged_text,
                    "source": item.get("source", "UNKNOWN"),
                    "collected_at": item.get("collectedAt") or item.get("publishedAt")
                })
        
        # 3. COMPETITOR 타입 데이터 처리
        competitors = brand.get("competitors", [])
        for comp in competitors:
            competitor_id = comp.get("competitorId")
            data_list = comp.get("data", [])
            
            for item in data_list:
                if item.get("type") != "COMPETITOR":
                    continue
                
                # text와 comments 병합
                text_parts = []
                if item.get("title"):
                    text_parts.append(item["title"])
                if item.get("text"):
                    text_parts.append(item["text"])
                if item.get("comments"):
                    text_parts.extend(item["comments"])
                
                merged_text = " ".join(text_parts)
                if not merged_text.strip():
                    continue
                
                parsed_data.append({
                    "brand_id": brand_id_from_data,
                    "project_id": None,
                    "keyword_id": None,
                    "competitor_id": competitor_id,
                    "text": merged_text,
                    "source": item.get("source", "UNKNOWN"),
                    "collected_at": item.get("collectedAt") or item.get("publishedAt")
                })
    
    print(f"[파서 완료] {len(parsed_data)}개 데이터 파싱 완료")
    return parsed_data


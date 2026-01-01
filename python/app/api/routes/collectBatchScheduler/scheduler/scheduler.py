import logging
import json
from pathlib import Path
from typing import Dict, List, Any
from fastapi import APIRouter, Request

from app.services.collector.collector import collect_data

api_router = APIRouter(prefix="/api", tags=["api"])
log = logging.getLogger(__name__)
# .env 파일 로드
# YOUTUBE_API_KEY = "AIzaSyDvYCedIYjRykuXICeO3BV0FISiWPOEUP0"

# 통합 데이터 파일 경로
DATA_FILE = "raw_data/collected_data.json"


# ============================================================
# 파일 관리 함수
# ============================================================
def load_collected_data() -> Dict[str, Any]:
    """수집 데이터 파일 로드 (없으면 빈 구조 반환)"""
    file_path = Path(DATA_FILE)
    if not file_path.exists():
        return {"brands": []}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"[파일 로드 오류] {e}, 빈 구조로 시작")
        return {"brands": []}

def save_collected_data(data: Dict[str, Any]) -> None:
    """수집 데이터 파일 저장"""
    file_path = Path(DATA_FILE)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[파일 저장 완료] {file_path.resolve()}")

def find_or_create_brand(data: Dict[str, Any], brand_id: int, brand_name: str) -> Dict[str, Any]:
    """브랜드 찾기 또는 생성"""
    brands = data.get("brands", [])
    
    # 기존 브랜드 찾기
    for brand in brands:
        if brand.get("brandId") == brand_id:
            return brand
    
    # 새 브랜드 생성
    new_brand = {
        "brandId": brand_id,
        "brandName": brand_name,
        "brandData": [],
        "projectKeywords": [],
        "competitors": []
    }
    brands.append(new_brand)
    data["brands"] = brands
    return new_brand

def find_or_create_project_keyword(brand: Dict[str, Any], project_keyword_id: int, keyword: str) -> Dict[str, Any]:
    """프로젝트 키워드 찾기 또는 생성"""
    project_keywords = brand.get("projectKeywords", [])
    
    # 기존 프로젝트 키워드 찾기
    for pk in project_keywords:
        if pk.get("projectKeywordId") == project_keyword_id:
            return pk
    
    # 새 프로젝트 키워드 생성
    new_pk = {
        "projectKeywordId": project_keyword_id,
        "keyword": keyword,  # 브랜드명 제거된 순수 키워드
        "data": []
    }
    project_keywords.append(new_pk)
    brand["projectKeywords"] = project_keywords
    return new_pk

def find_or_create_competitor(brand: Dict[str, Any], competitor_id: int, competitor_name: str) -> Dict[str, Any]:
    """경쟁사 찾기 또는 생성"""
    competitors = brand.get("competitors", [])
    
    # 기존 경쟁사 찾기
    for comp in competitors:
        if comp.get("competitorId") == competitor_id:
            return comp
    
    # 새 경쟁사 생성
    new_comp = {
        "competitorId": competitor_id,
        "competitorName": competitor_name,
        "data": []
    }
    competitors.append(new_comp)
    brand["competitors"] = competitors
    return new_comp


# ============================================================
# 진입점: Spring -> Python 데이터 수집 요청
# ============================================================
@api_router.post("/collect")
async def collect(request: Request):
    try:
        # 1. Spring이 보낸 요청 Body 전체를 JSON(딕셔너리) 형식으로 읽기
        body = await request.json()
        
        # 2. 값 추출
        keywordtype = body.get("type", "")  # "BRAND", "PROJECT", "COMPETITOR"
        keyword = body.get("keyword", "")  # 검색 키워드 (이미 조합된 상태)
        brandId = body.get("brandId")
        brandName = body.get("brandName", "")
        projectId = body.get("projectKeywordId")
        competitorId = body.get("competitorId")
        sources = body.get("sources", ["YOUTUBE", "NAVER"])  # 기본값은 둘 다 선택
        max_results = 5
        
        # 3. 로그 출력
        print(f"--- [데이터 파싱 결과] ---")
        print(f"타입: {keywordtype}")
        print(f"검색 키워드: {keyword}")
        print(f"brandId: {brandId}, brandName: {brandName}")
        print(f"projectKeywordId: {projectId}, competitorId: {competitorId}")
        print(f"sources: {sources}")
        print(f"--------------------------")

        # 4. collector.collect_data() 호출
        collected_list = collect_data(
            keyword=keyword,
            brand_id=brandId or 0,
            project_keyword_id=projectId,
            competitor_id=competitorId,
            keyword_type=keywordtype,
            sources=sources,
            max_youtube_videos=max_results,
            max_comments_per_video=5,
            max_naver_results=max_results
        )
        
        if not collected_list:
            return {
                "status": "error",
                "message": "데이터 수집 실패 또는 수집된 데이터가 없습니다."
            }

        # 5. 파일 로드
        collected_data = load_collected_data()
        
        # 6. 브랜드 찾기 또는 생성
        if not brandId:
            return {"status": "error", "message": "brandId가 필요합니다."}
        
        brand = find_or_create_brand(collected_data, brandId, brandName)
        
        # 7. type에 따라 적절한 위치에 데이터 추가
        if keywordtype == "BRAND":
            # 브랜드 데이터에 추가
            brand["brandData"].extend(collected_list)
            
        elif keywordtype == "PROJECT":
            if not projectId:
                return {"status": "error", "message": "projectKeywordId가 필요합니다."}
            
            # 프로젝트 키워드에서 브랜드명 제거 (저장 시에는 순수 키워드만)
            pure_keyword = keyword
            if brandName and keyword.startswith(brandName + " "):
                pure_keyword = keyword[len(brandName) + 1:].strip()
            
            project_keyword = find_or_create_project_keyword(brand, projectId, pure_keyword)
            project_keyword["data"].extend(collected_list)
            
        elif keywordtype == "COMPETITOR":
            if not competitorId:
                return {"status": "error", "message": "competitorId가 필요합니다."}
            
            competitor = find_or_create_competitor(brand, competitorId, keyword)
            competitor["data"].extend(collected_list)
        else:
            return {"status": "error", "message": f"지원하지 않는 타입: {keywordtype}"}
        
        # 8. 파일 저장
        save_collected_data(collected_data)
        
        return {
            "status": "success",
            "message": f"{keywordtype} 데이터 수집 및 저장 완료",
            "brandId": brandId,
            "count": len(collected_list)
        }

    except Exception as e:
        print(f"[수집 오류] {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

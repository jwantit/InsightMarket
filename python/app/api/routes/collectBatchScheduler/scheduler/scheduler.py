import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Request

from app.services.collector.collector import collect_data

api_router = APIRouter(prefix="/api", tags=["api"])
log = logging.getLogger(__name__)
# .env 파일 로드
# YOUTUBE_API_KEY = "AIzaSyDvYCedIYjRykuXICeO3BV0FISiWPOEUP0"

# Raw 데이터 디렉토리
RAW_DATA_DIR = "raw_data"

# 배치 수집 상태 관리 (메모리에 임시 저장)
_batch_data: Optional[Dict[str, Any]] = None
_batch_active: bool = False


# ============================================================
# 파일 관리 함수
# ============================================================
def get_date_based_filename(date: Optional[datetime] = None) -> str:
    """날짜 기반 파일명 생성 (raw_data_YYYYMMDD_HHMM.json)"""
    if date is None:
        date = datetime.now()
    date_str = date.strftime("%Y%m%d")
    time_str = date.strftime("%H%M")
    return f"raw_data_{date_str}_{time_str}.json"

def find_today_file() -> Optional[Path]:
    """당일 날짜의 raw 데이터 파일 검색"""
    data_dir = Path(RAW_DATA_DIR)
    if not data_dir.exists():
        return None
    
    today = datetime.now()
    date_prefix = today.strftime("%Y%m%d")
    
    # 당일 날짜로 시작하는 모든 파일 찾기
    today_files = list(data_dir.glob(f"raw_data_{date_prefix}_*.json"))
    
    if not today_files:
        return None
    
    # 가장 최근 파일 반환 (정렬 후 마지막)
    today_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return today_files[0]

def load_collected_data(file_path: Optional[Path] = None) -> Dict[str, Any]:
    """수집 데이터 파일 로드 (없으면 빈 구조 반환)"""
    if file_path is None:
        file_path = find_today_file()
        if file_path is None:
            return {"brands": []}
    
    if not file_path.exists():
        return {"brands": []}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"[파일 로드 오류] {e}, 빈 구조로 시작")
        return {"brands": []}

def save_collected_data(data: Dict[str, Any], file_path: Optional[Path] = None) -> Path:
    """수집 데이터 파일 저장 (날짜 기반 파일명 사용)"""
    if file_path is None:
        # 날짜 기반 파일명 생성
        filename = get_date_based_filename()
        file_path = Path(RAW_DATA_DIR) / filename
    
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[파일 저장 완료] {file_path.resolve()}")
    return file_path

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

def find_or_create_project_keyword(brand: Dict[str, Any], project_keyword_id: int, keyword: str, project_id: Optional[int] = None) -> Dict[str, Any]:
    """프로젝트 키워드 찾기 또는 생성"""
    project_keywords = brand.get("projectKeywords", [])
    
    # 기존 프로젝트 키워드 찾기
    for pk in project_keywords:
        if pk.get("projectKeywordId") == project_keyword_id:
            # projectId가 없으면 업데이트
            if project_id is not None and pk.get("projectId") is None:
                pk["projectId"] = project_id
            return pk
    
    # 새 프로젝트 키워드 생성
    new_pk = {
        "projectKeywordId": project_keyword_id,
        "projectId": project_id,  # projectId 추가
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
# 배치 수집 관리
# ============================================================
@api_router.post("/collect/batch-start")
async def batch_start():
    """배치 수집 시작 - 당일 파일이 있으면 로드, 없으면 빈 구조 초기화"""
    global _batch_data, _batch_active
    
    # 당일 파일 찾기
    today_file = find_today_file()
    if today_file is not None:
        # 당일 파일이 있으면 로드
        _batch_data = load_collected_data(today_file)
        print(f"[배치 시작] 당일 파일 로드: {today_file}")
    else:
        # 당일 파일이 없으면 빈 구조로 시작
        _batch_data = {"brands": []}
        print(f"[배치 시작] 당일 파일 없음, 빈 구조로 시작")
    
    _batch_active = True
    return {"status": "success", "message": "배치 수집 시작"}

@api_router.post("/collect/batch-complete")
async def batch_complete():
    """배치 수집 완료 - 메모리 데이터를 날짜 파일로 저장 (기존 파일 삭제 후 저장)"""
    global _batch_data, _batch_active
    if not _batch_active or _batch_data is None:
        return {"status": "error", "message": "활성화된 배치가 없습니다."}
    
    # 당일 파일 찾기
    today_file = find_today_file()
    
    # 기존 파일이 있으면 삭제 (당일에는 항상 1개의 파일만 존재하도록)
    if today_file is not None:
        today_file.unlink()
        print(f"[배치 완료] 기존 파일 삭제: {today_file}")
    
    # 현재 시간으로 새 파일명 생성하여 저장
    file_path = save_collected_data(_batch_data)
    _batch_data = None
    _batch_active = False
    print(f"[배치 완료] 새 파일 저장: {file_path}")
    return {"status": "success", "message": "배치 수집 완료", "file": str(file_path)}

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
        projectKeywordId = body.get("projectKeywordId")
        projectId = body.get("projectId")  # 실제 projectId
        competitorId = body.get("competitorId")
        sources = body.get("sources", ["YOUTUBE", "NAVER"])  # 기본값은 둘 다 선택
        is_batch = body.get("isBatch", False)  # 배치 모드 여부
        max_results = 5
        
        # 3. 로그 출력
        print(f"--- [데이터 파싱 결과] ---")
        print(f"타입: {keywordtype}")
        print(f"검색 키워드: {keyword}")
        print(f"brandId: {brandId}, brandName: {brandName}")
        print(f"projectKeywordId: {projectKeywordId}, projectId: {projectId}, competitorId: {competitorId}")
        print(f"sources: {sources}")
        print(f"--------------------------")

        # 4. collector.collect_data() 호출
        collected_list = collect_data(
            keyword=keyword,
            brand_id=brandId or 0,
            project_keyword_id=projectKeywordId,
            project_id=projectId,
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

        # 5. 배치 모드면 메모리 데이터 사용, 아니면 파일 로드
        global _batch_data, _batch_active
        if is_batch and _batch_active:
            collected_data = _batch_data
        else:
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
            if not projectKeywordId:
                return {"status": "error", "message": "projectKeywordId가 필요합니다."}
            
            # 프로젝트 키워드에서 브랜드명 제거 (저장 시에는 순수 키워드만)
            pure_keyword = keyword
            if brandName and keyword.startswith(brandName + " "):
                pure_keyword = keyword[len(brandName) + 1:].strip()
            
            # projectId도 함께 전달
            project_keyword = find_or_create_project_keyword(brand, projectKeywordId, pure_keyword, projectId)
            project_keyword["data"].extend(collected_list)
            
        elif keywordtype == "COMPETITOR":
            if not competitorId:
                return {"status": "error", "message": "competitorId가 필요합니다."}
            
            competitor = find_or_create_competitor(brand, competitorId, keyword)
            competitor["data"].extend(collected_list)
        else:
            return {"status": "error", "message": f"지원하지 않는 타입: {keywordtype}"}
        
        # 8. 파일 저장 (배치 모드가 아니면 즉시 저장)
        if not is_batch or not _batch_active:
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

@api_router.post("/collect/recollect")
async def recollect(request: Request):
    """브랜드/경쟁사/프로젝트 키워드 생성/수정 시 재수집"""
    try:
        body = await request.json()
        
        keywordtype = body.get("type", "")  # "BRAND", "PROJECT", "COMPETITOR"
        brandId = body.get("brandId")
        brandName = body.get("brandName", "")
        projectKeywordId = body.get("projectKeywordId")
        projectId = body.get("projectId")  # 실제 projectId
        competitorId = body.get("competitorId")
        sources = body.get("sources", ["YOUTUBE", "NAVER"])
        max_results = 5
        
        if not brandId:
            return {"status": "error", "message": "brandId가 필요합니다."}
        
        # 검색 키워드 구성
        keyword = body.get("keyword", "")
        if not keyword:
            # keyword가 없으면 타입별로 기본값 사용
            if keywordtype == "BRAND":
                keyword = brandName
            elif keywordtype == "PROJECT":
                if not projectKeywordId:
                    return {"status": "error", "message": "projectKeywordId가 필요합니다."}
                keyword = brandName + " " + body.get("projectKeywordName", "")
            elif keywordtype == "COMPETITOR":
                if not competitorId:
                    return {"status": "error", "message": "competitorId가 필요합니다."}
                keyword = body.get("competitorName", "")
            else:
                return {"status": "error", "message": f"지원하지 않는 타입: {keywordtype}"}
        
        print(f"[재수집 시작] type={keywordtype}, brandId={brandId}, keyword={keyword}")
        
        # 데이터 수집
        collected_list = collect_data(
            keyword=keyword,
            brand_id=brandId,
            project_keyword_id=projectKeywordId,
            project_id=projectId,
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
        
        # 당일 파일 찾기
        today_file = find_today_file()
        if today_file is None:
            # 파일이 없으면 새로 생성
            collected_data = {"brands": []}
            print(f"[재수집] 당일 파일 없음, 새로 생성")
        else:
            # 파일이 있으면 로드
            collected_data = load_collected_data(today_file)
            print(f"[재수집] 당일 파일 로드: {today_file}")
        
        # 브랜드 찾기 또는 생성
        brand = find_or_create_brand(collected_data, brandId, brandName)
        
        # type에 따라 데이터 추가/업데이트
        if keywordtype == "BRAND":
            # 브랜드 데이터를 새로 수집한 데이터로 교체 (기존 데이터 제거 후 추가)
            brand["brandData"] = collected_list
        elif keywordtype == "PROJECT":
            project_keyword_id = body.get("projectKeywordId")
            project_id = body.get("projectId")
            project_keyword_name = body.get("projectKeywordName", "")
            if not project_keyword_id:
                return {"status": "error", "message": "projectKeywordId가 필요합니다."}
            project_keyword = find_or_create_project_keyword(brand, project_keyword_id, project_keyword_name, project_id)
            project_keyword["data"] = collected_list
        elif keywordtype == "COMPETITOR":
            competitor = find_or_create_competitor(brand, competitorId, keyword)
            competitor["data"] = collected_list
        
        # 기존 파일이 있으면 삭제 후 현재 시간으로 새 파일명 생성하여 저장
        # (당일에는 항상 1개의 파일만 존재하도록)
        if today_file is not None:
            today_file.unlink()  # 기존 파일 삭제
            print(f"[재수집] 기존 파일 삭제: {today_file}")
        
        # 현재 시간으로 새 파일명 생성하여 저장
        saved_file = save_collected_data(collected_data)
        print(f"[재수집] 새 파일 저장: {saved_file}")
        
        return {
            "status": "success",
            "message": f"{keywordtype} 데이터 재수집 및 저장 완료",
            "brandId": brandId,
            "count": len(collected_list)
        }
        
    except Exception as e:
        print(f"[재수집 오류] {str(e)}")
        import traceback
        print(traceback.format_exc())
        return {"status": "error", "message": str(e)}

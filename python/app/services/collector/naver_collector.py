"""
Naver API를 이용한 데이터 수집 (블로그, 뉴스 등)
"""
import requests
import re
from typing import List, Dict, Optional
import time
from datetime import datetime

from app.config.settings import settings


def clean_text_minimal(text: str) -> str:
    """원본 데이터 저장 시 최소 정제만 적용 (의미를 바꾸지 않는 정제)"""
    if not text:
        return ""
    
    # 1. 제어문자 제거 (\n \t \r)
    text = re.sub(r'[\n\t\r]', ' ', text)
    
    # 2. HTML 태그 제거
    text = re.sub(r'<[^>]+>', '', text)
    
    # 3. URL 마스킹 또는 제거
    text = re.sub(r'https?://\S+', '<URL>', text)
    
    # 4. 너무 긴 반복 문자 제한 (3개 이상 → 2개)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    
    # 5. 공백 정규화 (연속 공백 → 단일 공백)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def collect_naver_blog(
    keyword: str,
    brand_id: int,
    project_keyword_id: Optional[int] = None,
    competitor_id: Optional[int] = None,
    keyword_type: str = "BRAND",  # "BRAND", "PROJECT", "COMPETITOR"
    max_results: int = 5,
    source_type: str = "blog"  # "blog" or "news"
) -> List[Dict]:
    """
    Naver 블로그/뉴스에서 키워드로 검색한 결과 수집
    
    Args:
        keyword: 검색할 키워드
        brand_id: 브랜드 ID
        project_keyword_id: 프로젝트 키워드 ID (PROJECT 타입일 때)
        competitor_id: 경쟁사 ID (COMPETITOR 타입일 때)
        keyword_type: "BRAND", "PROJECT", "COMPETITOR"
        max_results: 최대 수집 개수
        source_type: "blog" or "news"
    
    Returns:
        List[Dict]: 수집된 데이터 리스트
        각 항목은 {
            # 공통 필드 (YouTube와 Naver 통일)
            "source": "NAVER",
            "title": str,
            "text": str,  # title + description (최소 정제 적용)
            "url": str,  # Naver 블로그/뉴스 링크
            "publishedAt": str,  # ISO 형식 날짜 (YYYY-MM-DDTHH:MM:SSZ)
            "collectedAt": str,  # 수집한 날짜 (ISO 형식)
            "brandId": int,
            "projectKeywordId": int | None,
            "competitorId": int | None,
            "type": str  # "BRAND", "PROJECT", "COMPETITOR"
        }
    """
    collected_data = []
    
    # API 엔드포인트 설정
    if source_type == "blog":
        url = "https://openapi.naver.com/v1/search/blog.json"
        source_name = "NAVER"
    elif source_type == "news":
        url = "https://openapi.naver.com/v1/search/news.json"
        source_name = "NAVER"
    else:
        raise ValueError(f"Invalid source_type: {source_type}")
    
    naver_client_id = settings.naver_client_id
    naver_client_secret = settings.naver_client_secret
    
    if not naver_client_id or not naver_client_secret:
        print(f"[Naver] 에러: naver_client_id 또는 naver_client_secret이 설정되지 않았습니다.")
        return []
    
    headers = {
        "X-Naver-Client-Id": naver_client_id,
        "X-Naver-Client-Secret": naver_client_secret
    }
    
    # Naver API는 한 번에 최대 100개까지 가져올 수 있음
    display = min(100, max_results)
    start = 1
    
    try:
        while len(collected_data) < max_results:
            params = {
                "query": keyword,
                "display": display,
                "start": start,
                "sort": "date"  # 최신순
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])
            if not items:
                break
            
            collected_at = datetime.now().isoformat() + "Z"
            
            for item in items:
                # 원본 데이터 가져오기
                raw_title = item["title"]
                raw_description = item.get("description", "")
                
                # 최소 정제 적용
                title = clean_text_minimal(raw_title)
                description = clean_text_minimal(raw_description)
                
                # 제목 + 요약을 하나의 텍스트로 결합
                text = f"{title} {description}".strip()
                
                if text:
                    # postdate를 publishedAt 형식으로 변환 (YYYYMMDD -> YYYY-MM-DDTHH:MM:SSZ)
                    postdate = item.get("postdate", "")
                    published_at = postdate
                    if postdate and len(postdate) == 8:  # YYYYMMDD 형식
                        try:
                            dt = datetime.strptime(postdate, "%Y%m%d")
                            published_at = dt.strftime("%Y-%m-%dT00:00:00Z")
                        except:
                            published_at = postdate
                    
                    # URL 최소 정제
                    url = item.get("link", "")
                    
                    collected_data.append({
                        "source": source_name,
                        "title": title,
                        "text": text,  # 공통 text 필드
                        "url": url,  # 공통 url 필드
                        "publishedAt": published_at,  # 공통 publishedAt 필드
                        "collectedAt": collected_at,  # 수집한 날짜
                        "brandId": brand_id,
                        "projectKeywordId": project_keyword_id,
                        "competitorId": competitor_id,
                        "type": keyword_type
                    })
                    
                    if len(collected_data) >= max_results:
                        break
            
            # 다음 페이지가 없으면 종료
            if len(items) < display:
                break
            
            start += display
            time.sleep(0.1)  # API rate limit 방지
            
    except Exception as e:
        print(f"[Naver] 데이터 수집 중 오류: {e}")
        import traceback
        print(traceback.format_exc())
    
    return collected_data[:max_results]

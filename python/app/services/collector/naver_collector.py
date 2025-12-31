"""
Naver API를 이용한 데이터 수집 (블로그, 뉴스 등)
"""
import requests
from datetime import datetime
from typing import List, Dict
import time

from config.api_config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET


def collect_naver_blog(
    keyword: str,
    brand_id: int,
    project_id: int,
    keyword_id: int,
    max_results: int = 100,
    source_type: str = "blog"  # "blog" or "news"
) -> List[Dict]:
    """
    Naver 블로그/뉴스에서 키워드로 검색한 결과 수집
    
    Args:
        keyword: 검색할 키워드
        brand_id: 브랜드 ID
        project_id: 프로젝트 ID
        keyword_id: 키워드 ID
        max_results: 최대 수집 개수
        source_type: "blog" or "news"
    
    Returns:
        List[Dict]: 수집된 원본 데이터 리스트
        각 항목은 {
            'brand_id': int,
            'project_id': int,
            'keyword_id': int,
            'text': str,  # 제목 + 요약
            'source': str,  # 'NAVER_BLOG' or 'NAVER_NEWS'
            'collected_at': datetime,
            'link': str,  # 추가 정보
            'postdate': str  # 추가 정보
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
    
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
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
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])
            if not items:
                break
            
            for item in items:
                # HTML 태그 제거
                title = item["title"].replace("<b>", "").replace("</b>", "").strip()
                description = item.get("description", "").replace("<b>", "").replace("</b>", "").strip()
                
                # 제목 + 요약을 하나의 텍스트로 결합
                text = f"{title} {description}".strip()
                
                if text:
                    collected_data.append({
                        'brand_id': brand_id,
                        'project_id': project_id,
                        'keyword_id': keyword_id,
                        'text': text,
                        'source': source_name,
                        'collected_at': datetime.now(),
                        'link': item.get("link", ""),
                        'postdate': item.get("postdate", "")
                    })
                    
                    if len(collected_data) >= max_results:
                        break
            
            # 다음 페이지가 없으면 종료
            if len(items) < display:
                break
            
            start += display
            time.sleep(0.1)  # API rate limit 방지
            
    except Exception as e:
        print(f"❌ Naver 데이터 수집 중 오류: {e}")
    
    return collected_data[:max_results]


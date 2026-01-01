"""
YouTube API를 이용한 데이터 수집
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


def get_video_comments(video_id: str, youtube_api_key: str, max_comments: int = 5) -> List[str]:
    """영상의 댓글을 가져와서 최소 정제 후 반환"""
    url = "https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_comments,
        "key": youtube_api_key,
        "textFormat": "plainText"
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        items = data.get("items", [])
        cleaned_comments = []
        
        for item in items:
            raw_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            processed_text = clean_text_minimal(raw_text)
            
            if processed_text:
                cleaned_comments.append(processed_text)
        
        return cleaned_comments
        
    except Exception as e:
        print(f"[YouTube 에러] 영상ID({video_id}) 댓글 수집 실패: {e}")
        return []


def collect_youtube_comments(
    keyword: str,
    brand_id: int,
    project_keyword_id: Optional[int] = None,
    competitor_id: Optional[int] = None,
    keyword_type: str = "BRAND",  # "BRAND", "PROJECT", "COMPETITOR"
    max_videos: int = 5,
    max_comments_per_video: int = 5
) -> List[Dict]:
    """
    YouTube에서 키워드로 검색한 영상의 댓글 수집
    
    Args:
        keyword: 검색할 키워드
        brand_id: 브랜드 ID
        project_keyword_id: 프로젝트 키워드 ID (PROJECT 타입일 때)
        competitor_id: 경쟁사 ID (COMPETITOR 타입일 때)
        keyword_type: "BRAND", "PROJECT", "COMPETITOR"
        max_videos: 수집할 최대 영상 수
        max_comments_per_video: 영상당 최대 댓글 수
    
    Returns:
        List[Dict]: 수집된 데이터 리스트
        각 항목은 {
            # 공통 필드 (YouTube와 Naver 통일)
            "source": "YOUTUBE",
            "title": str,
            "text": str,  # 댓글을 합친 텍스트
            "url": str,  # YouTube 영상 URL
            "publishedAt": str,  # ISO 형식 날짜
            "collectedAt": str,  # 수집한 날짜 (ISO 형식)
            "brandId": int,
            "projectKeywordId": int | None,
            "competitorId": int | None,
            "type": str,  # "BRAND", "PROJECT", "COMPETITOR"
            # YouTube 특화 필드
            "videoId": str,
            "comments": List[str]  # 최소 정제된 댓글 리스트
        }
    """
    youtube_api_key = settings.youtube_api_key
    if not youtube_api_key:
        print("[YouTube] 에러: youtube_api_key가 설정되지 않았습니다.")
        return []
    
    collected_data = []
    
    try:
        # 1. 키워드로 영상 검색
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": keyword,
            "type": "video",
            "maxResults": max_videos,
            "key": youtube_api_key,
            "regionCode": "KR",
            "relevanceLanguage": "ko"
        }
        
        print(f"[YouTube] API 요청 시작: 키워드={keyword}, max_videos={max_videos}")
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])
        print(f"[YouTube] 검색 결과: {len(items)}개 영상")
        
        # 2. 각 영상의 댓글 수집
        collected_at = datetime.now().isoformat() + "Z"
        
        for item in items:
            video_id = item["id"]["videoId"]
            video_title = item["snippet"]["title"]
            published_at = item["snippet"]["publishedAt"]
            
            # 타이틀 최소 정제
            title = clean_text_minimal(video_title)
                
            # 댓글 가져오기
            comments = get_video_comments(video_id, youtube_api_key, max_comments_per_video)
            
            # 댓글을 하나의 텍스트로 결합 (포맷 통일)
            text = " ".join(comments) if comments else ""
            
            # 통합 형식으로 반환 (포맷 통일)
            video_data = {
                "source": "YOUTUBE",
                "title": title,
                "text": text,  # 댓글을 합친 텍스트
                "url": f"https://www.youtube.com/watch?v={video_id}",  # 공통 url 필드
                "publishedAt": published_at,
                "collectedAt": collected_at,  # 수집한 날짜
                "brandId": brand_id,
                "projectKeywordId": project_keyword_id,
                "competitorId": competitor_id,
                "type": keyword_type,
                # YouTube 특화 필드
                "videoId": video_id,
                "comments": comments  # 원본 댓글 리스트 유지
            }
            collected_data.append(video_data)
            
            time.sleep(0.1)  # API rate limit 방지
                
    except Exception as e:
        print(f"[YouTube] 데이터 수집 중 오류: {e}")
        import traceback
        print(traceback.format_exc())
    
    return collected_data

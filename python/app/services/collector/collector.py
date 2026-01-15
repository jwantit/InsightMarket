"""
통합 데이터 수집 모듈
"""
from typing import List, Dict, Optional

from .youtube_collector import collect_youtube_comments
from .naver_collector import collect_naver_blog


def collect_data(
    keyword: str,
    brand_id: int,
    project_keyword_id: Optional[int] = None,
    project_id: Optional[int] = None,
    competitor_id: Optional[int] = None,
    keyword_type: str = "BRAND",  # "BRAND", "PROJECT", "COMPETITOR"
    sources: List[str] = None,  # 기본값은 YOUTUBE, NAVER 둘 다
    max_youtube_videos: int = 5,
    max_comments_per_video: int = 5,
    max_naver_results: int = 5
) -> List[Dict]:
    """
    YouTube와 Naver API를 이용하여 데이터 수집
    
    Args:
        keyword: 검색할 키워드
        brand_id: 브랜드 ID
        project_keyword_id: 프로젝트 키워드 ID (PROJECT 타입일 때)
        competitor_id: 경쟁사 ID (COMPETITOR 타입일 때)
        keyword_type: "BRAND", "PROJECT", "COMPETITOR"
        sources: 수집할 소스 리스트 (예: ["YOUTUBE"], ["NAVER"], ["YOUTUBE", "NAVER"])
        max_youtube_videos: YouTube에서 수집할 최대 영상 수
        max_comments_per_video: 영상당 최대 댓글 수
        max_naver_results: Naver에서 수집할 최대 결과 수
    
    Returns:
        List[Dict]: 수집된 통합 데이터 리스트 (YouTube + Naver)
    """
    if sources is None:
        sources = ["YOUTUBE", "NAVER"]  # 기본값은 둘 다 선택
    
    all_collected_data = []
    
    print(f"[수집 시작] 키워드: {keyword} (brand_id={brand_id}, type={keyword_type}, sources={sources})")
    
    # YouTube 데이터 수집
    if "YOUTUBE" in sources:
        try:
            youtube_data = collect_youtube_comments(
                keyword=keyword,
                brand_id=brand_id,
                project_keyword_id=project_keyword_id,
                project_id=project_id,
                competitor_id=competitor_id,
                keyword_type=keyword_type,
                max_videos=max_youtube_videos,
                max_comments_per_video=max_comments_per_video
            )
            all_collected_data.extend(youtube_data)
            print(f"  → YouTube: {len(youtube_data)}개 수집")
        except Exception as e:
            print(f"  → YouTube 수집 실패: {e}")
            import traceback
            print(traceback.format_exc())
    
    # Naver 블로그 데이터 수집
    if "NAVER" in sources:
        try:
            naver_data = collect_naver_blog(
                keyword=keyword,
                brand_id=brand_id,
                project_keyword_id=project_keyword_id,
                project_id=project_id,
                competitor_id=competitor_id,
                keyword_type=keyword_type,
                max_results=max_naver_results,
                source_type="blog"
            )
            all_collected_data.extend(naver_data)
            print(f"  → Naver: {len(naver_data)}개 수집")
        except Exception as e:
            print(f"  → Naver 수집 실패: {e}")
            import traceback
            print(traceback.format_exc())
    
    print(f"[수집 완료] 총 {len(all_collected_data)}개 데이터 수집")
    
    return all_collected_data

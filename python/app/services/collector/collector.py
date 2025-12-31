"""
통합 데이터 수집 모듈
"""
from datetime import datetime
from typing import List, Dict, Tuple
import json
import os
from pathlib import Path

from .youtube_collector import collect_youtube_comments
from .naver_collector import collect_naver_blog


def collect_data(
    keywords: List[Dict],
    output_dir: str = "raw_data",
    max_youtube_videos: int = 10,
    max_comments_per_video: int = 100,
    max_naver_results: int = 100
) -> Tuple[List[Dict], str]:
    """
    YouTube와 Naver API를 이용하여 데이터 수집
    
    Args:
        keywords: 키워드 리스트
            각 항목은 {
                'brand_id': int,
                'project_id': int,
                'keyword_id': int,
                'keyword': str  # 검색할 키워드
            }
        output_dir: 원본 데이터 저장 디렉토리
        max_youtube_videos: YouTube에서 수집할 최대 영상 수
        max_comments_per_video: 영상당 최대 댓글 수
        max_naver_results: Naver에서 수집할 최대 결과 수
    
    Returns:
        List[Dict]: 수집된 원본 데이터 리스트 (메타데이터 포함)
    """
    # 출력 디렉토리 생성
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    all_collected_data = []
    collected_at = datetime.now()
    
    # 각 키워드별로 데이터 수집
    for keyword_info in keywords:
        keyword = keyword_info['keyword']
        brand_id = keyword_info['brand_id']
        project_id = keyword_info['project_id']
        keyword_id = keyword_info['keyword_id']
        
        print(f"[수집 중] 키워드: {keyword} (brand_id={brand_id}, project_id={project_id}, keyword_id={keyword_id})")
        
        # YouTube 데이터 수집
        try:
            youtube_data = collect_youtube_comments(
                keyword=keyword,
                brand_id=brand_id,
                project_id=project_id,
                keyword_id=keyword_id,
                max_videos=max_youtube_videos,
                max_comments_per_video=max_comments_per_video
            )
            all_collected_data.extend(youtube_data)
            print(f"  → YouTube: {len(youtube_data)}개 수집")
        except Exception as e:
            print(f"  → YouTube 수집 실패: {e}")
        
        # Naver 블로그 데이터 수집
        try:
            naver_data = collect_naver_blog(
                keyword=keyword,
                brand_id=brand_id,
                project_id=project_id,
                keyword_id=keyword_id,
                max_results=max_naver_results,
                source_type="blog"
            )
            all_collected_data.extend(naver_data)
            print(f"  → Naver: {len(naver_data)}개 수집")
        except Exception as e:
            print(f"  → Naver 수집 실패: {e}")
    
    print(f"[수집 완료] 총 {len(all_collected_data)}개 데이터 수집")
    
    # 원본 데이터를 JSON 파일로 저장
    timestamp_str = collected_at.strftime("%Y%m%d_%H%M%S")
    filename = f"raw_data_{timestamp_str}.json"
    file_path = os.path.join(output_dir, filename)
    
    # JSON 직렬화를 위해 datetime을 문자열로 변환
    serializable_data = []
    for item in all_collected_data:
        serializable_item = item.copy()
        if isinstance(serializable_item.get('collected_at'), datetime):
            serializable_item['collected_at'] = serializable_item['collected_at'].isoformat()
        serializable_data.append(serializable_item)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(serializable_data, f, ensure_ascii=False, indent=2)
    
    print(f"[저장 완료] 원본 데이터 저장: {file_path}")
    
    return all_collected_data, file_path


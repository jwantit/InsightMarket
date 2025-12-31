"""
YouTube API를 이용한 데이터 수집
"""
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime
from typing import List, Dict
import time

from config.api_config import YOUTUBE_API_KEY


def collect_youtube_comments(
    keyword: str,
    brand_id: int,
    project_id: int,
    keyword_id: int,
    max_videos: int = 10,
    max_comments_per_video: int = 100
) -> List[Dict]:
    """
    YouTube에서 키워드로 검색한 영상의 댓글 수집
    
    Args:
        keyword: 검색할 키워드
        brand_id: 브랜드 ID
        project_id: 프로젝트 ID
        keyword_id: 키워드 ID
        max_videos: 수집할 최대 영상 수
        max_comments_per_video: 영상당 최대 댓글 수
    
    Returns:
        List[Dict]: 수집된 원본 데이터 리스트
        각 항목은 {
            'brand_id': int,
            'project_id': int,
            'keyword_id': int,
            'text': str,  # 댓글 내용
            'source': str,  # 'YOUTUBE'
            'collected_at': datetime,
            'video_id': str,  # 추가 정보
            'video_title': str  # 추가 정보
        }
    """
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    collected_data = []
    
    try:
        # 1. 키워드로 영상 검색
        search_response = youtube.search().list(
            q=keyword,
            part="snippet",
            type="video",
            maxResults=max_videos,
            order="date"  # 최신순
        ).execute()
        
        video_count = 0
        for item in search_response.get("items", []):
            if video_count >= max_videos:
                break
                
            video_id = item["id"]["videoId"]
            video_title = item["snippet"]["title"]
            
            try:
                # 2. 각 영상의 댓글 수집
                comment_response = youtube.commentThreads().list(
                    part="snippet,replies",
                    videoId=video_id,
                    maxResults=max_comments_per_video,
                    textFormat="plainText",
                    order="relevance"  # 관련성순
                ).execute()
                
                # 댓글 수집
                for comment_item in comment_response.get("items", []):
                    top_comment = comment_item["snippet"]["topLevelComment"]["snippet"]
                    comment_text = top_comment["textDisplay"]
                    
                    if comment_text.strip():  # 빈 댓글 제외
                        collected_data.append({
                            'brand_id': brand_id,
                            'project_id': project_id,
                            'keyword_id': keyword_id,
                            'text': comment_text,
                            'source': 'YOUTUBE',
                            'collected_at': datetime.now(),
                            'video_id': video_id,
                            'video_title': video_title
                        })
                    
                    # 대댓글 수집
                    if comment_item["snippet"]["totalReplyCount"] > 0:
                        for reply in comment_item.get("replies", {}).get("comments", []):
                            reply_text = reply["snippet"]["textDisplay"]
                            if reply_text.strip():
                                collected_data.append({
                                    'brand_id': brand_id,
                                    'project_id': project_id,
                                    'keyword_id': keyword_id,
                                    'text': reply_text,
                                    'source': 'YOUTUBE',
                                    'collected_at': datetime.now(),
                                    'video_id': video_id,
                                    'video_title': video_title
                                })
                
                video_count += 1
                time.sleep(0.1)  # API rate limit 방지
                
            except HttpError as e:
                print(f"❌ 댓글 수집 실패 (video_id: {video_id}): {e}")
                continue
                
    except Exception as e:
        print(f"❌ YouTube 데이터 수집 중 오류: {e}")
    
    return collected_data


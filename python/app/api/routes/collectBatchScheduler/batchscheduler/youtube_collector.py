import json
from youtube_collector import YouTubeCollector

def collect_youtube_data(keyword, max_videos=10, max_comments=3):
    """
    유튜브 API로 데이터 수집 후 JSON 반환
    
    Args:
        keyword: 검색 키워드 (브랜드 이름)
        max_videos: 최대 영상 수
        max_comments: 영상당 최대 댓글 수
    
    Returns:
        dict: JSON 형태의 응답 데이터
    """
    yc = YouTubeCollector()
    
    # 1. 영상 검색
    videos = yc.search_videos(keyword, max_results=max_videos)
    
    if not videos:
        return {
            "success": False,
            "message": "검색된 영상이 없습니다.",
            "keyword": keyword,
            "videos": []
        }
    
    # 2. 각 영상의 댓글 수집
    result_videos = []
    for video in videos:
        comments = yc.get_video_comments(video['video_id'], max_results=max_comments)
        
        # 댓글 수집 불가 메시지 제외
        if comments and not any("수집 불가" in c for c in comments):
            result_videos.append({
                "video_id": video['video_id'],
                "title": video['title'],
                "comments": comments,
                "comment_count": len(comments)
            })
    
    # 3. JSON 응답 생성
    response = {
        "success": True,
        "keyword": keyword,
        "total_videos": len(result_videos),
        "videos": result_videos
    }
    
    return response

def collect_youtube_data_json_string(keyword, max_videos=10, max_comments=3):
    """
    JSON 문자열로 반환 (다른 곳에서 바로 사용 가능)
    """
    data = collect_youtube_data(keyword, max_videos, max_comments)
    return json.dumps(data, ensure_ascii=False, indent=2)

# 사용 예시
if __name__ == "__main__":
    # 키워드 입력
    keyword = input("검색할 키워드: ").strip()
    
    if not keyword:
        keyword = "스타벅스"  # 기본값
        print(f"기본 키워드 사용: {keyword}")
    
    # 데이터 수집
    print(f"\n'{keyword}' 관련 유튜브 데이터 수집 중...")
    result = collect_youtube_data(keyword, max_videos=5, max_comments=3)
    
    # JSON 출력
    print("\n=== JSON 응답 ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # 파일로 저장 (선택사항)
    save_file = input("\nJSON 파일로 저장하시겠습니까? (y/n): ").lower()
    if save_file == 'y':
        filename = f"youtube_{keyword.replace(' ', '_')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"저장 완료: {filename}")
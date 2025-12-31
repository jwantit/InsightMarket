import logging
import json
import os
import re  # 1. 추가됨
import requests
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Request
from dotenv import load_dotenv

api_router = APIRouter(prefix="/api", tags=["api"])
log = logging.getLogger(__name__)

# .env 파일 로드
# YOUTUBE_API_KEY = "AIzaSyDvYCedIYjRykuXICeO3BV0FISiWPOEUP0"


#불용어 처리 함수
#---------------------
def clean_comment(text: str):
    # 특수문자, 이모지, 링크 제거 (한글, 영어, 숫자만 남김)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
    
    # 불용어 리스트
    stopwords = ["광고", "구독", "좋아요", "판매", "클릭"]
    
    words = text.split()
    # 불용어 제거 및 1글자짜리 무의미한 단어 제외
    refined_words = [w for w in words if w not in stopwords and len(w) > 1]
    
    return " ".join(refined_words).strip()
#---------------------



#댓글 가져오기 함수
#---------------------
async def get_video_comments(v_id: str, YOUTUBE_API_KEY: str):
    url = f"https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet", #부분
        "videoId": video_id, #비디오 아이디 
        "maxResults": 5, #최대 댓글수
        "key": YOUTUBE_API_KEY, #유튜브 API 키
        "textFormat": "plainText" #텍스트 형식
    }
    
    try:
        #데이터 받아오기 호출탐색
        response = requests.get(url, params=params)
        #잘못받아온 경우
        response.raise_for_status()
        #딕셔너리 json화?
        data = response.json()
        #딕셔너리 items 키의 값 가져오기 (무조건 item이라는 바구니에 영상정보가 들어온다.)
        items = data.get("items", [])
        cleaned_comments = [] # 깨끗한 댓글만 담을 바구니
        
        for item in items:
            # 1. 유튜브에서 온 가공 안 된 댓글 원문 (더러운 상태)
            raw_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            
            # 2. [여기서 사용!] 세탁기(불용어 제거 함수)에 넣고 돌립니다.
            processed_text = clean_comment(raw_text)
            
            # 3. 세탁 결과 내용이 남아있다면(비어있지 않다면) 바구니에 담습니다.
            if processed_text:
                cleaned_comments.append(processed_text)
                
        return cleaned_comments # 깨끗해진 댓글 리스트만 반환!
        
    except Exception as e:
        print(f"[YouTube 에러] 영상ID({video_id}) 댓글 수집 실패: {e}")
        return []
#---------------------


#유튜브 API
#-------------------------------------------------------
                             # 애플  #"BRAND" 또는 "PROJECT"    null or n      null or n      갸져올 영상수 
async def call_youtube_api(keyword: str, keywordtype: str, brandId: int, projectId: int, max_results: int):
    """YouTube Data API v3를 호출하여 영상 검색"""
    if not YOUTUBE_API_KEY:
        print("[YouTube] 에러: YOUTUBE_API_KEY가 설정되지 않았습니다.")
        return None
    
    #호출(탐색) 형식
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": keyword,  # 검색은 키워드로만!
        "type": "video",
        "maxResults": max_results, # 갸져올(탐색) 영상수 
        "key": YOUTUBE_API_KEY,
        "regionCode": "KR",
        "relevanceLanguage": "ko"
    }
    #가공
    try:
        print(f"[YouTube] API 요청 시작: 키워드={keyword}, max_results={max_results}")
        #데이터 받아오기 호출탐색
        response = requests.get(url, params=params)
        #잘못받아온 경우
        response.raise_for_status()


        #딕셔너리 json화?
        data = response.json()
        #딕셔너리 items 키의 값 가져오기 (무조건 item이라는 바구니에 영상정보가 들어온다.)
        items = data.get("items", [])
        print(f"[YouTube] 검색 결과: {len(items)}개 영상")


        refined_results = []
        for item in items:
            v_id = item["id"]["videoId"]  #영상 id
            v_title = item["snippet"]["title"] #영상 제목
            v_published_at = item["snippet"]["publishedAt"] #생성시간

            #댓글 가져오기 호출탐색
            comments = await get_video_comments(v_id, YOUTUBE_API_KEY)


            #최종 형식 딕셔너리
            video_data = {
                "videoId": v_id,               # 영상 id
                "title": v_title,              # 영상 제목
                "comments": comments,          # 불용어가 제거된 댓글 리스트
                "brandId": brandId,            # Spring에서 넘겨준 값 그대로 전달
                "projectKeywordId": projectId, # Spring에서 넘겨준 값 그대로 전달
                "type": keywordtype,            # "BRAND" 또는 "PROJECT"
                "publishedAt": v_published_at  # 생성시간
            }
            refined_results.append(video_data)
        return refined_results
    except Exception as e:
        print(f"[YouTube] API 호출 에러: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return None
#-------------------------------------------------------


#진입점
#스프링 -> 파이썬 
#-------------------------------------------------------
@api_router.post("/collect")
async def collect(request: Request):
    try:
        # 1. Spring이 보낸 요청 Body 전체를 JSON(딕셔너리)으로 읽기
        body = await request.json()
        
        # 2. 값 쪼개기 (원하는 데이터만 추출)
        # .get("키", "기본값") 형식을 사용하면 해당 키가 없어도 에러가 나지 않습니다.
        keywordtype = body.get("type", "") #"BRAND" 또는 "PROJECT"
        keyword = body.get("keyword", "") 
        brandId = body.get("brandId", "")
        projectId = body.get("projectKeywordId", "")
        max_results = 5
        # 3. 쪼갠 값 확인용 로그 출력
        print(f"--- [데이터 파싱 결과] ---")
        print(f"추출된 키워드: {keyword}")
        print(f"--------------------------")

        #유튜브 API 호출
        youtube_list = await call_youtube_api(
            keyword=keyword, 
            keywordtype=keywordtype, 
            brandId=brandId, 
            projectId=projectId, 
            max_results=max_results
        )

        #JSON 파일로 저장
        save_to_json(youtube_list,keyword, keywordtype)

        # 4. (임시) 유튜브 대신 파싱 결과가 성공했음을 응답
        return {
            "status": "success",
            "received_data": {
                "keyword": keyword,
                "max_results": max_results
            }
        }

    except Exception as e:
        print(f"데이터 쪼개기 실패: {str(e)}")
        return {"status": "error", "message": "JSON 파싱 중 오류가 발생했습니다."}
        #-------------------------------------------------------





#저장함수 JSON 파일로 저장-------------------------------------------------------
#-------------------------------------------------------
async def save_to_json(data: list, keyword: str, keywordtype: str):


    sub_dir = f"youtube/{keywordtype.lower()}"
    os.makedirs(sub_dir, exist_ok=True) # 폴더 자동 생성


    safe_keyword = keyword.replace(" ", "_")
    filename = f"yt_{safe_keyword}_{b_id}_{p_id}_{datetime.now().strftime('%H%M%S')}.json"
    file_path = os.path.join(sub_dir, filename)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return os.path.abspath(file_path)
#-------------------------------------------------------






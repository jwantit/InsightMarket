from fastapi import APIRouter, Request, FastAPI
from fastapi.responses import JSONResponse
import uvicorn
from pytrends.request import TrendReq
import pandas as pd
import requests
import json
import logging
from datetime import datetime

log = logging.getLogger(__name__)

# 구글 트렌드 설정 (글로벌 세션)
pytrends = TrendReq(hl='ko-KR', tz=360)
router = APIRouter(prefix="/api/trends", tags=["related_search"])

@router.post("/generate-related")
async def generate_related_search(request: Request):

    log.info("Google Trends 수집 요청 진입")

    # 1. Java 백엔드 데이터 수신
    body = await request.json()
    keyword = body.get("brandName", "")
    brandId = body.get("brandId", "")

    try:
        # 2. Google Trends 데이터 수집
        pytrends.build_payload([keyword], cat=0, timeframe='today 1-m', geo='KR')
        related_queries = pytrends.related_queries() 
        
        target_data = related_queries.get(keyword, {}) 

        # 3. TOP (인기) 데이터 가공
        top_list = []
        if target_data.get('top') is not None:
            top_list = target_data['top'].head(20).to_dict(orient='records')

        # 4. RISING (급상승) 데이터 가공 + 'Breakout' 처리
        rising_list = []
        if target_data.get('rising') is not None:
            # Rising 데이터에서 'Breakout' 글자를 "5000"(성장률 5000%)으로 치환하고 모든 값을 문자열로 변환
            df_rising = target_data['rising'].head(20).copy()
            df_rising['value'] = df_rising['value'].apply(
                lambda x: "5000" if x == 'Breakout' else str(x)
            )
            rising_list = df_rising.to_dict(orient='records')

        return {
            "keyword": keyword,
            "brandId": brandId,
            "collectedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "data": {
                "top": top_list,
                "rising": rising_list
            },
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
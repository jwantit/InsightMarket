# app/services/strategy/stats_extractor.py
# ============================================================
# [기능] 프로젝트 키워드별 감정분석 통계 추출
# - raw_data 또는 DB에서 키워드별 통계 조회
# - 부정 키워드, 토큰, 감정 비율 추출
# ============================================================

from collections import Counter, defaultdict
from typing import Dict, List, Any


def extract_keyword_stats_from_raw_data(
    filtered_raw_data: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    필터링된 raw_data에서 키워드별 감정분석 통계 추출
    
    [입력]
    - filtered_raw_data: {
        "projectKeywords": [
          {
            "projectKeywordId": 1,
            "keyword": "나이키 에어맥스",
            "data": [
              {"text": "...", "sentiment": "NEG", ...},
              ...
            ]
          }
        ]
      }
    
    [출력]
    - [
        {
          "keyword": "나이키 에어맥스",
          "projectKeywordId": 1,
          "mentionCount": 150,
          "sentiment": {"positive": 30.0, "negative": 65.0, "neutral": 5.0},
          "topTokens": ["가격", "비싸다", "품질"]
        },
        ...
      ]
    """
    keyword_stats = []
    
    project_keywords = filtered_raw_data.get("projectKeywords", [])
    
    for pk in project_keywords:
        keyword = pk.get("keyword", "")
        project_keyword_id = pk.get("projectKeywordId")
        data_list = pk.get("data", [])
        
        if not data_list:
            continue
        
        # 감정 분류 카운트
        sentiment_counts = {"POS": 0, "NEG": 0, "NEU": 0}
        all_tokens = []
        
        for item in data_list:
            # 감정 카운트 (sentiment 필드가 있으면 사용, 없으면 추정)
            sentiment = item.get("sentiment", "NEU")
            if sentiment in ["POS", "POSITIVE", "긍정"]:
                sentiment_counts["POS"] += 1
            elif sentiment in ["NEG", "NEGATIVE", "부정"]:
                sentiment_counts["NEG"] += 1
            else:
                sentiment_counts["NEU"] += 1
            
            # 토큰 추출 (tokens 필드가 있으면 사용)
            tokens = item.get("tokens", [])
            if tokens:
                all_tokens.extend(tokens)
            else:
                # tokens가 없으면 text에서 간단히 추출 (실제로는 분석 파이프라인에서 생성)
                text = item.get("text", "")
                if text:
                    # 간단한 단어 분리 (실제로는 형태소 분석 필요)
                    words = text.split()
                    all_tokens.extend(words[:10])  # 최대 10개만
        
        # 총 언급량
        total = sum(sentiment_counts.values())
        if total == 0:
            continue
        
        # 감정 비율 계산
        sentiment_ratios = {
            "positive": round(sentiment_counts["POS"] / total * 100, 1),
            "negative": round(sentiment_counts["NEG"] / total * 100, 1),
            "neutral": round(sentiment_counts["NEU"] / total * 100, 1)
        }
        
        # 상위 토큰 추출
        token_counter = Counter(all_tokens)
        top_tokens = [word for word, _ in token_counter.most_common(10)]
        
        keyword_stats.append({
            "keyword": keyword,
            "projectKeywordId": project_keyword_id,
            "mentionCount": total,
            "sentiment": sentiment_ratios,
            "topTokens": top_tokens
        })
    
    return keyword_stats


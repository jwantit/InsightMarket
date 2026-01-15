# app/services/strategy/query_builder.py
# ============================================================
# [기능] Query Engineering - 자연어 쿼리 생성
# - 부정 키워드 추출
# - 카테고리 분류
# - 자연어 쿼리 생성 (부정 키워드 + 카테고리 + 질문)
# ============================================================

from collections import Counter
from typing import Dict, List, Any


# 카테고리 매핑 (키워드 → 카테고리)
CATEGORY_KEYWORD_MAPPING = {
    "배송/물류": ["배송", "지연", "늦다", "배송비", "물류", "택배", "파손", "오배송", "배송 속도", "배송 서비스"],
    "가격": ["가격", "비싸다", "경쟁력", "비용", "할인", "프리미엄", "가성비", "돈값", "가격대비"],
    "품질": ["품질", "불량", "문제", "나쁘다", "불만", "기대치", "내구성", "재질"],
    "서비스": ["서비스", "응대", "CS", "고객", "대응", "느리다", "부족", "만족"],
    "마케팅": ["인지도", "브랜드", "홍보", "마케팅", "알려지지 않음", "광고"],
    "디지털": ["온라인", "디지털", "웹사이트", "앱", "경험", "불편"],
    "프로모션": ["혜택", "프로모션", "쿠폰", "할인", "조건", "번들"],
    "전환": ["전환", "CVR", "상세페이지", "CTA", "이탈", "결제", "불안"],
    "리뷰": ["리뷰", "후기", "별점", "신뢰", "부정", "평점"],
    "재고": ["품절", "재고", "입고", "지연", "이탈", "공급"],
    "투명성": ["불투명", "배송비", "반품비", "추가비용", "조건", "정책"],
    "광고": ["광고", "타겟", "리타게팅", "예산", "A/B", "효율"],
    "클레임": ["클레임", "환불", "불만", "커뮤니티", "확산", "VOC"],
    "브랜딩": ["정체성", "차별화", "포지셔닝", "메시지", "브랜딩"],
    "가치": ["가성비", "가치", "돈값", "가격대비", "체감", "프리미엄"]
}


def extract_negative_keywords(keyword_stats: List[Dict[str, Any]]) -> List[str]:
    """
    프로젝트 키워드 통계에서 상위 부정 키워드 추출
    
    [입력]
    - keyword_stats: [
        {
          "keyword": "나이키 에어맥스",
          "mentionCount": 150,
          "sentiment": {"positive": 30, "negative": 65, "neutral": 5},
          "topTokens": ["가격", "비싸다", "품질", "불만", "배송"]
        },
        ...
      ]
    
    [출력]
    - 상위 부정 키워드 리스트 (최대 10개)
    """
    negative_keywords = []
    
    for kw in keyword_stats:
        sentiment = kw.get("sentiment", {})
        negative_ratio = sentiment.get("negative", 0)
        
        # 부정 비율이 30% 이상인 키워드의 토큰 추출
        if negative_ratio >= 30:
            tokens = kw.get("topTokens", [])
            # 부정 비율에 가중치를 주어 토큰 추가
            weight = int(negative_ratio / 10)  # 30% = 3번, 70% = 7번
            for _ in range(weight):
                negative_keywords.extend(tokens[:5])  # 상위 5개 토큰만
    
    # 빈도순 정렬 후 상위 10개 반환
    if not negative_keywords:
        return []
    
    counter = Counter(negative_keywords)
    return [word for word, _ in counter.most_common(10)]


def classify_category(negative_keywords: List[str]) -> str:
    """
    부정 키워드로부터 카테고리 분류
    
    [입력]
    - negative_keywords: 부정 키워드 리스트
    
    [출력]
    - 카테고리 문자열 (예: "배송/물류", "가격", "품질" 등)
    """
    if not negative_keywords:
        return "기타"
    
    keyword_str = " ".join(negative_keywords).lower()
    max_score = 0
    matched_category = "기타"
    
    for category, keywords in CATEGORY_KEYWORD_MAPPING.items():
        # 카테고리 키워드와 매칭되는 개수 계산
        score = sum(1 for kw in keywords if kw.lower() in keyword_str)
        if score > max_score:
            max_score = score
            matched_category = category
    
    return matched_category


def calculate_negative_ratio(keyword_stats: List[Dict[str, Any]]) -> float:
    """
    전체 키워드의 평균 부정 비율 계산
    
    [입력]
    - keyword_stats: 키워드 통계 리스트
    
    [출력]
    - 평균 부정 비율 (0.0 ~ 100.0)
    """
    if not keyword_stats:
        return 0.0
    
    total_negative = 0.0
    count = 0
    
    for kw in keyword_stats:
        sentiment = kw.get("sentiment", {})
        negative_ratio = sentiment.get("negative", 0)
        if negative_ratio > 0:
            total_negative += negative_ratio
            count += 1
    
    return round(total_negative / count, 1) if count > 0 else 0.0


def generate_strategy_query(
    sentiment_stats: Dict[str, Any],
    user_question: str
) -> str:
    """
    Query Engineering: 부정 키워드 + 카테고리 + 질문을 자연어 쿼리로 변환
    
    [입력]
    - sentiment_stats: {
        'top_negative_keywords': ['배송', '파손', '지연'],
        'top_negative_category': '배송/물류',
        'negative_ratio': 31.2
      }
    - user_question: 사용자 질문 (필수)
    
    [출력]
    - 자연어 쿼리 문자열
    """
    keywords = sentiment_stats.get('top_negative_keywords', [])
    category = sentiment_stats.get('top_negative_category', '기타')
    negative_ratio = sentiment_stats.get('negative_ratio', 0)
    
    # 자연어 쿼리 생성
    query_parts = []
    
    if category and category != "기타":
        query_parts.append(f"가장 심각한 문제점은 {category}이며")
    
    if keywords:
        keywords_str = ', '.join(keywords[:5])  # 상위 5개만
        query_parts.append(f"주요 부정 키워드는 {keywords_str}입니다")
    
    if negative_ratio > 0:
        query_parts.append(f"부정 반응 비율은 {negative_ratio:.1f}%입니다")
    
    # 사용자 질문 추가
    query_parts.append(f"사용자의 질문: {user_question}")
    
    return ". ".join(query_parts) + "."


def build_query_from_keyword_stats(
    keyword_stats: List[Dict[str, Any]],
    user_question: str
) -> str:
    """
    키워드 통계로부터 Query Engineering 쿼리 생성 (편의 함수)
    
    [입력]
    - keyword_stats: 키워드 통계 리스트
    - user_question: 사용자 질문
    
    [출력]
    - 자연어 쿼리 문자열
    """
    # 1. 부정 키워드 추출
    negative_keywords = extract_negative_keywords(keyword_stats)
    
    # 2. 카테고리 분류
    category = classify_category(negative_keywords)
    
    # 3. 부정 비율 계산
    negative_ratio = calculate_negative_ratio(keyword_stats)
    
    # 4. sentiment_stats 구성
    sentiment_stats = {
        'top_negative_keywords': negative_keywords,
        'top_negative_category': category,
        'negative_ratio': negative_ratio
    }
    
    # 5. 쿼리 생성
    return generate_strategy_query(sentiment_stats, user_question)


import re


def clean_text(text: str, remove_stopwords: bool = False) -> str:
    """
    텍스트 정제 함수
    - 기본 정제: 공백 제거, 특수문자 정리
    - 불용어 제거: 한국어 불용어 제거
    """
    if not text:
        return ""
    
    # 기본 정제
    cleaned = text.strip()
    
    # 불용어 제거
    if remove_stopwords:
        words = cleaned.split()
        filtered_words = [word for word in words if word not in KOREAN_STOPWORDS]
        cleaned = ' '.join(filtered_words)
    
    return cleaned
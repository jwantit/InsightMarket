"""
데이터 전처리 모듈
- Clean Text (정제)
- 불용어 제거
- Tokenize (형태소 분석 또는 간단한 분리)
- Chunk (메모리에 저장)
"""
import re
from datetime import date
from typing import List, Dict
from datetime import datetime


# 기본 불용어 리스트 (필요에 따라 확장 가능)
STOPWORDS = {
    '이', '가', '을', '를', '에', '의', '와', '과', '도', '로', '으로',
    '에서', '에게', '께', '한테', '에게서', '한테서',
    '은', '는', '만', '부터', '까지', '처럼', '만큼',
    '도', '조차', '마저', '까지', '부터',
    '그', '그것', '저', '저것', '이것',
    '있다', '없다', '하다', '되다', '이다',
    '그리고', '그런데', '하지만', '또한', '또',
    'http', 'https', 'www', 'com', 'kr', 'co'
}


def clean_text(text: str) -> str:
    """
    텍스트 정제
    - HTML 태그 제거
    - 특수문자 정리
    - 연속된 공백 제거
    - 이모지 제거 (선택적)
    """
    if not text:
        return ""
    
    # HTML 태그 제거
    text = re.sub(r'<[^>]+>', '', text)
    
    # URL 제거 (간단한 버전)
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    text = re.sub(r'www\.(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    
    # 이메일 제거
    text = re.sub(r'\S+@\S+', '', text)
    
    # 특수문자 정리 (한글, 영문, 숫자, 공백, 기본 구두점만 유지)
    text = re.sub(r'[^\w\s가-힣.,!?~\-]', ' ', text)
    
    # 연속된 공백을 하나로
    text = re.sub(r'\s+', ' ', text)
    
    # 앞뒤 공백 제거
    text = text.strip()
    
    return text


def remove_stopwords(tokens: List[str]) -> List[str]:
    """
    불용어 제거
    """
    return [token for token in tokens if token not in STOPWORDS and len(token) > 1]


def simple_tokenize(text: str) -> List[str]:
    """
    간단한 토큰화 (공백 기준 분리)
    향후 KoNLPy 같은 형태소 분석기로 교체 가능
    """
    if not text:
        return []
    
    # 공백 기준 분리
    tokens = text.split()
    
    # 빈 토큰 제거
    tokens = [t.strip() for t in tokens if t.strip()]
    
    return tokens


def tokenize_with_morphology(text: str) -> List[str]:
    """
    형태소 분석을 통한 토큰화 (KoNLPy 사용)
    현재는 간단한 버전 사용, 필요시 KoNLPy로 교체
    """
    # 간단한 토큰화 사용 (향후 KoNLPy 추가 가능)
    tokens = simple_tokenize(text)
    return tokens


def preprocess_data(
    raw_data: List[Dict],
    use_morphology: bool = False
) -> List[Dict]:
    """
    원본 데이터를 전처리하여 분석 가능한 형태로 변환
    
    Args:
        raw_data: 원본 데이터 리스트
            각 항목은 {
                'brand_id': int,
                'project_id': int,
                'keyword_id': int,
                'text': str,
                'source': str,
                'collected_at': datetime or str,
                ...
            }
        use_morphology: 형태소 분석 사용 여부 (현재는 False)
    
    Returns:
        List[Dict]: 전처리된 데이터 리스트 (메모리에 저장)
            각 항목은 {
                'brand_id': int,
                'project_id': int,
                'keyword_id': int,
                'stat_date': str,  # YYYY-MM-DD 형식
                'text': str,  # 정제된 텍스트
                'tokens': List[str],  # 토큰 리스트
                'source': str
            }
    """
    preprocessed_data = []
    
    for item in raw_data:
        original_text = item.get('text', '')
        if not original_text:
            continue
        
        # 1. 텍스트 정제
        cleaned_text = clean_text(original_text)
        if not cleaned_text:
            continue
        
        # 2. 토큰화
        if use_morphology:
            tokens = tokenize_with_morphology(cleaned_text)
        else:
            tokens = simple_tokenize(cleaned_text)
        
        # 3. 불용어 제거
        tokens = remove_stopwords(tokens)
        
        if not tokens:  # 토큰이 없으면 스킵
            continue
        
        # 4. stat_date 추출 (collected_at에서)
        collected_at = item.get('collected_at')
        if isinstance(collected_at, str):
            try:
                dt = datetime.fromisoformat(collected_at.replace('Z', '+00:00'))
            except:
                dt = datetime.now()
        elif isinstance(collected_at, datetime):
            dt = collected_at
        else:
            dt = datetime.now()
        
        stat_date = dt.strftime('%Y-%m-%d')
        
        # 5. 전처리된 데이터 생성
        preprocessed_item = {
            'brand_id': item['brand_id'],
            'project_id': item['project_id'],
            'keyword_id': item['keyword_id'],
            'stat_date': stat_date,
            'text': cleaned_text,
            'tokens': tokens,
            'source': item.get('source', 'UNKNOWN')
        }
        
        preprocessed_data.append(preprocessed_item)
    
    print(f"[전처리 완료] {len(preprocessed_data)}개 데이터 전처리 완료")
    
    return preprocessed_data


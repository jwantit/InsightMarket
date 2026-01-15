"""
데이터 전처리 모듈
- Clean Text (정제)
- 불용어 제거
- Tokenize (형태소 분석 또는 간단한 분리)
- Chunk (메모리에 저장)
"""
import re
import os
from pathlib import Path
from datetime import date
from typing import List, Dict, Set
from datetime import datetime

# soynlp import 시도
try:
    from soynlp.normalizer import emoticon_normalize
    _SOYNLP_AVAILABLE = True
except ImportError:
    _SOYNLP_AVAILABLE = False
    print("[경고] soynlp가 설치되지 않았습니다. 반복 이모티콘 정규화가 제한됩니다. pip install soynlp 실행하세요.")

# KoNLPy (Hannanum) import 시도
try:
    from konlpy.tag import Hannanum
    _KONLPY_AVAILABLE = True
    _hannanum = Hannanum()
except ImportError:
    _KONLPY_AVAILABLE = False
    _hannanum = None
    print("[경고] KoNLPy가 설치되지 않았습니다. 형태소 분석이 제한됩니다. pip install konlpy 실행하세요.")


# 기본 불용어 리스트 (파일이 없을 때 fallback)
_DEFAULT_STOPWORDS = {
    '이', '가', '을', '를', '에', '의', '와', '과', '도', '로', '으로',
    '에서', '에게', '께', '한테', '에게서', '한테서',
    '은', '는', '만', '부터', '까지', '처럼', '만큼',
    '도', '조차', '마저', '까지', '부터',
    '그', '그것', '저', '저것', '이것',
    '있다', '없다', '하다', '되다', '이다',
    '그리고', '그런데', '하지만', '또한', '또',
    'http', 'https', 'www', 'com', 'kr', 'co'
}

def _load_stopwords() -> Set[str]:
    """
    stopwords-ko.txt 파일에서 불용어를 로드
    파일이 없으면 기본 불용어 리스트 사용
    """
    # 현재 파일과 같은 디렉토리에서 찾기
    current_file = Path(__file__)
    stopwords_file = current_file.parent / "stopwords-ko.txt"
    
    if stopwords_file.exists():
        try:
            with open(stopwords_file, 'r', encoding='utf-8') as f:
                stopwords = set()
                for line in f:
                    word = line.strip()
                    if word and not word.startswith('#'):  # 주석 제외
                        stopwords.add(word)
                print(f"[불용어 로드] {stopwords_file}에서 {len(stopwords)}개 불용어 로드 완료")
                return stopwords
        except Exception as e:
            print(f"[불용어 로드 경고] {stopwords_file} 읽기 실패: {e}. 기본 불용어 리스트 사용")
            return _DEFAULT_STOPWORDS
    else:
        print(f"[불용어 로드] {stopwords_file} 파일이 없습니다. 기본 불용어 리스트 사용")
        return _DEFAULT_STOPWORDS

# 불용어 세트 (모듈 로드 시 한 번만 로드)
STOPWORDS = _load_stopwords()


def normalize_repeated_chars(text: str, max_repeat: int = 2) -> str:
    """
    반복되는 문자 정규화 (fallback, soynlp가 없을 때 사용)
    예: ㅋㅋㅋㅋㅋ -> ㅋㅋ, ㅠㅠㅠㅠ -> ㅠㅠ
    """
    # 한글 자음/모음이 3번 이상 반복되는 경우 최대 2번으로 제한
    pattern = r'(.)\1{2,}'
    def replace(match):
        char = match.group(1)
        return char * min(max_repeat, len(match.group(0)))
    return re.sub(pattern, replace, text)


def clean_text(text: str, use_soynlp: bool = True) -> str:
    """
    텍스트 정제
    - HTML 태그 제거
    - URL 제거
    - 날짜 패턴 제거 (2025-12-28, 2025-12-28-2 등)
    - 반복 이모티콘 정규화 (ㅋㅋㅋㅋ -> ㅋㅋ, ㅠㅠㅠㅠ -> ㅠㅠ)
    - 특수문자 정리
    - 연속된 공백 제거
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
    
    # 날짜 패턴 제거 (2025-12-28, 2025-12-28-2, 20251228 등)
    text = re.sub(r'\d{4}-\d{1,2}-\d{1,2}(?:-\d+)?', ' ', text)  # 2025-12-28-2 형식
    text = re.sub(r'\d{4}\.\d{1,2}\.\d{1,2}', ' ', text)  # 2025.12.28 형식
    text = re.sub(r'\d{4}/\d{1,2}/\d{1,2}', ' ', text)  # 2025/12/28 형식
    text = re.sub(r'\d{8}', ' ', text)  # 20251228 형식
    
    # 반복 이모티콘 정규화
    if use_soynlp and _SOYNLP_AVAILABLE:
        # soynlp를 사용하여 정규화 (ㅋㅋㅋㅋㅋ -> ㅋㅋ, ㅠㅠㅠㅠ -> ㅠㅠ)
        text = emoticon_normalize(text, num_repeats=2)
    else:
        # fallback: 정규표현식 사용
        text = normalize_repeated_chars(text, max_repeat=2)
    
    # 특수문자 정리 (한글, 영문, 숫자, 공백, 기본 구두점만 유지)
    text = re.sub(r'[^\w\s가-힣.,!?~\-]', ' ', text)
    
    # 연속된 공백을 하나로
    text = re.sub(r'\s+', ' ', text)
    
    # 앞뒤 공백 제거
    text = text.strip()
    
    return text


def is_valid_token(token: str) -> bool:
    """
    토큰 유효성 검사
    - 최소 길이 체크
    - 숫자만 있는 토큰 제거
    - 특수문자만 있는 토큰 제거
    - 불완전한 한글 형태소 제거 (예: '아ㄴ데', 'ㅂ니다', 'ㅋㅋ')
    - 날짜 패턴 제거
    """
    if not token or len(token) < 2:
        return False
    
    # 숫자만 있는 토큰 제거 (예: '2025', '123')
    if token.isdigit():
        return False
    
    # 날짜 패턴 포함 토큰 제거 (예: '2025-12-28-2', '2025-12-28', '20251228')
    if re.search(r'\d{4}[-.]?\d{1,2}[-.]?\d{1,2}', token):
        return False
    
    # 특수문자만 있는 토큰 제거 (예: '---', '...')
    if re.match(r'^[^\w가-힣]+$', token):
        return False
    
    # 불완전한 한글 형태소 제거
    # 완성형 한글이 하나도 없고, 자음/모음만 있으면 제거
    # 예: 'ㅋㅋ', 'ㅂ니다', 'ㅠㅠ'
    
    # 완성형 한글 추출
    complete_hangul_chars = re.findall(r'[가-힣]', token)
    # 자음/모음 추출
    jamo_chars = re.findall(r'[ㄱ-ㅎㅏ-ㅣ]', token)
    
    # 완성형 한글이 없고 자음/모음만 있으면 제거
    if not complete_hangul_chars and jamo_chars:
        return False
    
    # 자음/모음이 포함된 토큰은 형태소 분석 오류일 가능성이 높으므로 제거
    # 예: '아ㄴ데', '이ㅂ니다', 'ㅋㅋ', 'ㅂ니다' 등
    # 완성형 한글과 자음/모음이 혼재하는 것은 비정상적임
    if jamo_chars:
        return False
    
    return True


def remove_stopwords(tokens: List[str]) -> List[str]:
    """
    불용어 제거 및 토큰 필터링
    """
    filtered = []
    for token in tokens:
        # 토큰 유효성 검사
        if not is_valid_token(token):
            continue
        
        # 불용어 제거
        if token in STOPWORDS:
            continue
        
        # 최소 길이 체크 (이미 is_valid_token에서 체크하지만 추가 보장)
        if len(token) < 2:
            continue
        
        filtered.append(token)
    
    return filtered


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
    형태소 분석을 통한 토큰화 (KoNLPy Hannanum 사용)
    """
    if not text:
        return []
    
    if _KONLPY_AVAILABLE and _hannanum:
        try:
            # Hannanum으로 형태소 분석
            tokens = _hannanum.morphs(text)
            # 빈 토큰 제거 및 공백 문자 제거
            tokens = [t.strip() for t in tokens if t.strip()]
            # 불완전한 토큰 제거 (한글 자음/모음만 있는 것)
            filtered_tokens = []
            for token in tokens:
                # 불완전한 한글 형태소 제거 (자음/모음만 있는 경우)
                if re.match(r'^[ㄱ-ㅎㅏ-ㅣ]+$', token) and not re.search(r'[가-힣]', token):
                    continue
                # 숫자만 있는 토큰 제거
                if token.isdigit():
                    continue
                # 날짜 패턴 제거
                if re.match(r'\d{4}[-.]?\d{1,2}[-.]?\d{1,2}', token):
                    continue
                filtered_tokens.append(token)
            return filtered_tokens
        except Exception as e:
            print(f"[토큰화 경고] Hannanum 형태소 분석 실패: {e}. 간단한 토큰화 사용")
            return simple_tokenize(text)
    else:
        # fallback: 간단한 토큰화
        tokens = simple_tokenize(text)
        # 간단 토큰화에서도 어미/조사 패턴 제거 시도
        filtered = []
        for token in tokens:
            # 어미/조사 패턴 제거 (예: "었어", "에요", "겠습니다" 등)
            if re.match(r'^(었|었어|었습니다|었죠|었네요)$', token):
                continue
            if re.match(r'^(에요|예요|아요|어요|이에요|이예요)$', token):
                continue
            if re.match(r'^(겠습니다|겠어요|겠죠|겠네요|겠어)$', token):
                continue
            if re.match(r'^(에게도|에게|께도|한테도)$', token):
                continue
            filtered.append(token)
        return filtered


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
                'project_id': int | None,
                'keyword_id': int | None,
                'competitor_id': int | None,
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
            'project_id': item.get('project_id'),
            'keyword_id': item.get('keyword_id'),
            'competitor_id': item.get('competitor_id'),
            'stat_date': stat_date,
            'text': cleaned_text,
            'tokens': tokens,
            'source': item.get('source', 'UNKNOWN')
        }
        
        preprocessed_data.append(preprocessed_item)
    
    print(f"[전처리 완료] {len(preprocessed_data)}개 데이터 전처리 완료")
    
    return preprocessed_data


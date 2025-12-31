# app/rag/chunker.py
# ============================================================
# [기능] 텍스트 청킹 유틸리티 (공통 모듈)
# - indexer와 pipeline에서 공통 사용
# ============================================================

import re
from typing import List

from app.config.settings import settings


def clean_text(text: str) -> str:
    """텍스트 정제 (공백 정규화)"""
    if not text:
        return ""
    t = text.strip()
    t = re.sub(r"\s+", " ", t).strip()
    return t


def simple_chunk(
    text: str,
    max_chars: int = None,
    overlap: int = None,
) -> List[str]:
    """
    문자 기반 청킹
    
    [입력]
    - text: 청킹할 텍스트
    - max_chars: 최대 문자 수 (기본값: settings.chunk_max_chars)
    - overlap: 오버랩 문자 수 (기본값: settings.chunk_overlap)
    
    [출력]
    - 청크 리스트
    """
    max_chars = max_chars or settings.chunk_max_chars
    overlap = overlap or settings.chunk_overlap
    
    text = clean_text(text)
    if not text:
        return []

    if overlap >= max_chars:
        overlap = max_chars // 3

    chunks: List[str] = []
    i = 0
    step = max_chars - overlap

    while i < len(text):
        chunk = text[i : i + max_chars].strip()
        if chunk:
            chunks.append(chunk)
        i += step

    return chunks


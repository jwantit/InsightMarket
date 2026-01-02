# app/services/strategy/template_matcher.py
# ============================================================
# [기능] 템플릿 유사도 매칭
# - 질문과 템플릿 간 임베딩 유사도 계산
# - 상위 N개 템플릿 선택
# - 템플릿별 유사도 점수 반환
# ============================================================

import json
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer

# 상수 정의
TEMPLATE_CATEGORIES = ["solutions", "causes", "insights"]  # 템플릿 카테고리
QUESTION_WEIGHT = 0.6  # 질문 유사도 가중치
RAW_DATA_WEIGHT = 0.4  # raw_data 유사도 가중치
RAW_DATA_TEXT_MAX_LENGTH = 5000  # raw_data 텍스트 최대 길이


def load_templates(template_path: Path = None) -> Dict[str, Any]:
    """
    템플릿 파일 로드
    
    [입력]
    - template_path: 템플릿 파일 경로 (None이면 기본 경로 사용)
    
    [출력]
    - 템플릿 딕셔너리
    """
    if template_path is None:
        template_path = Path("templates/strategy_templates.json")
    
    if not template_path.exists():
        raise FileNotFoundError(f"템플릿 파일을 찾을 수 없습니다: {template_path}")
    
    with open(template_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def _create_template_text(template: Dict[str, Any]) -> str:
    """
    템플릿에서 유사도 계산용 텍스트 생성
    
    [입력]
    - template: 템플릿 딕셔너리
    
    [출력]
    - 유사도 계산용 텍스트 문자열
    """
    parts = []
    
    # 제목
    if template.get("title"):
        parts.append(template["title"])
    
    # 설명
    if template.get("description"):
        parts.append(template["description"])
    
    # 키워드
    if template.get("keywords"):
        parts.extend(template["keywords"])
    
    # 예시
    if template.get("examples"):
        parts.extend(template["examples"])
    
    return " ".join(parts)


def match_templates_by_similarity(
    question: str,
    templates: Dict[str, Any],
    embed_model: SentenceTransformer,
    top_k: int = 5,
    raw_data_text: str = None
) -> List[Dict[str, Any]]:
    """
    질문과 템플릿 간 유사도 계산 후 상위 N개 선택
    raw_data가 제공되면 질문 유사도와 raw_data 유사도를 결합
    
    [입력]
    - question: 사용자 질문
    - templates: 템플릿 딕셔너리 (solutions, causes, insights 포함)
    - embed_model: SentenceTransformer 모델
    - top_k: 선택할 템플릿 개수
    - raw_data_text: raw_data의 텍스트 내용 (선택적)
    
    [출력]
    - 매칭된 템플릿 리스트 (유사도 점수 포함):
      [
        {
          "template": {...},  # 원본 템플릿
          "category": "solutions",  # 카테고리
          "similarity": 0.85  # 유사도 점수
        },
        ...
      ]
    """
    # 질문 임베딩 생성
    question_embedding = embed_model.encode(
        [f"query: {question}"],
        normalize_embeddings=True
    )[0]
    
    # raw_data 임베딩 생성 (제공된 경우)
    raw_data_embedding = None
    if raw_data_text and raw_data_text.strip():
        raw_data_embedding = embed_model.encode(
            [raw_data_text[:RAW_DATA_TEXT_MAX_LENGTH]],  # 너무 길면 잘라냄
            normalize_embeddings=True
        )[0]
    
    # 모든 템플릿 수집 및 임베딩 생성
    all_templates = []
    template_texts = []
    
    for category in TEMPLATE_CATEGORIES:
        category_templates = templates.get(category, [])
        for template in category_templates:
            template_text = _create_template_text(template)
            all_templates.append({
                "template": template,
                "category": category
            })
            template_texts.append(template_text)
    
    if not template_texts:
        return []
    
    # 템플릿 임베딩 생성
    template_embeddings = embed_model.encode(
        template_texts,
        normalize_embeddings=True
    )
    
    # 질문-템플릿 유사도 계산 (코사인 유사도)
    question_similarities = np.dot(template_embeddings, question_embedding)
    
    # raw_data-템플릿 유사도 계산 (raw_data가 제공된 경우)
    if raw_data_embedding is not None:
        raw_data_similarities = np.dot(template_embeddings, raw_data_embedding)
        # 질문 유사도와 raw_data 유사도 가중 평균
        combined_similarities = (
            QUESTION_WEIGHT * question_similarities + 
            RAW_DATA_WEIGHT * raw_data_similarities
        )
    else:
        # raw_data가 없으면 질문 유사도만 사용
        combined_similarities = question_similarities
    
    # 유사도 점수와 함께 결과 생성
    results = []
    for i, (template_info, similarity) in enumerate(zip(all_templates, combined_similarities)):
        results.append({
            "template": template_info["template"],
            "category": template_info["category"],
            "similarity": float(similarity)
        })
    
    # 유사도 내림차순 정렬
    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # 상위 N개 반환
    return results[:top_k]


def match_templates(
    question: str,
    template_path: Path = None,
    embed_model: SentenceTransformer = None,
    top_k: int = 5,
    raw_data_text: str = None
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    템플릿 파일 로드 및 유사도 매칭 (편의 함수)
    
    [입력]
    - question: 사용자 질문
    - template_path: 템플릿 파일 경로
    - embed_model: SentenceTransformer 모델 (None이면 에러)
    - top_k: 선택할 템플릿 개수
    
    [출력]
    - (templates, matched_templates) 튜플
      - templates: 전체 템플릿 딕셔너리
      - matched_templates: 매칭된 템플릿 리스트
    """
    if embed_model is None:
        raise ValueError("embed_model은 필수입니다.")
    
    templates = load_templates(template_path)
    matched = match_templates_by_similarity(
        question=question,
        templates=templates,
        embed_model=embed_model,
        top_k=top_k,
        raw_data_text=raw_data_text
    )
    
    return templates, matched


# app/services/strategy/template_matcher.py
# ============================================================
# [기능] 템플릿 유사도 매칭 (Qdrant 기반)
# - Query Engineering 쿼리를 벡터로 변환
# - Qdrant에서 유사한 템플릿 검색
# - 템플릿별 유사도 점수 반환
# ============================================================

import requests
from typing import Dict, List, Any, Optional
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from app.config.settings import settings

# 상수 정의
TEMPLATE_CATEGORIES = ["solutions", "causes", "insights"]  # 템플릿 카테고리


def match_strategy_templates(
    query_text: str,
    template_type: str,  # "cause", "solution", "insight"
    qdrant_client: QdrantClient,
    embed_model: SentenceTransformer,
    collection_name: str = "strategy_templates",
    top_k: int = 3,
    category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Query Engineering 방식으로 템플릿 매칭 (Qdrant REST API 사용)
    
    [입력]
    - query_text: 생성된 자연어 쿼리 (부정 키워드 + 카테고리 + 질문)
    - template_type: 템플릿 타입 ("cause", "solution", "insight")
    - qdrant_client: Qdrant 클라이언트 (URL 추출용)
    - embed_model: 임베딩 모델
    - collection_name: Qdrant 컬렉션 이름
    - top_k: 반환할 개수
    - category: 카테고리 필터 (선택적)
    
    [출력]
    - 매칭된 템플릿 리스트:
      [
        {
          "id": "...",
          "score": 0.89,
          "payload": {...}
        },
        ...
      ]
    """
    # QdrantClient에서 URL 추출
    # QdrantClient는 _client.http_client.base_url 또는 url 속성을 가질 수 있음
    try:
        if hasattr(qdrant_client, '_client') and hasattr(qdrant_client._client, 'http_client'):
            qdrant_url = str(qdrant_client._client.http_client.base_url).rstrip('/')
        elif hasattr(qdrant_client, 'url'):
            qdrant_url = qdrant_client.url
        else:
            qdrant_url = settings.qdrant_url
    except:
        qdrant_url = settings.qdrant_url
    
    # REST API를 통한 검색
    return match_templates_via_qdrant_rest(
        query_text=query_text,
        template_type=template_type,
        qdrant_url=qdrant_url,
        embed_model=embed_model,
        collection_name=collection_name,
        top_k=top_k,
        category=category
    )


def match_templates_via_qdrant_rest(
    query_text: str,
    template_type: str,
    qdrant_url: str,
    embed_model: SentenceTransformer,
    collection_name: str = "strategy_templates",
    top_k: int = 3,
    category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Qdrant REST API를 통한 템플릿 매칭 (QdrantClient가 없을 때 사용)
    
    [입력]
    - query_text: 생성된 자연어 쿼리
    - template_type: 템플릿 타입
    - qdrant_url: Qdrant 서버 URL
    - embed_model: 임베딩 모델
    - collection_name: 컬렉션 이름
    - top_k: 반환할 개수
    - category: 카테고리 필터
    
    [출력]
    - 매칭된 템플릿 리스트
    """
    # 1. 쿼리 문장을 벡터로 변환
    query_vector = embed_model.encode(
        [query_text],
        normalize_embeddings=True
    )[0].tolist()
    
    # 2. 필터 조건 구성
    filter_conditions = [{"key": "type", "match": {"value": template_type}}]
    
    if category:
        filter_conditions.append({"key": "category", "match": {"value": category}})
    
    # 3. Qdrant REST API 호출
    body = {
        "vector": query_vector,
        "limit": top_k,
        "filter": {"must": filter_conditions} if filter_conditions else None,
        "with_payload": True,
    }
    
    url = f"{qdrant_url}/collections/{collection_name}/points/search"
    
    r = requests.post(url, json=body, timeout=60)
    r.raise_for_status()
    
    results = r.json().get("result", [])
    
    return [
        {
            "id": r.get("id"),
            "score": r.get("score", 0),
            "payload": r.get("payload", {})
        }
        for r in results
    ]


# app/services/strategy/template_indexer.py
# ============================================================
# [기능] 전략 템플릿 벡터 인덱싱
# - strategy_templates.json 로드 → 벡터 변환 → Qdrant 인덱싱
# - search_context 필드 지원
# ============================================================

import json
import uuid
from pathlib import Path
from typing import Any, Dict, List

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

from app.config.settings import settings


def create_template_text(template: Dict[str, Any]) -> str:
    """
    템플릿에서 검색용 텍스트 생성
    - search_context가 있으면 우선 사용
    - 없으면 title + description + keywords + examples 결합
    """
    # search_context가 있으면 우선 사용
    if template.get("search_context"):
        return template["search_context"]
    
    # 없으면 기존 방식으로 생성
    parts = []
    
    if template.get("title"):
        parts.append(template["title"])
    
    if template.get("description"):
        parts.append(template["description"])
    
    if template.get("keywords"):
        parts.extend(template["keywords"])
    
    if template.get("examples"):
        parts.extend(template["examples"])
    
    return " ".join(filter(None, parts))


def load_templates(templates_path: Path = None) -> Dict[str, List[Dict]]:
    """템플릿 JSON 파일 로드"""
    if templates_path is None:
        # 프로젝트 루트 기준으로 경로 설정
        import os
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        templates_path = Path(project_root) / "templates" / "strategy_templates.json"
    
    if not templates_path.exists():
        raise FileNotFoundError(f"템플릿 파일을 찾을 수 없습니다: {templates_path}")
    
    with templates_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def index_templates(
    qdrant_client: QdrantClient,
    embed_model: SentenceTransformer,
    collection_name: str = "strategy_templates",
    templates_path: Path = None
) -> int:
    """
    템플릿을 Qdrant에 인덱싱
    
    [입력]
    - qdrant_client: Qdrant 클라이언트
    - embed_model: 임베딩 모델
    - collection_name: 컬렉션 이름
    - templates_path: 템플릿 파일 경로
    
    [출력]
    - 인덱싱된 템플릿 개수
    """
    # 컬렉션 생성 또는 확인
    try:
        collection_info = qdrant_client.get_collection(collection_name)
        print(f"[indexer] 컬렉션 '{collection_name}' 이미 존재 (벡터 크기: {collection_info.config.params.vectors.size})")
    except Exception:
        vector_size = embed_model.get_sentence_embedding_dimension()
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )
        print(f"[indexer] 컬렉션 '{collection_name}' 생성 완료 (벡터 크기: {vector_size})")
    
    # 템플릿 로드
    templates_data = load_templates(templates_path)
    
    points = []
    
    # 문제점(causes) 템플릿 인덱싱
    for template in templates_data.get("causes", []):
        text = create_template_text(template)
        vector = embed_model.encode([text], normalize_embeddings=True)[0].tolist()
        
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "type": "cause",
                "id": template["id"],
                "title": template["title"],
                "description": template.get("description", ""),
                "examples": template.get("examples", []),
                "category": template.get("category", ""),
                "keywords": template.get("keywords", []),
                "search_context": template.get("search_context", text),  # search_context 저장
                "text_for_embedding": text
            }
        )
        points.append(point)
    
    # 솔루션(solutions) 템플릿 인덱싱
    for template in templates_data.get("solutions", []):
        text = create_template_text(template)
        vector = embed_model.encode([text], normalize_embeddings=True)[0].tolist()
        
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "type": "solution",
                "id": template["id"],
                "title": template["title"],
                "description": template.get("description", ""),
                "examples": template.get("examples", []),
                "category": template.get("category", ""),
                "keywords": template.get("keywords", []),
                "search_context": template.get("search_context", text),
                "text_for_embedding": text
            }
        )
        points.append(point)
    
    # 인사이트(insights) 템플릿 인덱싱
    for template in templates_data.get("insights", []):
        text = create_template_text(template)
        vector = embed_model.encode([text], normalize_embeddings=True)[0].tolist()
        
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "type": "insight",
                "id": template["id"],
                "title": template["title"],
                "description": template.get("description", ""),
                "examples": template.get("examples", []),
                "category": template.get("category", ""),
                "keywords": template.get("keywords", []),
                "search_context": template.get("search_context", text),
                "text_for_embedding": text
            }
        )
        points.append(point)
    
    # 배치 업로드
    if points:
        qdrant_client.upsert(collection_name=collection_name, points=points)
        print(f"[indexer] {len(points)}개 템플릿 인덱싱 완료")
    
    return len(points)


if __name__ == "__main__":
    from qdrant_client import QdrantClient
    from sentence_transformers import SentenceTransformer
    
    qdrant_client = QdrantClient(url=settings.qdrant_url)
    embed_model = SentenceTransformer(settings.embed_model_name)
    
    count = index_templates(qdrant_client, embed_model)
    print(f"총 {count}개 템플릿 인덱싱 완료")


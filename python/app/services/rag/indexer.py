# app/batch/indexer.py
# ============================================================
# [기능] 브랜드별 원천 데이터 인덱싱
# - brand_{id}.jsonl 직접 로드 → 청킹 → 임베딩 → Qdrant 인덱싱
# ============================================================

import json
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

from app.config.settings import settings
from app.services.rag.chunker import clean_text, simple_chunk


def load_brand_jsonl(brand_id: int, base_path: Path = None) -> List[Dict[str, Any]]:
    """
    브랜드별 원천 JSONL 파일 로드
    
    [입력]
    - brand_id: 브랜드 ID
    - base_path: 기본 경로 (기본값: dummy_data/brands/)
    
    [출력]
    - 원천 데이터 리스트
    """
    if base_path is None:
        base_path = Path("dummy_data/brands")
    
    file_path = base_path / f"brand_{brand_id}.jsonl"
    
    if not file_path.exists():
        raise FileNotFoundError(f"원천 파일을 찾을 수 없습니다: {file_path.resolve()}")
    
    rows: List[Dict[str, Any]] = []
    with file_path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as e:
                raise ValueError(f"JSONL 파싱 오류 (line {idx}): {e}") from e
    
    print(f"[indexer] loaded {len(rows)} records from {file_path.name}")
    return rows


def make_point_id(
    brand_id: int,
    source_text_id: int,
    chunk_index: int,
    chunk_text: str,
) -> str:
    """Deterministic point ID 생성"""
    key = "|".join([
        str(brand_id),
        str(source_text_id),
        str(chunk_index),
        chunk_text.strip(),
    ])
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))


def ensure_collection(client: QdrantClient, collection_name: str, dim: int) -> None:
    """Qdrant 컬렉션 준비 (없으면 생성, dim 불일치 시 재생성)"""
    exists = True
    try:
        info = client.get_collection(collection_name)
    except Exception:
        exists = False
        info = None

    if not exists:
        print(f"[indexer] collection not found -> create '{collection_name}' (dim={dim})")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
        return

    current_dim = None
    try:
        current_dim = info.config.params.vectors.size  # type: ignore
    except Exception:
        current_dim = None

    if current_dim is not None and int(current_dim) != int(dim):
        print(f"[indexer] collection dim mismatch: current={current_dim}, expected={dim} -> recreate")
        client.delete_collection(collection_name)
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
    else:
        print(f"[indexer] collection ready '{collection_name}' (dim={current_dim or dim})")


def ingest_brand_jsonl_to_qdrant(
    brand_id: int,
    embed_model: SentenceTransformer,
    qdrant_client: QdrantClient,
    base_path: Path = None,
) -> Dict[str, Any]:
    """
    brand_{id}.jsonl 원천 파일을 직접 Qdrant에 인덱싱
    
    [입력]
    - brand_id: 브랜드 ID
    - embed_model: 임베딩 모델
    - qdrant_client: Qdrant 클라이언트
    - base_path: 원천 파일 경로 (기본값: dummy_data/brands/)
    
    [출력]
    - {"indexed": int, "errors": List[str]}
    """
    t0 = time.perf_counter()
    print(f"[indexer] start indexing brand_id={brand_id} from raw JSONL")
    
    # 원천 파일 로드
    raw_records = load_brand_jsonl(brand_id, base_path)
    
    if not raw_records:
        print(f"[indexer] no records to index")
        return {"indexed": 0, "errors": []}
    
    # 임베딩 차원 감지
    test_vec = embed_model.encode(["passage: 테스트"], normalize_embeddings=True)[0]
    dim = len(test_vec)
    
    # 컬렉션 준비
    ensure_collection(qdrant_client, settings.qdrant_collection, dim)
    
    points: List[PointStruct] = []
    errors: List[str] = []
    
    for row_idx, record in enumerate(raw_records, start=1):
        try:
            # 원문 텍스트 추출 및 정제
            raw_text = record.get("text", "")
            text = clean_text(raw_text)
            
            if not text:
                continue
            
            record_brand_id = record.get("brandId", brand_id)
            source_text_id = row_idx  # 파일 내 인덱스 사용
            
            # 청킹
            chunks = simple_chunk(text)
            if not chunks:
                continue
            
            # 임베딩
            vecs = embed_model.encode(
                [f"passage: {c}" for c in chunks],
                normalize_embeddings=True,
            )
            
            # Point 생성
            for ci, (chunk_text, vec) in enumerate(zip(chunks, vecs)):
                payload = {
                    "brandId": record_brand_id,
                    "sourceTextId": source_text_id,
                    "chunkIndex": ci,
                    "chunkText": chunk_text,
                    "source": record.get("source", "unknown"),
                    "url": record.get("url"),
                    "title": record.get("title"),
                    "publishedAt": record.get("publishedAt"),
                }
                
                pid = make_point_id(record_brand_id, source_text_id, ci, chunk_text)
                
                points.append(
                    PointStruct(
                        id=pid,
                        vector=vec.tolist(),
                        payload=payload,
                    )
                )
        except Exception as e:
            errors.append(f"Error processing record {row_idx}: {str(e)}")
    
    # Qdrant upsert
    if points:
        qdrant_client.upsert(
            collection_name=settings.qdrant_collection,
            points=points,
            wait=True,
        )
        print(f"[indexer] upserted {len(points)} points")
    
    elapsed = time.perf_counter() - t0
    print(f"[indexer] end elapsed_sec={elapsed:.3f} indexed={len(points)} errors={len(errors)}")
    
    return {
        "indexed": len(points),
        "errors": errors,
    }


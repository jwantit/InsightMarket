# app/batch/indexer.py
# ============================================================
# [기능] 브랜드별 원천 데이터 인덱싱
# - brand_{id}.jsonl 로드 → 전처리 → infer_source_{id}.jsonl 생성
# - infer_source 파일 → 청킹 → 임베딩 → Qdrant 인덱싱
# ============================================================

import json
import hashlib
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

from app.config.settings import settings
from app.rag.chunker import clean_text, simple_chunk


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


def preprocess_records(
    raw_records: List[Dict[str, Any]], 
    brand_id: int
) -> List[Dict[str, Any]]:
    """
    원천 데이터를 analytics_infer_source_text 형식으로 전처리
    
    [입력]
    - raw_records: 원천 JSONL 데이터
    - brand_id: 브랜드 ID
    
    [출력]
    - 전처리된 레코드 리스트 (analytics_infer_source_text 형식)
    """
    processed: List[Dict[str, Any]] = []
    collected_at = datetime.now().isoformat()
    
    for idx, record in enumerate(raw_records, start=1):
        # 원문 텍스트 추출 및 정제
        raw_text = record.get("text", "")
        infer_text = clean_text(raw_text)
        
        if not infer_text:
            continue
        
        # raw_hash 계산 (중복 방지용)
        raw_hash = hashlib.sha256(infer_text.encode("utf-8")).hexdigest()
        
        # 날짜 파싱 (publishedAt)
        published_at = record.get("publishedAt")
        if published_at:
            # "2025-01-10" 형식을 ISO 형식으로 변환
            try:
                if isinstance(published_at, str) and len(published_at) == 10:
                    published_at = f"{published_at}T00:00:00"
            except Exception:
                published_at = None
        
        # 전처리된 레코드 생성
        processed_record = {
            "brand_id": brand_id,
            "project_id": None,  # 나중에 Spring에서 주입
            "source": record.get("source", "unknown"),
            "url": record.get("url"),
            "raw_hash": raw_hash,
            "published_at": published_at,
            "collected_at": collected_at,
            "infer_text": infer_text,
            # 메타데이터 (나중에 사용 가능)
            "_row_index": idx,
            "_title": record.get("title"),
            "_brand_name": record.get("brandName"),
        }
        
        processed.append(processed_record)
    
    print(f"[indexer] preprocessed {len(processed)} records (from {len(raw_records)} raw records)")
    return processed


def write_infer_source_file(
    brand_id: int,
    records: List[Dict[str, Any]],
    output_dir: Path = None
) -> Path:
    """
    전처리된 레코드를 infer_source JSONL 파일로 저장
    
    [입력]
    - brand_id: 브랜드 ID
    - records: 전처리된 레코드 리스트
    - output_dir: 출력 디렉토리 (기본값: dummy_data/infer_source/)
    
    [출력]
    - 저장된 파일 경로
    """
    if output_dir is None:
        output_dir = Path("dummy_data/infer_source")
    
    # 디렉토리 생성
    output_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = output_dir / f"infer_source_{brand_id}.jsonl"
    
    with file_path.open("w", encoding="utf-8") as f:
        for record in records:
            # 메타데이터 제거 (순수 analytics_infer_source_text 형식만 저장)
            clean_record = {
                "brand_id": record["brand_id"],
                "project_id": record["project_id"],
                "source": record["source"],
                "url": record.get("url"),
                "raw_hash": record["raw_hash"],
                "published_at": record.get("published_at"),
                "collected_at": record["collected_at"],
                "infer_text": record["infer_text"],
            }
            f.write(json.dumps(clean_record, ensure_ascii=False) + "\n")
    
    print(f"[indexer] wrote {len(records)} records to {file_path.name}")
    return file_path


def load_infer_source_jsonl(brand_id: int, base_path: Path = None) -> List[Dict[str, Any]]:
    """
    infer_source JSONL 파일 로드
    
    [입력]
    - brand_id: 브랜드 ID
    - base_path: 기본 경로 (기본값: dummy_data/infer_source/)
    
    [출력]
    - infer_source 레코드 리스트
    """
    if base_path is None:
        base_path = Path("dummy_data/infer_source")
    
    file_path = base_path / f"infer_source_{brand_id}.jsonl"
    
    if not file_path.exists():
        raise FileNotFoundError(f"infer_source 파일을 찾을 수 없습니다: {file_path.resolve()}")
    
    records: List[Dict[str, Any]] = []
    with file_path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as e:
                raise ValueError(f"JSONL 파싱 오류 (line {idx}): {e}") from e
    
    print(f"[indexer] loaded {len(records)} records from {file_path.name}")
    return records


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


def ingest_infer_source_to_qdrant(
    brand_id: int,
    embed_model: SentenceTransformer,
    qdrant_client: QdrantClient,
    base_path: Path = None,
) -> Dict[str, Any]:
    """
    infer_source JSONL 파일을 Qdrant에 인덱싱
    
    [입력]
    - brand_id: 브랜드 ID
    - embed_model: 임베딩 모델
    - qdrant_client: Qdrant 클라이언트
    - base_path: infer_source 파일 경로 (기본값: dummy_data/infer_source/)
    
    [출력]
    - {"indexed": int, "errors": List[str]}
    """
    t0 = time.perf_counter()
    print(f"[indexer] start indexing brand_id={brand_id}")
    
    # infer_source 파일 로드
    records = load_infer_source_jsonl(brand_id, base_path)
    
    if not records:
        print(f"[indexer] no records to index")
        return {"indexed": 0, "errors": []}
    
    # 임베딩 차원 감지
    test_vec = embed_model.encode(["passage: 테스트"], normalize_embeddings=True)[0]
    dim = len(test_vec)
    
    # 컬렉션 준비
    ensure_collection(qdrant_client, settings.qdrant_collection, dim)
    
    points: List[PointStruct] = []
    errors: List[str] = []
    
    for record in records:
        try:
            infer_text = record.get("infer_text", "")
            if not infer_text:
                continue
            
            record_brand_id = record.get("brand_id")
            # source_text_id는 파일 내 인덱스로 임시 사용 (실제로는 DB의 infer_source_text_id)
            source_text_id = record.get("_row_index", len(points))
            
            # 청킹
            chunks = simple_chunk(infer_text)
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
                    "source": record.get("source"),
                    "url": record.get("url"),
                    "title": record.get("_title"),
                    "publishedAt": record.get("published_at"),
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
            errors.append(f"Error processing record: {str(e)}")
    
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


def process_brand_data(brand_id: int) -> Path:
    """
    브랜드 데이터 전체 처리 파이프라인
    - brand_{id}.jsonl 로드 → 전처리 → infer_source_{id}.jsonl 생성
    
    [입력]
    - brand_id: 브랜드 ID
    
    [출력]
    - 생성된 infer_source 파일 경로
    """
    print(f"[indexer] processing brand_id={brand_id}")
    
    # 1) 원천 파일 로드
    raw_records = load_brand_jsonl(brand_id)
    
    # 2) 전처리
    processed_records = preprocess_records(raw_records, brand_id)
    
    # 3) infer_source 파일 저장
    output_path = write_infer_source_file(brand_id, processed_records)
    
    print(f"[indexer] brand_id={brand_id} processing complete: {output_path}")
    return output_path


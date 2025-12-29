# ============================================================
# [기능] 더미 JSONL → (간단 청킹) → KoE5 임베딩 → Qdrant upsert(인덱싱)
# [핵심 안정장치]
#   1) 임베딩 dim 자동 감지
#   2) Qdrant 컬렉션 자동 생성
#   3) 컬렉션 dim 불일치 시 자동 재생성
# [로그] 경로/첫 row/dim/업서트 수/컬렉션 상태 출력
# ============================================================
import hashlib
import json
import re
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.utils.timer import timer

# ---------------------------
# [설정]
# ---------------------------
QDRANT_URL = "http://localhost:6333"
COLLECTION = "im_chunks"
DUMMY_PATH = Path("dummy_data/brands/brand_1.jsonl")

EMBED_MODEL_NAME = "nlpai-lab/KoE5"

CHUNK_MAX_CHARS = 450
CHUNK_OVERLAP = 50


# ---------------------------
# [로그]
# ---------------------------
def log(msg: str) -> None:
    now = time.strftime("%H:%M:%S")
    print(f"[{now}][ingest] {msg}")


# ---------------------------
# [텍스트 정제]
# ---------------------------
def clean_text(text: str) -> str:
    if not text:
        return ""
    t = text.strip()
    t = re.sub(r"\s+", " ", t).strip()
    return t


# ---------------------------
# [청킹] 문자 기반(초기 MVP용)
# ---------------------------
def simple_chunk(text: str, max_chars: int = CHUNK_MAX_CHARS, overlap: int = CHUNK_OVERLAP) -> List[str]:
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


# ---------------------------
# [로더] JSONL (한 줄 = JSON 1개)
# ---------------------------
def load_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"not found: {path.resolve()}")

    rows: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as e:
                raise ValueError(f"JSONL parse error at line {idx}: {e}") from e
    return rows


# ---------------------------
# [Qdrant] 컬렉션 준비(자동 생성/재생성)
# ---------------------------
def ensure_collection(client: QdrantClient, collection_name: str, dim: int) -> None:
    # 컬렉션 존재 여부 확인
    exists = True
    try:
        info = client.get_collection(collection_name)
    except Exception:
        exists = False
        info = None

    # 없으면 생성
    if not exists:
        log(f"collection not found -> create '{collection_name}' (dim={dim}, cosine)")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
        return

    # 있으면 dim 확인 → 다르면 재생성
    current_dim = None
    try:
        # qdrant-client 버전에 따라 구조가 다를 수 있어 방어적으로 접근
        current_dim = info.config.params.vectors.size  # type: ignore
    except Exception:
        current_dim = None

    if current_dim is not None and int(current_dim) != int(dim):
        log(f"collection dim mismatch: current={current_dim}, expected={dim} -> recreate")
        client.delete_collection(collection_name)
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
    else:
        log(f"collection ready '{collection_name}' (dim={current_dim or dim})")

# ---------------------------
# [ID] deterministic point id
# - 같은 데이터는 항상 같은 id
# - 재인덱싱 시 중복 누적 방지
# ---------------------------
def make_point_id(base_payload: dict, row_idx: int, chunk_index: int, chunk_text: str) -> str:
    key = "|".join([
        str(base_payload.get("brandId") or ""),
        str(base_payload.get("source") or ""),
        str(base_payload.get("publishedAt") or ""),
        str(base_payload.get("url") or ""),
        str(base_payload.get("title") or ""),
        str(row_idx),
        str(chunk_index),
        chunk_text.strip(),
    ])
    # deterministic UUID (Qdrant에서 허용)
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))


def main() -> None:
    # [기능] 인덱싱 실행 엔트리포인트
    # - 더미 JSONL 로드 → 청킹 → KoE5 임베딩 → Qdrant upsert
    # [로그] run/step 단위 시작/끝/소요시간(elapsed_sec) 출력

    run_t0 = time.perf_counter()
    log("run start")

    # 1) Qdrant 연결
    # [왜?] 벡터/페이로드를 저장할 검색 DB(Qdrant)에 접속
    with timer("qdrant_connect", log):
        client = QdrantClient(url=QDRANT_URL)
    log(f"Qdrant URL={QDRANT_URL}")

    # 2) 임베딩 모델 로드
    # [왜?] 텍스트를 '의미 벡터'로 바꿔서 의미검색이 가능해짐
    with timer("load_embed_model", log):
        log(f"loading embed model: {EMBED_MODEL_NAME}")
        embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    log("embed model loaded")

    # 3) 임베딩 차원(dim) 자동 감지
    # [왜?] Qdrant 컬렉션 vectors.size와 임베딩 dim이 다르면 업서트가 실패함
    with timer("detect_embedding_dim", log):
        test_vec = embed_model.encode(["passage: 테스트"], normalize_embeddings=True)[0]
        dim = len(test_vec)
    log(f"embedding dim={dim}")

    # 4) 컬렉션 준비(없으면 생성 / dim 다르면 재생성)
    # [왜?] 컬렉션이 없으면 404, dim이 다르면 dimension mismatch로 터짐
    with timer("ensure_collection", log):
        ensure_collection(client, COLLECTION, dim)

    # 5) JSONL 로드
    # [왜?] 더미 데이터(근거 텍스트)를 읽어서 인덱싱 재료로 사용
    log(f"DUMMY_PATH absolute = {DUMMY_PATH.resolve()}")
    with timer("load_jsonl", log):
        rows = load_jsonl(DUMMY_PATH)

    if not rows:
        log("no rows. exit.")
        total_sec = time.perf_counter() - run_t0
        log(f"run end total_sec={total_sec:.3f}")
        return

    log(f"first row brandName={rows[0].get('brandName')} title={rows[0].get('title')}")
    log(f"loaded rows={len(rows)} from {DUMMY_PATH}")

    # 6) rows → chunks → points 준비(청킹 + 임베딩)
    # [왜?] Qdrant에 넣는 최소 단위는 Point(vector + payload)
    with timer("build_points(chunk+embed)", log):
        points: List[PointStruct] = []
        total_chunks = 0

        for row_idx, r in enumerate(rows):
            text = r.get("text", "")
            chunks = simple_chunk(text)
            if not chunks:
                continue

            total_chunks += len(chunks)

            # payload 기본 필드(필터/출처 표시용)
            base_payload = {
                "brandId": r.get("brandId"),
                "brandName": r.get("brandName"),
                "source": r.get("source"),
                "publishedAt": r.get("publishedAt"),
                "url": r.get("url"),
                "title": r.get("title"),
            }

            # chunk를 한 번에 배치 임베딩(속도/일관성)
            vecs = embed_model.encode(
                [f"passage: {c}" for c in chunks],
                normalize_embeddings=True
            )

            # chunk별로 point 생성
            for ci, (chunk_text, vec) in enumerate(zip(chunks, vecs)):
                payload = dict(base_payload)
                payload.update({
                    "chunkIndex": ci,
                    "chunkText": chunk_text,
                })

                pid = make_point_id(base_payload, row_idx, ci, chunk_text)

                points.append(
                    PointStruct(
                        id=pid,
                        vector=vec.tolist(),
                        payload=payload,
                    )
                )

    log(f"prepared points={len(points)} total_chunks={total_chunks}")

    if not points:
        log("no points to upsert. exit.")
        total_sec = time.perf_counter() - run_t0
        log(f"run end total_sec={total_sec:.3f}")
        return

    # 7) upsert(Qdrant 저장)
    # [왜?] 인덱싱 완료 = Qdrant에 vector+payload가 저장되어 검색 가능 상태가 됨
    with timer("qdrant_upsert", log):
        client.upsert(collection_name=COLLECTION, points=points, wait=True)
    log("upsert done")

    # 8) 컬렉션 상태 확인
    # [왜?] points_count 증가/green 상태로 정상 적재 확인
    with timer("qdrant_get_collection", log):
        info = client.get_collection(COLLECTION)
    log(f"collection status={info.status} points_count={info.points_count}")

    total_sec = time.perf_counter() - run_t0
    log(f"run end total_sec={total_sec:.3f}")


if __name__ == "__main__":
    main()

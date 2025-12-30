# ============================================================
# [기능] 더미 JSONL → (간단 청킹) → KoE5 임베딩 → Qdrant upsert(인덱싱)
# [핵심 안정장치]
#   1) 임베딩 dim 자동 감지
#   2) Qdrant 컬렉션 자동 생성
#   3) 컬렉션 dim 불일치 시 자동 재생성
# [로그] 경로/첫 row/dim/업서트 수/컬렉션 상태 출력
# ============================================================
import json
import re
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

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
# [간단 타이머] 외부 모듈 없이 elapsed 로그
# ---------------------------
def t_start() -> float:
    return time.perf_counter()


def t_end(label: str, t0: float) -> None:
    elapsed = time.perf_counter() - t0
    log(f"{label} end elapsed_sec={elapsed:.3f}")


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
def simple_chunk(
    text: str,
    max_chars: int = CHUNK_MAX_CHARS,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
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
    key = "|".join(
        [
            str(base_payload.get("brandId") or ""),
            str(base_payload.get("source") or ""),
            str(base_payload.get("publishedAt") or ""),
            str(base_payload.get("url") or ""),
            str(base_payload.get("title") or ""),
            str(row_idx),
            str(chunk_index),
            chunk_text.strip(),
        ]
    )
    # deterministic UUID (Qdrant에서 허용)
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))


def main() -> None:
    # [기능] 인덱싱 실행 엔트리포인트
    # - 더미 JSONL 로드 → 청킹 → KoE5 임베딩 → Qdrant upsert
    # [로그] run/step 단위 시작/끝/소요시간(elapsed_sec) 출력

    run_t0 = time.perf_counter()
    log("run start")

    # 1) Qdrant 연결
    t0 = t_start()
    client = QdrantClient(url=QDRANT_URL)
    t_end("qdrant_connect", t0)
    log(f"Qdrant URL={QDRANT_URL}")

    # 2) 임베딩 모델 로드
    t0 = t_start()
    log(f"loading embed model: {EMBED_MODEL_NAME}")
    embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    t_end("load_embed_model", t0)
    log("embed model loaded")

    # 3) 임베딩 차원(dim) 자동 감지
    t0 = t_start()
    test_vec = embed_model.encode(["passage: 테스트"], normalize_embeddings=True)[0]
    dim = len(test_vec)
    t_end("detect_embedding_dim", t0)
    log(f"embedding dim={dim}")

    # 4) 컬렉션 준비(없으면 생성 / dim 다르면 재생성)
    t0 = t_start()
    ensure_collection(client, COLLECTION, dim)
    t_end("ensure_collection", t0)

    # 5) JSONL 로드
    log(f"DUMMY_PATH absolute = {DUMMY_PATH.resolve()}")
    t0 = t_start()
    rows = load_jsonl(DUMMY_PATH)
    t_end("load_jsonl", t0)

    if not rows:
        log("no rows. exit.")
        total_sec = time.perf_counter() - run_t0
        log(f"run end total_sec={total_sec:.3f}")
        return

    log(f"first row brandName={rows[0].get('brandName')} title={rows[0].get('title')}")
    log(f"loaded rows={len(rows)} from {DUMMY_PATH}")

    # 6) rows → chunks → points 준비(청킹 + 임베딩)
    t0 = t_start()
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
            normalize_embeddings=True,
        )

        # chunk별로 point 생성
        for ci, (chunk_text, vec) in enumerate(zip(chunks, vecs)):
            payload = dict(base_payload)
            payload.update(
                {
                    "chunkIndex": ci,
                    "chunkText": chunk_text,
                }
            )

            pid = make_point_id(base_payload, row_idx, ci, chunk_text)

            points.append(
                PointStruct(
                    id=pid,
                    vector=vec.tolist(),
                    payload=payload,
                )
            )

    t_end("build_points(chunk+embed)", t0)

    log(f"prepared points={len(points)} total_chunks={total_chunks}")

    if not points:
        log("no points to upsert. exit.")
        total_sec = time.perf_counter() - run_t0
        log(f"run end total_sec={total_sec:.3f}")
        return

    # 7) upsert(Qdrant 저장)
    t0 = t_start()
    client.upsert(collection_name=COLLECTION, points=points, wait=True)
    t_end("qdrant_upsert", t0)
    log("upsert done")

    # 8) 컬렉션 상태 확인
    t0 = t_start()
    info = client.get_collection(COLLECTION)
    t_end("qdrant_get_collection", t0)
    log(f"collection status={info.status} points_count={info.points_count}")

    total_sec = time.perf_counter() - run_t0
    log(f"run end total_sec={total_sec:.3f}")


if __name__ == "__main__":
    main()

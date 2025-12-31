# scripts/ingest_brand_data.py
# ============================================================
# [기능] 브랜드별 원천 데이터 전처리 스크립트
# - brand_{id}.jsonl 로드 → 전처리 → infer_source_{id}.jsonl 생성
# ============================================================

import argparse
import sys
from pathlib import Path

# app 모듈 import를 위해 경로 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.batch.indexer import process_brand_data


def main():
    parser = argparse.ArgumentParser(description="브랜드별 원천 데이터 전처리")
    parser.add_argument(
        "--brand-id",
        type=int,
        required=True,
        help="브랜드 ID (예: 1, 2, 3)",
    )
    
    args = parser.parse_args()
    
    try:
        output_path = process_brand_data(args.brand_id)
        print(f"\n✅ 성공: {output_path}")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 오류: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()


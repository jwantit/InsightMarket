#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
테스트용 raw_data 설정 스크립트
- raw_data_test_strategy.json을 당일 파일로 복사
"""

import json
import shutil
from datetime import datetime
from pathlib import Path

# 경로 설정
RAW_DATA_DIR = Path("raw_data")
TEST_FILE = RAW_DATA_DIR / "raw_data_test_strategy.json"

def setup_test_data():
    """테스트용 raw_data를 당일 파일로 복사"""
    
    if not TEST_FILE.exists():
        print(f"❌ 테스트 파일을 찾을 수 없습니다: {TEST_FILE}")
        return False
    
    # 당일 파일명 생성
    today = datetime.now()
    date_str = today.strftime("%Y%m%d")
    time_str = today.strftime("%H%M")
    today_file = RAW_DATA_DIR / f"raw_data_{date_str}_{time_str}.json"
    
    # 기존 당일 파일 삭제 (있으면)
    for existing_file in RAW_DATA_DIR.glob(f"raw_data_{date_str}_*.json"):
        if existing_file != today_file:
            existing_file.unlink()
            print(f"🗑️  기존 파일 삭제: {existing_file.name}")
    
    # 테스트 파일 복사
    shutil.copy2(TEST_FILE, today_file)
    print(f"✅ 테스트 데이터 설정 완료: {today_file.name}")
    print(f"\n📋 테스트 데이터 정보:")
    print(f"   - brandId: 1")
    print(f"   - projectId: 1")
    print(f"   - projectKeywordIds: 101, 102, 103")
    print(f"   - 키워드:")
    print(f"     * 나이키 에어맥스 (배송/가격 문제)")
    print(f"     * 아디다스 울트라부스트 (가격/서비스 문제)")
    print(f"     * 퓨마 슈퍼리거 (품질 문제)")
    print(f"\n💡 사용 방법:")
    print(f"   - Frontend에서 brandId=1, projectId=1로 테스트")
    print(f"   - 질문 예시: '배송 문제가 많은데 해결책을 제안해줘'")
    
    return True

if __name__ == "__main__":
    setup_test_data()


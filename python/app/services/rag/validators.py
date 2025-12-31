# app/rag/validators.py
# ============================================================
# [기능] JSON 스키마 검증 및 보정
# - LLM이 생성한 JSON의 필수 필드 검증
# - 누락된 필드에 기본값 제공
# - 타입 불일치 시 보정
# ============================================================

from typing import Any, Dict, List


def validate_and_fix_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    LLM 응답의 data 필드를 검증하고 보정
    
    [입력] data: LLM이 생성한 JSON 객체
    [출력] 검증/보정된 data 객체
    """
    if not isinstance(data, dict):
        return _get_default_data()
    
    # 필수 필드 목록
    required_fields = ["insights", "problems", "actions", "solutions"]
    
    # 각 필드 검증 및 보정
    fixed_data: Dict[str, Any] = {}
    
    for field in required_fields:
        value = data.get(field)
        
        # 리스트가 아니거나 없으면 기본값
        if not isinstance(value, list):
            fixed_data[field] = []
        else:
            # 리스트 내부 항목이 문자열이 아니면 문자열로 변환
            fixed_data[field] = [
                str(item) if not isinstance(item, str) else item
                for item in value
            ]
    
    # sources는 LLM이 생성한 것을 그대로 사용 (pipeline에서 이미 주입됨)
    if "sources" in data and isinstance(data["sources"], list):
        fixed_data["sources"] = data["sources"]
    else:
        fixed_data["sources"] = []
    
    return fixed_data


def _get_default_data() -> Dict[str, Any]:
    """기본값 반환 (파싱 실패 시)"""
    return {
        "insights": [],
        "problems": [],
        "actions": [],
        "solutions": [],
        "sources": [],
    }


# app/services/strategy/template_formatter.py
# ============================================================
# [기능] 템플릿 포맷팅 유틸리티 (재사용 가능한 함수들)
# - 템플릿을 프론트엔드 형식으로 변환
# - 템플릿 텍스트 포맷팅
# ============================================================

from typing import Dict, List, Any

# 상수 정의
SIMILARITY_THRESHOLD = 0.2  # 유사도 임계값
MAX_ITEMS_PER_CATEGORY = 5  # 카테고리별 최대 아이템 수


def format_template_text(template: Dict[str, Any]) -> str:
    """
    템플릿을 텍스트 형식으로 포맷팅
    
    [입력]
    - template: 템플릿 딕셔너리 (title, description 필드 포함)
    
    [출력]
    - 포맷팅된 텍스트 문자열: "title: description"
    """
    title = template.get("title", "")
    description = template.get("description", "")
    return f"{title}: {description}"


def convert_templates_to_frontend_format(
    matched_templates: List[Dict[str, Any]],
    similarity_threshold: float = SIMILARITY_THRESHOLD,
    max_items: int = MAX_ITEMS_PER_CATEGORY
) -> Dict[str, List[str]]:
    """
    매칭된 템플릿을 프론트엔드 형식으로 변환
    
    [입력]
    - matched_templates: 매칭된 템플릿 리스트
    - similarity_threshold: 유사도 임계값 (기본값 0.2)
    - max_items: 카테고리별 최대 아이템 수 (기본값 5)
    
    [출력]
    - 프론트엔드 형식 딕셔너리:
      {
        "insights": [...],
        "problems": [...],
        "solutions": [...]
      }
    """
    insights = []
    problems = []
    solutions = []
    
    for matched in matched_templates:
        template = matched.get("template", {})
        category = matched.get("category", "")
        similarity = matched.get("similarity", 0.0)
        
        # 유사도가 높은 템플릿만 포함
        if similarity < similarity_threshold:
            continue
        
        formatted_text = format_template_text(template)
        
        # 카테고리별로 분류
        if category == "insights":
            insights.append(formatted_text)
        elif category == "causes":
            problems.append(formatted_text)
        elif category == "solutions":
            solutions.append(formatted_text)
    
    # 최대 개수 제한
    return {
        "insights": insights[:max_items] if len(insights) > max_items else insights,
        "problems": problems[:max_items] if len(problems) > max_items else problems,
        "solutions": solutions[:max_items] if len(solutions) > max_items else solutions
    }


def ensure_minimum_templates(
    frontend_data: Dict[str, List[str]],
    templates: Dict[str, Any]
) -> Dict[str, List[str]]:
    """
    각 카테고리별로 최소 1개씩 포함되도록 보장
    
    [입력]
    - frontend_data: 프론트엔드 형식 데이터
    - templates: 전체 템플릿 딕셔너리
    
    [출력]
    - 보완된 프론트엔드 형식 데이터
    """
    # insights 보장
    if not frontend_data.get("insights"):
        all_insights = templates.get("insights", [])
        if all_insights:
            first_insight = all_insights[0]
            frontend_data["insights"] = [format_template_text(first_insight)]
    
    # problems 보장 (causes에서 가져옴)
    if not frontend_data.get("problems"):
        all_causes = templates.get("causes", [])
        if all_causes:
            first_cause = all_causes[0]
            frontend_data["problems"] = [format_template_text(first_cause)]
    
    # solutions 보장
    if not frontend_data.get("solutions"):
        all_solutions = templates.get("solutions", [])
        if all_solutions:
            first_solution = all_solutions[0]
            frontend_data["solutions"] = [format_template_text(first_solution)]
    
    return frontend_data


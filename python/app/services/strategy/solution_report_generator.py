# app/services/strategy/solution_report_generator.py
# ============================================================
# [역할] 솔루션별 상세 리포트 생성 (비즈니스 로직 레이어)
# - 특정 솔루션에 대한 상세 리포트 생성
# - 템플릿: 개요/본론/결론 형식의 마크다운 리포트
# - OpenAI 사용 (rag/generator.py의 generate_with_openai 호출)
# 
# [사용처]
# - api/routes/rag.py: /generate-solution-report 엔드포인트에서 호출
# ============================================================

import json
from typing import Dict, List, Any, Optional

from app.services.rag.generator import generate_with_openai
from app.config.settings import settings


def build_solution_report_prompt(
    brand_name: str,
    project_name: str,
    question: str,
    solution_title: str,
    solution_description: str,
    related_problems: List[str],
    related_insights: List[str],
    keyword_stats_summary: str,
    report_type: str = "marketing"  # "marketing" or "improvement"
) -> str:
    """
    솔루션별 리포트 생성을 위한 프롬프트 구성
    
    [입력]
    - brand_name: 브랜드명
    - project_name: 프로젝트명
    - question: 사용자 질문
    - solution_title: 솔루션 제목
    - solution_description: 솔루션 설명
    - related_problems: 관련 문제점 리스트
    - related_insights: 관련 인사이트 리스트
    - keyword_stats_summary: 키워드 통계 요약
    - report_type: 리포트 타입 ("marketing" or "improvement")
    
    [출력]
    - LLM 프롬프트 문자열 (마크다운 형식)
    """
    
    # 솔루션 제목에 맞는 리포트 생성 (개요/본론/결론 형식)
    prompt = f"""당신은 브랜드 전략 분석 전문가입니다. 아래 정보를 바탕으로 {brand_name}의 '{solution_title}' 솔루션에 대한 상세 분석 보고서를 작성해주세요.

[분석 대상]
- 브랜드: {brand_name}
- 프로젝트: {project_name}
- 사용자 질문: {question}

[키워드 분석 요약]
{keyword_stats_summary}

[제안된 솔루션]
- 제목: {solution_title}
- 설명: {solution_description}

[관련 문제점]
{json.dumps(related_problems, ensure_ascii=False, indent=2)}

[관련 인사이트]
{json.dumps(related_insights, ensure_ascii=False, indent=2)}

[요청사항]
위 정보를 바탕으로 '{solution_title}' 솔루션에 맞는 내용으로 다음 형식의 마크다운 리포트를 작성해주세요:

# {brand_name} {solution_title} 분석 보고서

## 개요
본 보고서는 {brand_name}의 '{solution_title}' 솔루션을 중심으로 작성되었다. {brand_name}는 시장에서 큰 인기를 얻고 있으며, '{solution_title}' 솔루션을 통해 브랜드의 이미지를 강화하고 매출을 증대시킬 수 있는 기회를 가지고 있다. 이를 위해 본 보고서에서는 '{solution_title}' 솔루션의 효과적인 실행 방안과 전략을 제시할 것이다.

## 본론

(5개 이상의 구체적인 내용을 제시하세요. '{solution_title}' 솔루션과 관련된 실행 방안, 전략, 사례 등을 포함하세요. 각 항목은 번호와 **굵은 제목**으로 시작하고, 아래에 상세 설명을 추가하세요.)

### 1. [실행 방안 제목 1]
[실행 방안에 대한 상세 설명. '{solution_title}' 솔루션과의 연관성을 명확히 하세요.]

### 2. [실행 방안 제목 2]
[실행 방안에 대한 상세 설명. 구체적인 실행 단계와 예상 효과를 포함하세요.]

### 3. [전략 제목 3]
[전략에 대한 상세 설명. '{solution_title}' 솔루션을 효과적으로 활용하는 방법을 제시하세요.]

(2개 이상 더 추가)

## 결론
{solution_title} 솔루션을 중심으로 한 {brand_name}의 전략은 브랜드의 이미지 강화 및 매출 증대에 기여할 수 있는 효과적인 방법이다. 고객의 마음을 사로잡고 즐거운 경험을 제공하기 위해, 다양한 접근법을 지속적으로 시도해야 한다. 본 보고서에서 제시한 실행 방안과 전략은 {brand_name}가 고객과의 관계를 더욱 깊이 있게 유지하고 발전시키기 위한 기초 자료로 활용될 수 있을 것이다.

중요:
- 마크다운 형식으로 작성하세요
- 각 항목은 구체적이고 실행 가능하게 작성하세요
- 데이터 기반으로 작성하되, 전문가 관점에서 인사이트를 추가하세요
- '{solution_title}' 솔루션과 직접적으로 연관된 내용으로 작성하세요
"""
    
    return prompt.strip()


def generate_solution_report(
    brand_name: str,
    project_name: str,
    question: str,
    solution_title: str,
    solution_description: str,
    related_problems: List[str],
    related_insights: List[str],
    keyword_stats_summary: str,
    report_type: str = "marketing",
    openai_api_key: str = None,
    openai_model: str = None,
    timeout_sec: int = 300,
    trace: str = "-"
) -> Dict[str, Any]:
    """
    솔루션별 리포트 생성 (LLM 사용 - OpenAI)
    
    [입력]
    - brand_name: 브랜드명
    - project_name: 프로젝트명
    - question: 사용자 질문
    - solution_title: 솔루션 제목
    - solution_description: 솔루션 설명
    - related_problems: 관련 문제점 리스트
    - related_insights: 관련 인사이트 리스트
    - keyword_stats_summary: 키워드 통계 요약
    - report_type: 리포트 타입 ("marketing" or "improvement")
    - openai_api_key: OpenAI API 키
    - openai_model: OpenAI 모델명
    - timeout_sec: 타임아웃 (초)
    - trace: 추적 ID
    
    [출력]
    - 리포트 딕셔너리: {"content": "마크다운 리포트 내용", "title": "리포트 제목"}
    """
    openai_api_key = openai_api_key or settings.openai_api_key
    openai_model = openai_model or settings.openai_model
    
    if not openai_api_key:
        raise ValueError("OpenAI API 키가 설정되지 않았습니다.")
    
    # 프롬프트 생성
    prompt = build_solution_report_prompt(
        brand_name=brand_name,
        project_name=project_name,
        question=question,
        solution_title=solution_title,
        solution_description=solution_description,
        related_problems=related_problems,
        related_insights=related_insights,
        keyword_stats_summary=keyword_stats_summary,
        report_type=report_type
    )
    
    # LLM 호출
    try:
        response = generate_with_openai(
            api_key=openai_api_key,
            model=openai_model,
            prompt=prompt,
            timeout_sec=timeout_sec,
            trace=trace
        )
        
        # 마크다운 리포트 반환
        return {
            "content": response.strip(),
            "title": f"{brand_name} {solution_title} 리포트",
            "solutionTitle": solution_title,
            "reportType": report_type
        }
    except Exception as e:
        print(f"[solution_report_generator] 리포트 생성 실패: {e}")
        import traceback
        traceback.print_exc()
        # 기본 리포트 반환
        return {
            "content": f"# {brand_name} {solution_title} 리포트\n\n리포트 생성 중 오류가 발생했습니다.\n\n## 개요\n{solution_description}\n\n## 관련 문제점\n" + "\n".join([f"- {p}" for p in related_problems]),
            "title": f"{brand_name} {solution_title} 리포트",
            "solutionTitle": solution_title,
            "reportType": report_type
        }


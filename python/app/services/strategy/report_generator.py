# app/services/strategy/report_generator.py
# ============================================================
# [역할] 전략 분석 리포트 생성 (비즈니스 로직 레이어)
# - 템플릿 매칭 결과를 LLM으로 리포트 형식으로 변환
# - 전략 추천 시 전체 분석 결과 요약본 생성
# - Ollama 사용 (rag/generator.py의 generate_with_ollama 호출)
# 
# [사용처]
# - pipeline/strategy_pipeline.py: 전략 분석 파이프라인에서 호출
# ============================================================

import json
from typing import Dict, List, Any, Optional

from app.services.rag.generator import generate_with_ollama
from app.config.settings import settings


def build_report_prompt(
    brand_name: str,
    project_name: str,
    question: str,
    problems: List[str],
    solutions: List[str],
    insights: List[str],
    keyword_stats_summary: str
) -> str:
    """
    리포트 생성을 위한 프롬프트 구성
    
    [입력]
    - brand_name: 브랜드명
    - project_name: 프로젝트명
    - question: 사용자 질문
    - problems: 문제점 리스트
    - solutions: 솔루션 리스트
    - insights: 인사이트 리스트
    - keyword_stats_summary: 키워드 통계 요약
    
    [출력]
    - LLM 프롬프트 문자열
    """
    prompt = f"""
당신은 브랜드 전략 분석 전문가입니다. 아래 분석 결과를 바탕으로 전문적이고 실행 가능한 전략 리포트를 작성해주세요.

[분석 대상]
- 브랜드: {brand_name}
- 프로젝트: {project_name}
- 사용자 질문: {question}

[키워드 분석 요약]
{keyword_stats_summary}

[발견된 문제점]
{json.dumps(problems, ensure_ascii=False, indent=2)}

[제안된 솔루션]
{json.dumps(solutions, ensure_ascii=False, indent=2)}

[핵심 인사이트]
{json.dumps(insights, ensure_ascii=False, indent=2)}

[요청사항]
위 정보를 바탕으로 다음 형식의 리포트를 작성해주세요:

{{
  "summary": {{
    "title": "AI 전략 리포트 (요약본)",
    "analysisTarget": "{brand_name}",
    "dataStandard": "최근 SNS 반응",
    "keyIssuesCount": {len(problems)},
    "strategiesCount": {len(solutions)}
  }},
  "keyIssues": [
    {{
      "title": "문제점 제목",
      "description": "문제점 상세 설명",
      "impact": "영향도 (높음/중간/낮음)",
      "urgency": "긴급도 (높음/중간/낮음)"
    }}
  ],
  "strategies": [
    {{
      "title": "실행 전략 제목",
      "description": "전략 상세 설명",
      "priority": "우선순위 (1-5)",
      "expectedImpact": "예상 효과",
      "implementationSteps": ["단계1", "단계2", "단계3"]
    }}
  ],
  "insights": [
    {{
      "title": "인사이트 제목",
      "description": "인사이트 상세 설명",
      "recommendation": "추천 사항"
    }}
  ],
  "executiveSummary": "경영진을 위한 요약 (3-5문장)"
}}

중요:
- JSON 형식만 출력하세요
- 각 항목은 구체적이고 실행 가능하게 작성하세요
- 데이터 기반으로 작성하되, 전문가 관점에서 인사이트를 추가하세요
"""
    return prompt.strip()


def generate_strategy_report(
    brand_name: str,
    project_name: str,
    question: str,
    problems: List[str],
    solutions: List[str],
    insights: List[str],
    keyword_stats_summary: str,
    ollama_url: str = None,
    ollama_model: str = None,
    timeout_sec: int = 300,
    trace: str = "-"
) -> Dict[str, Any]:
    """
    전략 리포트 생성 (LLM 사용 - Ollama)
    
    [입력]
    - brand_name: 브랜드명
    - project_name: 프로젝트명
    - question: 사용자 질문
    - problems: 문제점 리스트
    - solutions: 솔루션 리스트
    - insights: 인사이트 리스트
    - keyword_stats_summary: 키워드 통계 요약
    - ollama_url: Ollama 서버 URL
    - ollama_model: Ollama 모델명
    - timeout_sec: 타임아웃 (초)
    - trace: 추적 ID
    
    [출력]
    - 리포트 딕셔너리
    """
    ollama_url = ollama_url or settings.ollama_url
    ollama_model = ollama_model or settings.ollama_model
    
    if not ollama_url or not ollama_model:
        raise ValueError("Ollama URL 또는 모델이 설정되지 않았습니다.")
    
    # 프롬프트 생성
    prompt = build_report_prompt(
        brand_name=brand_name,
        project_name=project_name,
        question=question,
        problems=problems,
        solutions=solutions,
        insights=insights,
        keyword_stats_summary=keyword_stats_summary
    )
    
    # LLM 호출
    try:
        response = generate_with_ollama(
            ollama_url=ollama_url,
            model=ollama_model,
            prompt=prompt,
            timeout_sec=timeout_sec,
            trace=trace
        )
        
        # JSON 파싱
        try:
            # JSON 부분만 추출 (마크다운 코드 블록 제거)
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                response = response[json_start:json_end].strip()
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                response = response[json_start:json_end].strip()
            
            report_data = json.loads(response)
            return report_data
        except json.JSONDecodeError as e:
            print(f"[report_generator] JSON 파싱 실패: {e}")
            print(f"[report_generator] 응답 내용: {response[:500]}")
            # 기본 리포트 구조 반환
            return {
                "summary": {
                    "title": "AI 전략 리포트 (요약본)",
                    "analysisTarget": brand_name,
                    "dataStandard": "최근 SNS 반응",
                    "keyIssuesCount": len(problems),
                    "strategiesCount": len(solutions)
                },
                "keyIssues": [{"title": p, "description": p} for p in problems],
                "strategies": [{"title": s, "description": s} for s in solutions],
                "insights": [{"title": i, "description": i} for i in insights],
                "executiveSummary": f"{brand_name} 프로젝트 분석 결과, {len(problems)}개 주요 문제점과 {len(solutions)}개 실행 전략을 도출했습니다."
            }
    except Exception as e:
        print(f"[report_generator] 리포트 생성 실패: {e}")
        import traceback
        traceback.print_exc()
        # 기본 리포트 구조 반환
        return {
            "summary": {
                "title": "AI 전략 리포트 (요약본)",
                "analysisTarget": brand_name,
                "dataStandard": "최근 SNS 반응",
                "keyIssuesCount": len(problems),
                "strategiesCount": len(solutions)
            },
            "keyIssues": [{"title": p, "description": p} for p in problems],
            "strategies": [{"title": s, "description": s} for s in solutions],
            "insights": [{"title": i, "description": i} for i in insights],
            "executiveSummary": f"{brand_name} 프로젝트 분석 결과를 요약합니다."
        }


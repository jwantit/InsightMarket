# app/rag/prompt.py
# ============================================================
# [기능] Prompt Builder
# - Retriever hits(payload+score) → LLM prompt 문자열 생성
# - "근거 기반" + "추측 금지" + "JSON 출력"을 강제
# ============================================================

import json
from typing import Any, Dict, List, Tuple


def build_prompt(question: str, hits: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
    """
    [입력]
    - question: 사용자 질문
    - hits: Qdrant 검색 결과(list of dict), item.score + item.payload 포함

    [출력]
    - prompt: LLM에 보낼 최종 프롬프트
    - sources: LLM이 참고한 '근거' 리스트(우리가 고정해서 응답에 주입)
    """
    sources: List[Dict[str, Any]] = []

    for h in hits:
        p = h.get("payload", {}) or {}
        sources.append({
            "title": p.get("title"),
            "url": p.get("url"),
            "publishedAt": p.get("publishedAt"),
            "source": p.get("source"),
            "chunkText": p.get("chunkText"),
            "score": h.get("score"),
        })

    prompt = f"""
너는 브랜드 분석가다. 아래 '근거'만 사용해서 답해라.
추측 금지. 근거에 없는 내용은 "근거 부족"이라고 써라.

[질문]
{question}

[근거]
{json.dumps(sources, ensure_ascii=False, indent=2)}

[출력 형식: JSON만 출력]
{{
  "insights": ["관찰/요약 3~4개"],
  "problems": ["문제 3~4개"],
  "actions": ["실행 액션 3~4개(구체적으로)"],
  "solutions": ["솔루션 3~4개(실행순서 포함)"],
  "sources": [
    {{"title":"", "url":"", "publishedAt":"", "source":"", "score":0.0}}
  ]
}}
""".strip()

    return prompt, sources

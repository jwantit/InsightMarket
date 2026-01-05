# app/services/rag/generator.py
# ============================================================
# [역할] LLM 호출 인프라 레이어
# - Ollama /api/generate 호출
# - OpenAI API 호출
# - stream=False 기본
# - timeout/log를 여기서 관리
# 
# [사용처]
# - rag/pipeline.py: 일반 RAG 파이프라인 (Ollama 사용)
# - strategy/report_generator.py: 전략 리포트 생성 (OpenAI 사용)
# - strategy/solution_report_generator.py: 솔루션 리포트 생성 (OpenAI 사용)
# ============================================================

import time
from typing import Any, Dict, Optional

import requests

# OpenAI 라이브러리 import (선택적)
try:
    from openai import OpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False


def _now():
    return time.strftime("%H:%M:%S")


def _log(msg: str, trace: str = "-"):
    print(f"[{_now()}][generator][{trace}] {msg}")


def generate_with_ollama(
    ollama_url: str,
    model: str,
    prompt: str,
    timeout_sec: int = 300,
    options: Optional[Dict[str, Any]] = None,
    trace: str = "-",
) -> str:
    """
    [기능] Ollama generate 호출
    [주의] options는 필요할 때만(예: temperature, num_ctx 등) 넣는다.
    """
    body: Dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }
    if options:
        body["options"] = options

    t0 = time.perf_counter()
    r = requests.post(ollama_url, json=body, timeout=timeout_sec)
    r.raise_for_status()
    sec = time.perf_counter() - t0

    data = r.json() or {}
    out = data.get("response", "") or ""
    _log(f"ollama_generate ok elapsed_sec={sec:.3f} chars={len(out)}", trace)
    return out


def generate_with_openai(
    api_key: str,
    model: str,
    prompt: str,
    timeout_sec: int = 300,
    trace: str = "-",
) -> str:
    """
    [기능] OpenAI API 호출
    [주의] OpenAI 라이브러리가 설치되어 있어야 함 (pip install openai)
    """
    if not _OPENAI_AVAILABLE:
        raise ImportError(
            "openai 라이브러리가 설치되지 않았습니다. pip install openai 실행하세요."
        )
    
    client = OpenAI(api_key=api_key, timeout=timeout_sec)
    
    t0 = time.perf_counter()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        out = response.choices[0].message.content or ""
        sec = time.perf_counter() - t0
        _log(f"openai_generate ok elapsed_sec={sec:.3f} chars={len(out)}", trace)
        return out
    except Exception as e:
        sec = time.perf_counter() - t0
        _log(f"openai_generate error elapsed_sec={sec:.3f} error={str(e)}", trace)
        raise

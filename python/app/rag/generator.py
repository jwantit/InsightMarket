# app/rag/generator.py
# ============================================================
# [기능] Generator (LLM 호출)
# - Ollama /api/generate 호출
# - stream=False 기본
# - timeout/log를 여기서 관리
# ============================================================

import time
from typing import Any, Dict, Optional

import requests


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

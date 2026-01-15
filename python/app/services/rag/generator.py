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


def generate_with_ollama_vision(
    ollama_url: str,
    model: str,
    prompt: str,
    base64_image: str,
    timeout_sec: int = 600,
    options: Optional[Dict[str, Any]] = None,
    trace: str = "-",
) -> str:
    """
    [기능] Ollama Vision API 호출 (이미지 분석용)
    [주의] base64_image는 "data:image/jpeg;base64,..." 형식 또는 순수 Base64 문자열
    [주의] vision 모델(예: moondream)이 필요함
    """
    # Base64 이미지가 data URL 형식인 경우 처리
    if base64_image.startswith("data:"):
        # "data:image/jpeg;base64,/9j/4AAQ..." -> "/9j/4AAQ..."만 추출
        base64_image = base64_image.split(",", 1)[1]
    
    body: Dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "images": [base64_image],  # Ollama Vision API는 images 배열 사용
        "stream": False,
    }
    if options:
        body["options"] = options

    t0 = time.perf_counter()
    try:
        r = requests.post(ollama_url, json=body, timeout=timeout_sec)
        r.raise_for_status()
        sec = time.perf_counter() - t0

        data = r.json() or {}
        out = data.get("response", "") or ""
        
        _log(f"ollama_vision ok elapsed_sec={sec:.3f} chars={len(out)}", trace)
        return out
    except Exception as e:
        sec = time.perf_counter() - t0
        _log(f"ollama_vision error elapsed_sec={sec:.3f} error={str(e)}", trace)
        raise


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


def generate_with_openai_vision(
    api_key: str,
    model: str,
    prompt: str,
    base64_image: str,
    timeout_sec: int = 300,
    trace: str = "-",
) -> str:
    """
    [기능] OpenAI Vision API 호출 (이미지 분석용)
    [주의] base64_image는 "data:image/jpeg;base64,..." 형식 또는 순수 Base64 문자열
    [주의] Vision 모델(예: gpt-4o, gpt-4-vision-preview)이 필요함
    """
    if not _OPENAI_AVAILABLE:
        raise ImportError(
            "openai 라이브러리가 설치되지 않았습니다. pip install openai 실행하세요."
        )
    
    # Base64 이미지가 data URL 형식인 경우 처리
    image_url = None
    if base64_image.startswith("data:"):
        image_url = base64_image
    else:
        # 순수 Base64 문자열인 경우 data URL 형식으로 변환
        # 이미지 타입 감지는 기본적으로 jpeg로 가정 (필요시 PIL로 확인 가능)
        image_url = f"data:image/jpeg;base64,{base64_image}"
    
    client = OpenAI(api_key=api_key, timeout=timeout_sec)
    
    t0 = time.perf_counter()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,
            max_tokens=4096,  # Vision 응답은 길 수 있으므로 충분한 토큰 할당
        )
        out = response.choices[0].message.content or ""
        sec = time.perf_counter() - t0
        _log(f"openai_vision ok elapsed_sec={sec:.3f} chars={len(out)}", trace)
        return out
    except Exception as e:
        sec = time.perf_counter() - t0
        error_msg = str(e)
        _log(f"openai_vision error elapsed_sec={sec:.3f} error={error_msg}", trace)
        
        # 401 에러인 경우 더 명확한 메시지 제공
        if "401" in error_msg or "invalid_api_key" in error_msg or "Incorrect API key" in error_msg:
            raise ValueError(
                f"OpenAI API 키가 유효하지 않습니다.\n"
                f"에러: {error_msg}\n\n"
                f"해결 방법:\n"
                f"1. API 키 확인: https://platform.openai.com/account/api-keys 에서 유효한 API 키 확인\n"
                f"2. 환경변수 설정 (PowerShell): $env:OPENAI_API_KEY='sk-...'\n"
                f"3. .env 파일 설정: python/.env 파일에 OPENAI_API_KEY=sk-... 추가\n"
                f"4. API 키는 'sk-'로 시작해야 하며, 앞뒤 공백이 없어야 합니다.\n"
                f"5. 서버 재시작: 환경변수나 .env 파일 변경 후 서버를 재시작하세요."
            )
        
        raise

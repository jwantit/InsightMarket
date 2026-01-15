# app/services/image/image_analyzer.py
# ============================================================
# [역할] 이미지 콘텐츠 분석 서비스
# - Base64 이미지 디코딩
# - Ollama moondream 모델로 이미지 분석 (OCR + 톤앤매너 분석)
# - JSON 응답 파싱 및 구조화
# ============================================================

import json
import re
import base64
from typing import Dict, Any, Optional
from io import BytesIO
from PIL import Image

from app.config.settings import settings
from app.services.rag.generator import generate_with_ollama_vision, generate_with_openai_vision


def _now():
    import time
    return time.strftime("%H:%M:%S")


def _log(msg: str, trace: str = "-"):
    print(f"[{_now()}][image_analyzer][{trace}] {msg}")


def analyze_image_content(base64_image: str, provider: str = "ollama", trace_id: str = "-") -> Dict[str, Any]:
    """
    [기능] 이미지 콘텐츠 분석
    [입력]
    - base64_image: Base64 인코딩된 이미지 문자열
    - provider: LLM 제공자 ("ollama" 또는 "openai")
    - trace_id: 추적 ID
    
    [출력]
    - Dict[str, Any]: 분석 결과
      {
        "extractedText": str,
        "metrics": {
          "자극성": int (0-100),
          "가독성": int (0-100),
          "감성": int (0-100),
          "전문성": int (0-100),
          "신뢰도": int (0-100)
        },
        "pros": List[str],
        "cons": List[str],
        "recommendations": str
      }
    """
    try:
        # Base64 이미지 검증 (디코딩 가능한지 확인)
        if base64_image.startswith("data:"):
            # data URL 형식에서 Base64 부분만 추출
            base64_image = base64_image.split(",", 1)[1]
        
        # Base64 디코딩 검증
        try:
            image_bytes = base64.b64decode(base64_image)
            # 이미지 유효성 검증 (verify()는 이미지를 닫으므로 별도 처리)
            test_image = Image.open(BytesIO(image_bytes))
            test_image.verify()
            # verify() 후 이미지는 닫히므로 길이만 확인
            _log(f"image validation ok size_bytes={len(image_bytes)}", trace_id)
        except Exception as e:
            _log(f"image validation failed error={str(e)}", trace_id)
            raise ValueError(f"유효하지 않은 이미지 파일입니다: {str(e)}")
        
        # 프롬프트 엔지니어링
        prompt = build_analysis_prompt()
        
        # Provider 검증
        provider = provider.lower().strip() if provider else "ollama"
        if provider not in ["ollama", "openai"]:
            raise ValueError(f"지원하지 않는 provider입니다: {provider}. 'ollama' 또는 'openai'를 사용하세요.")
        
        # LLM Provider에 따라 호출
        if provider == "ollama":
            # Ollama Vision 모델 호출
            _log(f"calling ollama vision model={settings.ollama_vision_model}", trace_id)
            response = generate_with_ollama_vision(
                ollama_url=settings.ollama_url,
                model=settings.ollama_vision_model,
                prompt=prompt,
                base64_image=base64_image,
                timeout_sec=settings.ollama_vision_timeout_sec,
                trace=trace_id,
            )
        else:  # openai
            # OpenAI API 키 검증
            if not settings.openai_api_key:
                raise ValueError(
                    "OpenAI API 키가 설정되지 않았습니다.\n"
                    "설정 방법:\n"
                    "1. 환경변수 설정: $env:OPENAI_API_KEY='sk-...' (PowerShell) 또는 export OPENAI_API_KEY='sk-...' (Linux/Mac)\n"
                    "2. .env 파일 생성: python/.env 파일에 OPENAI_API_KEY=sk-... 추가"
                )
            
            # API 키 형식 간단 검증 (sk-로 시작하는지 확인)
            if not settings.openai_api_key.startswith("sk-"):
                raise ValueError(
                    f"OpenAI API 키 형식이 올바르지 않습니다. 'sk-'로 시작해야 합니다.\n"
                    f"현재 키 (마스킹됨): {settings.openai_api_key[:7]}...{settings.openai_api_key[-4:] if len(settings.openai_api_key) > 11 else ''}"
                )
            
            # OpenAI Vision 모델 호출
            _log(f"calling openai vision model={settings.openai_vision_model}", trace_id)
            response = generate_with_openai_vision(
                api_key=settings.openai_api_key,
                model=settings.openai_vision_model,
                prompt=prompt,
                base64_image=base64_image,
                timeout_sec=settings.openai_vision_timeout_sec,
                trace=trace_id,
            )
        
        # JSON 응답 파싱
        parsed_result = parse_analysis_response(response, trace_id)
        return parsed_result
        
    except Exception as e:
        _log(f"analysis failed error={str(e)}", trace_id)
        raise


def build_analysis_prompt() -> str:
    """
    [기능] 이미지 분석 프롬프트 생성
    [주의] llava 모델은 더 복잡한 분석과 한국어 처리가 가능
    [주의] 모든 응답은 한국어로 작성되어야 함
    """
    return """당신은 마케팅 이미지 분석 전문가입니다. 이 이미지를 상세히 분석하여 JSON 형식으로 결과를 제공하세요.

STEP 1: 텍스트 추출
- 이미지에 보이는 모든 텍스트를 정확하게 추출하세요 (한국어, 영어 모두 포함)
- 브랜드명, 이벤트명, 날짜, 해시태그, 캡션 등을 모두 포함하세요
- 모든 텍스트를 "extractedText" 필드에 넣으세요

STEP 2: 마케팅 지표 평가 (각 항목 0-100점)
- 자극성 (Stimulation): 얼마나 시각적으로 강렬하고 눈에 띄는가? 색상, 대비, 구도를 고려하세요
- 가독성 (Readability): 텍스트를 읽기 얼마나 쉬운가? 폰트 크기, 색상 대비, 배경 명확성을 고려하세요
- 감성 (Emotion): 얼마나 감성적이고 매력적인가? 메시징, 이미지, 톤을 고려하세요
- 전문성 (Professionalism): 얼마나 전문적이고 신뢰할 수 있는가? 브랜드 존재감, 디자인 품질을 고려하세요
- 신뢰도 (Trustworthiness): 얼마나 신뢰할 수 있는가? 브랜드 평판, 명확한 정보, 투명성을 고려하세요

STEP 3: 장점 및 단점
- "pros" 배열에 구체적인 장점 3가지를 한국어로 나열하세요 (무엇이 잘 작동하는지 구체적으로 작성)
- "cons" 배열에 구체적인 단점 3가지를 한국어로 나열하세요 (무엇을 개선할 수 있는지 구체적으로 작성)

STEP 4: 추천사항
- "recommendations" 필드에 구체적이고 실행 가능한 개선 제안을 한국어로 작성하세요
- 마케팅 효과성에 초점을 맞추세요

중요: 모든 텍스트 필드(pros, cons, recommendations)는 반드시 한국어로 작성해야 합니다.

다음 구조의 유효한 JSON 객체만 반환하세요:
{
  "extractedText": "이미지에서 보이는 모든 텍스트 내용",
  "metrics": {"자극성": <0-100>, "가독성": <0-100>, "감성": <0-100>, "전문성": <0-100>, "신뢰도": <0-100>},
  "pros": ["장점 1을 한국어로", "장점 2를 한국어로", "장점 3을 한국어로"],
  "cons": ["단점 1을 한국어로", "단점 2를 한국어로", "단점 3을 한국어로"],
  "recommendations": "한국어로 작성된 상세한 개선 제안"
}

{ 로 시작하고 } 로 끝나야 합니다. 앞뒤로 다른 텍스트는 없어야 합니다."""


def parse_analysis_response(response: str, trace_id: str = "-") -> Dict[str, Any]:
    """
    [기능] Ollama 응답을 파싱하여 구조화된 데이터로 변환
    [주의] LLM 응답에서 JSON 부분만 추출 (마크다운 코드 블록 포함 가능)
    """
    json_str = ""  # 초기화
    try:
        # 응답에서 JSON 부분 추출 (마크다운 코드 블록 제거)
        json_str = extract_json_from_response(response)
        
        # JSON 파싱
        result = json.loads(json_str)
        
        # 필수 필드 검증 및 기본값 설정
        parsed = {
            "extractedText": result.get("extractedText", ""),
            "metrics": result.get("metrics", {}),
            "pros": result.get("pros", []),
            "cons": result.get("cons", []),
            "recommendations": result.get("recommendations", ""),
        }
        
        # metrics 타입 변환 및 검증
        if isinstance(parsed["metrics"], list) and len(parsed["metrics"]) > 0:
            # 배열인 경우 첫 번째 요소 사용
            parsed["metrics"] = parsed["metrics"][0] if isinstance(parsed["metrics"][0], dict) else {}
        
        if not isinstance(parsed["metrics"], dict):
            parsed["metrics"] = {}
        
        # metrics 기본값 설정 (누락된 경우)
        default_metrics = {
            "자극성": 50,
            "가독성": 50,
            "감성": 50,
            "전문성": 50,
            "신뢰도": 50,
        }
        for key, default_value in default_metrics.items():
            if key not in parsed["metrics"]:
                parsed["metrics"][key] = default_value
            # 값 범위 검증 (0-100) - float도 처리
            value = parsed["metrics"][key]
            if isinstance(value, float):
                # 0-1 범위를 0-100으로 변환 (예: 0.12 -> 12)
                if 0 <= value <= 1:
                    parsed["metrics"][key] = int(value * 100)
                else:
                    parsed["metrics"][key] = int(value)
            elif not isinstance(value, int):
                try:
                    parsed["metrics"][key] = int(float(value))
                except (ValueError, TypeError):
                    parsed["metrics"][key] = default_value
            parsed["metrics"][key] = max(0, min(100, parsed["metrics"][key]))
        
        # pros/cons 배열 검증
        if not isinstance(parsed["pros"], list):
            parsed["pros"] = []
        if not isinstance(parsed["cons"], list):
            parsed["cons"] = []
        
        # 문자열 필드 검증
        if not isinstance(parsed["extractedText"], str):
            parsed["extractedText"] = str(parsed["extractedText"]) if parsed["extractedText"] else ""
        if not isinstance(parsed["recommendations"], str):
            parsed["recommendations"] = str(parsed["recommendations"]) if parsed["recommendations"] else ""
        
        return parsed
        
    except json.JSONDecodeError as e:
        # 에러 로깅
        _log(f"JSON parsing failed error={str(e)}", trace_id)
        
        # 파싱 실패 시에도 일부 데이터 추출 시도
        partial_data = extract_partial_data_from_response(response, trace_id)
        
        return {
            "extractedText": partial_data.get("extractedText", response[:500] if response else ""),
            "metrics": partial_data.get("metrics", {
                "자극성": 50,
                "가독성": 50,
                "감성": 50,
                "전문성": 50,
                "신뢰도": 50,
            }),
            "pros": partial_data.get("pros", []),
            "cons": partial_data.get("cons", []),
            "recommendations": partial_data.get("recommendations", f"JSON 파싱 오류: {str(e)}. 일부 데이터만 추출되었습니다."),
        }
    except Exception as e:
        _log(f"parsing error error={str(e)}", trace_id)
        raise


def extract_json_from_response(response: str) -> str:
    """
    [기능] 응답 문자열에서 JSON 부분 추출
    - 마크다운 코드 블록(```json ... ```) 제거
    - JSON 객체 찾기 (중첩된 중괄호 처리)
    - JSON 문법 오류 복구 시도
    """
    # 공백 제거 (앞뒤)
    response = response.strip()
    
    # 마크다운 코드 블록 제거
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response, re.DOTALL)
    if json_match:
        response = json_match.group(1).strip()
    
    # JSON 객체 직접 찾기 ({ ... }) - 중괄호 매칭 개선
    # 가장 긴 JSON 객체 찾기 (중첩된 중괄호 처리)
    brace_count = 0
    start_idx = -1
    for i, char in enumerate(response):
        if char == '{':
            if brace_count == 0:
                start_idx = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and start_idx >= 0:
                json_str = response[start_idx:i+1].strip()
                # JSON 문법 오류 복구 시도
                json_str = fix_json_errors(json_str)
                return json_str
    
    # 위 방법이 실패하면 첫 번째 { 부터 끝까지 가져오기
    start_idx = response.find('{')
    if start_idx >= 0:
        # 닫는 중괄호가 없으면 추가
        json_str = response[start_idx:].strip()
        if not json_str.endswith('}'):
            json_str += '\n}'
        json_str = fix_json_errors(json_str)
        return json_str
    
    # 찾지 못하면 원본 반환 (파싱 에러 발생 가능)
    return response.strip()


def extract_partial_data_from_response(response: str, trace_id: str = "-") -> Dict[str, Any]:
    """
    [기능] JSON 파싱 실패 시에도 정규식으로 일부 데이터 추출 시도
    """
    partial = {
        "extractedText": "",
        "metrics": {},
        "pros": [],
        "cons": [],
        "recommendations": "",
    }
    
    try:
        # extractedText 추출
        text_match = re.search(r'"extractedText"\s*:\s*"([^"]*)"', response)
        if text_match:
            partial["extractedText"] = text_match.group(1)
        
        # metrics 추출 (객체 또는 배열 모두 처리)
        metrics_match = re.search(r'"metrics"\s*:\s*(\{[^}]*\}|\[[^\]]*\])', response, re.DOTALL)
        if metrics_match:
            metrics_str = metrics_match.group(1)
            # 배열인 경우 첫 번째 객체 추출
            if metrics_str.startswith('['):
                obj_match = re.search(r'\{([^}]+)\}', metrics_str)
                if obj_match:
                    metrics_str = '{' + obj_match.group(1) + '}'
            
            # 각 메트릭 값 추출
            for key in ["자극성", "가독성", "감성", "전문성", "신뢰도"]:
                value_match = re.search(f'"{key}"\\s*:\\s*([0-9.]+)', metrics_str)
                if value_match:
                    value = float(value_match.group(1))
                    # 0-1 범위면 0-100으로 변환
                    if 0 <= value <= 1:
                        value = int(value * 100)
                    partial["metrics"][key] = max(0, min(100, int(value)))
        
        # pros 추출
        pros_match = re.search(r'"pros"\s*:\s*\[(.*?)\]', response, re.DOTALL)
        if pros_match:
            pros_content = pros_match.group(1)
            pros_items = re.findall(r'"([^"]*)"', pros_content)
            partial["pros"] = [p for p in pros_items if p and p not in ["자극성", "가독성", "감성", "전문성", "신뢰도"]]
        
        # cons 추출
        cons_match = re.search(r'"cons"\s*:\s*\[(.*?)\]', response, re.DOTALL)
        if cons_match:
            cons_content = cons_match.group(1)
            cons_items = re.findall(r'"([^"]*)"', cons_content)
            partial["cons"] = [c for c in cons_items if c and c not in ["자극성", "가독성", "감성", "전문성", "신뢰도"]]
        
    except Exception as e:
        _log(f"partial data extraction failed: {str(e)}", trace_id)
    
    return partial


def fix_json_errors(json_str: str) -> str:
    """
    [기능] JSON 문법 오류 복구 시도
    - 마지막 쉼표 제거
    - 닫는 중괄호 추가
    - metrics 배열을 객체로 변환 시도
    """
    # 마지막 쉼표 제거 (], } 앞의 쉼표)
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    
    # 중괄호 매칭 확인 및 복구
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    if open_braces > close_braces:
        json_str += '\n}' * (open_braces - close_braces)
    
    # metrics가 배열인 경우 객체로 변환 시도
    # "metrics": [{...}, {...}] -> "metrics": {...}
    metrics_array_match = re.search(r'"metrics"\s*:\s*\[\s*(\{[^}]+\})', json_str, re.DOTALL)
    if metrics_array_match:
        # 첫 번째 배열 요소를 객체로 변환
        first_obj = metrics_array_match.group(1)
        # 배열 전체를 찾아서 첫 번째 객체로 교체
        json_str = re.sub(
            r'"metrics"\s*:\s*\[\s*\{[^}]+\}[^\]]*\]',
            f'"metrics": {first_obj}',
            json_str,
            count=1,
            flags=re.DOTALL
        )
    
    return json_str


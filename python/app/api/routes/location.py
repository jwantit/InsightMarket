from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from app.config.settings import settings 
import requests
import json
import logging
import markdown

# 1. log 객체 정의 필수! (이게 없어서 로그가 안 찍혔던 겁니다)
log = logging.getLogger(__name__)



router = APIRouter(prefix="/api/location", tags=["location"])

#시스템 페르소나 텍스트
SYSTEM_PERSONA_TEXT = """
너는 지역 특성을 꿰뚫어 보는 '실전 창업 컨설턴트'야. 
단순한 데이터 비교를 넘어, 이 상권의 '지배적인 소비자 특성'을 파악하고 신규 창업자가 생존할 수 있는 핵심 경쟁력을 제안해야 해.
""".strip()

async def generate_with_openai(
    api_key: str,
    model: str,
    prompt: str,
    timeout_sec: int,
    trace_id: str = "-"
) -> str:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    # 페이로드 명령집합데이터 바디 전송 형식
    payload = {
        "model": model, # gpt-4o-mini
        "messages": [{"role": "system", "content": SYSTEM_PERSONA_TEXT}, #시스템 페르소나 텍스트
                     {"role": "user", "content": prompt}], # 프롬프트
        "temperature": 0.7,
        "max_tokens": 4000 # 필요에 따라 조정
    }
    openai_url = "https://api.openai.com/v1/chat/completions"

    log.info(f"[OpenAI Call] traceId={trace_id} model={model} prompt_len={len(prompt)}")
    try:
        response = requests.post(openai_url, headers=headers, json=payload, timeout=timeout_sec)
        response.raise_for_status() # HTTP 오류 발생 시 예외 발생
        result = response.json()
        
        # LLM 응답 내용 파싱
        generated_content = result["choices"][0]["message"]["content"]
        log.info(f"[OpenAI Success] traceId={trace_id} tokens={result['usage']['total_tokens']}")
        return generated_content
    except requests.exceptions.RequestException as e:
        log.error(f"[OpenAI Error] traceId={trace_id} Request failed: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI API 요청 실패: {e}")
    except Exception as e:
        log.error(f"[OpenAI Error] traceId={trace_id} Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI API 처리 중 오류 발생: {e}")

# 상권 분석 리포트 생성 로직 진입
@router.post("/generate-consulting-report")
async def generate_consulting_report(request: Request):
    try:
        trace_id = request.headers.get("X-Trace-Id", "json")
        body = await request.json()

        best_raw = body.get("BEST")
        worst_raw = body.get("WORST")
        radius = body.get("REDIUS")

        log.info(radius)

        model=settings.openai_model,
    # 프롬프트
        final_prompt = create_consulting_prompt(best_raw, worst_raw, radius)

     
        generated_consulting_text = await generate_with_openai(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        prompt=final_prompt,
        timeout_sec=settings.openai_timeout_sec,
        trace_id=trace_id
        )
        if "[SUMMARY]" in generated_consulting_text:
            parts = generated_consulting_text.split("[SUMMARY]")
            consulting_body = parts[0].strip()
            summary_text = parts[1].strip() if len(parts) > 1 else ""
        else:
            consulting_body = generated_consulting_text.strip()
            summary_text = "요약 정보를 찾을 수 없습니다."

        html_consulting = markdown.markdown(consulting_body, extensions=['nl2br', 'fenced_code'])
        html_consulting = html_consulting.replace("\n", "") # 줄바꿈 문자 아예 삭제

        html_summary = markdown.markdown(summary_text, extensions=['nl2br'])
        html_html_summary = html_summary.replace("\n", "")


        # 4. JSON 응답 반환 (자바 DTO 필드명에 맞춤)
        return JSONResponse(
            content={
                "consulting": html_consulting,
                "summary": html_summary  # 콤마와 키-값 쌍을 확인하세요.
            }, 
            status_code=200
        )
        
        
    except Exception as e:
        return JSONResponse(
            content={"consulting": f"에러 발생: {str(e)}"}, 
            status_code=500
        )





def create_consulting_prompt(best_raw: dict, worst_raw: dict, radius: int) -> str:

    best_str = json.dumps(best_raw, ensure_ascii=False, indent=2)
    worst_str = json.dumps(worst_raw, ensure_ascii=False, indent=2)

    prompt = f"""
   [분석 환경]
   - 상권 범위: 현재 좌표를 중심으로 반경 {radius}m 내 동일 상권

   [비교 데이터]
     1. 지역 내 우수 사례 (BEST):
      {best_str}

     2. 지역 내 부진 사례 (WORST):
      {worst_str}

[분석 미션: 창업자 관점]
1. **상권 성격 규명**: 두 매장의 유동인구 추이(trafficSeries)와 특징을 분석하여, 이 지역이 '직장인 중심'인지, '주거민 중심'인지, 아니면 '특정 시간대 목적성 방문'이 많은 곳인지 정의해라.
2. **필승 공식 추출**: 베스트 매장이 높은 매출지수를 유지하는 비결(입지, 시간대 활용 등)이 이 상권에서 어떻게 작용하고 있는지 분석해라.
3. **위험 요소 파악**: 워스트 매장이 베스트와 같은 상권임에도 불구하고 부진한 이유를 찾아내어, 신규 창업 시 반드시 피해야 할 '실수'를 정리해라.
4. **신규 매장 차별화 전략**: 내가 이 상권에 매장을 차린다면, 베스트 매장의 장점을 흡수하면서도 워스트 매장의 빈틈을 공략할 수 있는 '핵심 경쟁력(Unique Selling Point)'을 제안해라.

[필독: 출력 제한 사항]
1. 모든 답변에서 ** (별표)와 같은 마크다운 강조 기호를 절대 사용하지 마라. 순수 텍스트만 사용해라.
2. 각 섹션 제목 아래의 (괄호 설명) 내용은 실제 답변에 포함하지 마라.
3. 반드시 ## 1. 로 시작하는 목차 형식을 1번부터 4번까지 하나도 빠짐없이 작성해라.
4. 문장은 "~이다", "~함" 등의 전문적인 어조를 사용하고 가독성을 위해 불렛 포인트(-)를 활용해라.

    ## 1. 상권 특성 및 소비자 분석
    (여기에 trafficSeries 분석을 토대로 한 상권의 성격과 주요 방문객 특성을 기술해라.)

    ## 2. 이 지역 창업 필승 공식 (Best 사례 기반)
    (베스트 매장의 성공 요인과 내가 창업할 매장에 적용할 점을 기술해라.)

    ## 3. 절대 피해야 할 위험 요소 (Worst 사례 기반)
    (워스트 매장의 실패 요인과 이를 피하기 위한 체크리스트를 기술해라.)

    ## 4. 신규 창업자를 위한 최종 서바이벌 전략
    (이 상권에서 생존하기 위한 차별화된 USP와 구체적인 실행 방안을 기술해라.)

    [주의] 
    - 목차 번호와 제목을 임의로 수정하지 마라.
    - 서술형으로 작성하되, 가독성을 위해 불렛 포인트( - )를 적절히 섞어라.

   ---
    [가장 중요: 최종 요약 작성]
    리포트 작성이 끝나면 반드시 맨 마지막에 [SUMMARY]라는 태그를 작성하고, 그 아래에 다음 정보를 포함해라. 이 부분이 누락되면 절대 안 된다.

    [SUMMARY] 
    위의 모든 분석 내용을 바탕으로, 예비 창업자가 이 상권에서 승리하기 위한 핵심 전략을 아래 형식에 맞춰 엄격히 작성해라.

    - 핵심 요약: (위 리포트를 전반적으로 요약한 내용)
    - 추천 타겟: (가장 매출 기여도가 높을 것으로 예상되는 연령대 및 직업군)
    - 핵심 전략: (이 상권에서 반드시 실행해야 할 최우선 전략 한 가지)

    [주의] [SUMMARY] 태그 바로 다음 줄부터 위 형식을 지켜서 작성할 것.
    """.strip()
    
    return prompt

# app/services/pipeline/strategy_pipeline.py
# ============================================================
# [기능] 전략 분석 파이프라인 (Query Engineering 방식)
# - 프로젝트 키워드 통계 추출 → Query Engineering 쿼리 생성 → Qdrant 검색
# - 템플릿 매칭 결과를 프론트엔드 형식으로 변환
# ============================================================

import time
from typing import Dict, List, Any, Optional

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

from app.config.settings import settings
from app.services.strategy.query_builder import build_query_from_keyword_stats
from app.services.strategy.stats_extractor import (
    extract_keyword_stats_from_raw_data
)
from app.services.strategy.raw_data_filter import load_and_filter_today_data
from app.services.strategy.template_matcher import (
    match_strategy_templates,
    match_templates_via_qdrant_rest
)
from app.services.strategy.data_extractor import (
    extract_sources_from_data_list
)
from app.services.strategy.report_generator import generate_strategy_report
from app.services.strategy.query_builder import calculate_negative_ratio


def run_strategy_analysis(
    project_id: int,
    brand_id: int,
    brand_name: str,
    question: str,  # 필수
    project_keyword_ids: List[int],
    *,
    qdrant_client: Optional[QdrantClient] = None,
    qdrant_url: Optional[str] = None,
    collection_name: str = "strategy_templates",
    embed_model: SentenceTransformer,
    top_k: int = 3,
    trace: str = "-"
) -> Dict[str, Any]:
    """
    프로젝트 기반 전략 분석 (Query Engineering 방식)
    
    [입력]
    - project_id: 프로젝트 ID
    - brand_id: 브랜드 ID
    - brand_name: 브랜드명
    - question: 사용자 질문 (필수)
    - project_keyword_ids: 프로젝트 키워드 ID 리스트
    - qdrant_client: Qdrant 클라이언트 (None이면 REST API 사용)
    - qdrant_url: Qdrant 서버 URL (qdrant_client가 None일 때 사용)
    - collection_name: Qdrant 컬렉션 이름
    - embed_model: 임베딩 모델
    - top_k: 반환할 템플릿 개수
    - trace: 추적 ID
    
    [출력]
    - 결과 딕셔너리:
      {
        "ok": True,
        "data": {
          "insights": [...],
          "problems": [...],
          "solutions": [...]
        },
        "sources": [...]
      }
    """
    t0 = time.perf_counter()
    print(f"[strategy_pipeline] 시작 trace={trace} projectId={project_id} questionLen={len(question)}")
    
    try:
        # 1. 프로젝트 키워드별 감정분석 통계 조회 (raw_data에서)
        filtered_raw_data = load_and_filter_today_data(
            brand_id=brand_id,
            brand_name=brand_name,
            project_keyword_ids=project_keyword_ids
        )
        
        # 디버깅: 필터링된 데이터 확인
        project_keywords_count = len(filtered_raw_data.get("projectKeywords", []))
        total_data_count = sum(
            len(pk.get("data", [])) 
            for pk in filtered_raw_data.get("projectKeywords", [])
        )
        print(f"[strategy_pipeline] 필터링된 데이터: 프로젝트 키워드 {project_keywords_count}개, 총 데이터 {total_data_count}개")
        
        keyword_stats = extract_keyword_stats_from_raw_data(filtered_raw_data)
        
        # sources 추출
        sources = []
        project_keywords = filtered_raw_data.get("projectKeywords", [])
        for pk in project_keywords:
            pk_data = pk.get("data", [])
            sources.extend(extract_sources_from_data_list(pk_data))
        
        if not keyword_stats:
            # 더 자세한 에러 메시지 제공
            if project_keywords_count == 0:
                reason = f"프로젝트 ID {project_id}의 키워드(ID: {project_keyword_ids})에 해당하는 데이터가 raw_data에 없습니다. 데이터 수집이 필요합니다."
            elif total_data_count == 0:
                reason = f"프로젝트 키워드는 존재하지만 데이터가 비어있습니다. 데이터 수집이 필요합니다."
            else:
                reason = "키워드 통계 추출에 실패했습니다."
            
            print(f"[strategy_pipeline] 오류: {reason}")
            return {
                "ok": False,
                "reason": reason,
                "data": None,
                "sources": []
            }
        
        print(f"[strategy_pipeline] 키워드 통계 추출 완료: {len(keyword_stats)}개 키워드")
        
        # 2. Query Engineering: 자연어 쿼리 생성
        query_text = build_query_from_keyword_stats(keyword_stats, question)
        print(f"[strategy_pipeline] 쿼리 생성 완료: {query_text[:100]}...")
        
        # 3. Qdrant에서 템플릿 검색
        if qdrant_client:
            # QdrantClient 사용
            problems = match_strategy_templates(
                query_text=query_text,
                template_type="cause",
                qdrant_client=qdrant_client,
                embed_model=embed_model,
                collection_name=collection_name,
                top_k=top_k
            )
            
            insights = match_strategy_templates(
                query_text=query_text,
                template_type="insight",
                qdrant_client=qdrant_client,
                embed_model=embed_model,
                collection_name=collection_name,
                top_k=top_k
            )
        else:
            # REST API 사용
            qdrant_url = qdrant_url or settings.qdrant_url
            
            problems = match_templates_via_qdrant_rest(
                query_text=query_text,
                template_type="cause",
                qdrant_url=qdrant_url,
                embed_model=embed_model,
                collection_name=collection_name,
                top_k=top_k
            )
            
            insights = match_templates_via_qdrant_rest(
                query_text=query_text,
                template_type="insight",
                qdrant_url=qdrant_url,
                embed_model=embed_model,
                collection_name=collection_name,
                top_k=top_k
            )
        
        print(f"[strategy_pipeline] 문제점 템플릿 매칭: {len(problems)}개")
        print(f"[strategy_pipeline] 인사이트 템플릿 매칭: {len(insights)}개")
        
        # 4. 매칭된 문제점의 카테고리로 솔루션 검색
        solutions = []
        for problem in problems[:top_k]:
            problem_category = problem["payload"].get("category")
            if problem_category:
                if qdrant_client:
                    solution_results = match_strategy_templates(
                        query_text=query_text,
                        template_type="solution",
                        qdrant_client=qdrant_client,
                        embed_model=embed_model,
                        collection_name=collection_name,
                        top_k=1,
                        category=problem_category
                    )
                else:
                    solution_results = match_templates_via_qdrant_rest(
                        query_text=query_text,
                        template_type="solution",
                        qdrant_url=qdrant_url or settings.qdrant_url,
                        embed_model=embed_model,
                        collection_name=collection_name,
                        top_k=1,
                        category=problem_category
                    )
                
                if solution_results:
                    solutions.append({
                        **solution_results[0]["payload"],
                        "matchedProblem": problem["payload"]["id"],
                        "score": solution_results[0]["score"]
                    })
        
        print(f"[strategy_pipeline] 솔루션 템플릿 매칭: {len(solutions)}개")
        
        # 5. 템플릿 매칭 결과 추출
        problems_list = [p["payload"].get("title", "") for p in problems[:top_k]]
        solutions_list = [s.get("title", "") for s in solutions[:top_k]]
        insights_list = [i["payload"].get("title", "") for i in insights[:top_k]]
        
        # 6. 키워드 통계 요약 생성
        negative_ratio = calculate_negative_ratio(keyword_stats)
        keyword_stats_summary = f"""
- 분석된 키워드 수: {len(keyword_stats)}개
- 평균 부정 반응 비율: {negative_ratio}%
- 주요 키워드: {', '.join([kw.get('keyword', '') for kw in keyword_stats[:3]])}
"""
        
        # 7. LLM으로 리포트 요약본 생성 (Ollama 사용)
        report = None
        try:
            print(f"[strategy_pipeline] 리포트 요약본 생성 시작...")
            report = generate_strategy_report(
                brand_name=brand_name,
                project_name=f"프로젝트 {project_id}",  
                question=question,
                problems=problems_list,
                solutions=solutions_list,
                insights=insights_list,
                keyword_stats_summary=keyword_stats_summary,
                ollama_url=settings.ollama_url,
                ollama_model=settings.ollama_model,
                timeout_sec=settings.ollama_timeout_sec,
                trace=trace
            )
            print(f"[strategy_pipeline] 리포트 요약본 생성 완료")
        except Exception as e:
            print(f"[strategy_pipeline] 리포트 요약본 생성 실패 (계속 진행): {e}")
            # 리포트 생성 실패해도 기본 결과는 반환
        
        # 8. 결과 포맷팅 (프론트엔드 형식)
        # insights와 problems는 리포트 생성에만 사용하고 프론트엔드에는 표시하지 않음
        result = {
            "ok": True,
            "data": {
                "insights": [],  # 리포트 생성에만 사용, 프론트엔드 표시 안 함
                "problems": [],  # 리포트 생성에만 사용, 프론트엔드 표시 안 함
                "solutions": solutions_list,  # 프론트엔드에 표시
                "actions": []  # 템플릿에서 추출하거나 빈 배열
            },
            "report": report,  # LLM으로 생성된 리포트 요약본
            "sources": sources[:10]  # 최대 10개만
        }
        
        elapsed = time.perf_counter() - t0
        print(f"[strategy_pipeline] 완료 elapsed_sec={elapsed:.3f}")
        
        return result
        
    except Exception as e:
        print(f"[strategy_pipeline] 오류: {e}")
        import traceback
        traceback.print_exc()
        return {
            "ok": False,
            "reason": str(e),
            "data": None,
            "sources": []
        }


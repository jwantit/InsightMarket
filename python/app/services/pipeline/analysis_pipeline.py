"""
분석 파이프라인 오케스트레이터
전체 분석 파이프라인을 순차적으로 실행
"""
import json
from datetime import date
from pathlib import Path
from typing import List, Dict, Optional, Tuple

from app.services.parser.raw_data_parser import parse_raw_data
from app.services.preprocess.preprocessor import preprocess_data
from app.services.sentiment.kobert_loader import load_kobert
from app.services.sentiment.predictor import predict_sentiment
from app.services.stats.aggregate_all import (
    aggregate_keyword_daily_stats,
    aggregate_keyword_sentiment_daily_stats,
    aggregate_keyword_token_sentiment_stats,
    aggregate_keyword_baseline_stats
)
from app.services.stats.insight import detect_spikes, generate_insight_results
from app.services.stats.enrich import enrich_spike_infos
from app.services.stats.data_transformer import (
    transform_to_spring_daily_stats,
    transform_to_spring_sentiment_stats,
    transform_to_spring_token_stats,
    transform_to_spring_baseline_stats,
    transform_to_spring_insights,
    map_sentiment_to_spring
)


# KoBERT 모델 싱글톤
_kobert_tokenizer = None
_kobert_model = None


def get_kobert_model():
    """KoBERT 모델 싱글톤"""
    global _kobert_tokenizer, _kobert_model
    if _kobert_tokenizer is None or _kobert_model is None:
        print("[파이프라인] KoBERT 모델 로딩 중...")
        _kobert_tokenizer, _kobert_model = load_kobert()
    return _kobert_tokenizer, _kobert_model


def update_raw_data_with_sentiment(
    raw_data_file_path: str,
    analyzed_docs: List[Dict]
) -> None:
    """
    감정분석 결과(sentiment)를 raw_data 파일에 추가
    
    [입력]
    - raw_data_file_path: raw_data.json 파일 경로
    - analyzed_docs: 감정분석된 문서 리스트
        [
          {
            "brand_id": int,
            "project_id": int | None,
            "keyword_id": int | None,
            "text": str,  # title + text + comments 병합된 텍스트
            "sentiment": str,  # "POS", "NEG", "NEU"
            ...
          }
        ]
    """
    try:
        # 1. raw_data 파일 로드
        file_path = Path(raw_data_file_path)
        if not file_path.exists():
            print(f"[파이프라인] raw_data 파일이 없습니다: {raw_data_file_path}")
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        # 2. analyzed_docs를 매핑용 딕셔너리로 변환
        # key: (brand_id, project_id, keyword_id, text_normalized)
        sentiment_map = {}
        for doc in analyzed_docs:
            text = doc.get("text", "").strip()
            if not text:
                continue
            
            # 텍스트 정규화 (공백 정리)
            text_normalized = " ".join(text.split())
            
            key = (
                doc.get("brand_id"),
                doc.get("project_id"),
                doc.get("keyword_id"),
                text_normalized
            )
            sentiment_map[key] = doc.get("sentiment", "NEU")
        
        # 3. raw_data의 각 아이템에 sentiment 추가
        updated_count = 0
        brands = raw_data.get("brands", [])
        
        for brand in brands:
            brand_id = brand.get("brandId")
            
            # PROJECT 타입 데이터 처리
            project_keywords = brand.get("projectKeywords", [])
            for pk in project_keywords:
                project_id = pk.get("projectId")
                project_keyword_id = pk.get("projectKeywordId")
                data_list = pk.get("data", [])
                
                for item in data_list:
                    if item.get("type") != "PROJECT":
                        continue
                    
                    # text 생성 (title + text + comments 병합) - raw_data_parser와 동일한 방식
                    text_parts = []
                    if item.get("title"):
                        text_parts.append(item["title"])
                    if item.get("text"):
                        text_parts.append(item["text"])
                    if item.get("comments"):
                        comments = item.get("comments", [])
                        if isinstance(comments, list):
                            text_parts.extend(comments)
                    
                    merged_text = " ".join(text_parts)
                    if not merged_text.strip():
                        continue
                    
                    # 텍스트 정규화
                    text_normalized = " ".join(merged_text.split())
                    
                    # 매칭
                    key = (brand_id, project_id, project_keyword_id, text_normalized)
                    sentiment = sentiment_map.get(key)
                    
                    if sentiment:
                        item["sentiment"] = sentiment
                        updated_count += 1
        
        # 4. raw_data 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(raw_data, f, ensure_ascii=False, indent=2)
        
        print(f"[파이프라인] raw_data 파일 업데이트 완료: {updated_count}개 아이템에 sentiment 추가")
        
    except Exception as e:
        print(f"[파이프라인] raw_data 업데이트 중 오류: {e}")
        import traceback
        traceback.print_exc()


def run_analysis_pipeline(
    file_path: str,
    brand_id: Optional[int] = None
) -> Dict:
    """
    전체 분석 파이프라인 실행
    
    Args:
        file_path: raw_data.json 파일 경로
        brand_id: 특정 브랜드만 분석 (None이면 전체)
    
    Returns:
        Dict: 분석 결과 딕셔너리
            {
                "status": "success",
                "daily_stats": [...],
                "sentiment_stats": [...],
                "token_stats": [...],
                "baseline_stats": [...],
                "insights": [...]
            }
    """
    try:
        # 1. Raw 데이터 파싱
        print("[파이프라인] 1단계: Raw 데이터 파싱")
        raw_data = parse_raw_data(file_path, brand_id)
        if not raw_data:
            return {
                "status": "error",
                "message": "파싱된 데이터가 없습니다."
            }
        
        # 2. 전처리
        print("[파이프라인] 2단계: 전처리")
        preprocessed_data = preprocess_data(raw_data, use_morphology=False)
        if not preprocessed_data:
            return {
                "status": "error",
                "message": "전처리된 데이터가 없습니다."
            }
        
        # 3. 감정분석
        print("[파이프라인] 3단계: 감정분석")
        tokenizer, model = get_kobert_model()
        analyzed_docs = []
        
        for item in preprocessed_data:
            text = item.get("text", "")
            if not text:
                continue
            
            sentiment_label, confidence = predict_sentiment(text, tokenizer, model)
            sentiment = map_sentiment_to_spring(sentiment_label)
            
            # stat_date를 date 객체로 변환
            stat_date_str = item.get("stat_date")
            if isinstance(stat_date_str, str):
                try:
                    stat_date = date.fromisoformat(stat_date_str)
                except:
                    from datetime import datetime
                    stat_date = datetime.strptime(stat_date_str, "%Y-%m-%d").date()
            else:
                stat_date = stat_date_str
            
            analyzed_docs.append({
                "brand_id": item["brand_id"],
                "project_id": item.get("project_id"),
                "keyword_id": item.get("keyword_id"),
                "competitor_id": item.get("competitor_id"),
                "stat_date": stat_date,
                "sentiment": sentiment,
                "tokens": item.get("tokens", []),
                "source": item.get("source", "UNKNOWN")
            })
        
        if not analyzed_docs:
            return {
                "status": "error",
                "message": "감정분석된 데이터가 없습니다."
            }
        
        # 4. 통계 집계
        print("[파이프라인] 4단계: 통계 집계")
        daily_stats = aggregate_keyword_daily_stats(analyzed_docs)
        sentiment_stats = aggregate_keyword_sentiment_daily_stats(analyzed_docs)
        token_stats = aggregate_keyword_token_sentiment_stats(analyzed_docs)
        baseline_stats = aggregate_keyword_baseline_stats(daily_stats)
        
        # 5. 인사이트 생성
        print("[파이프라인] 5단계: 인사이트 생성")
        spike_infos = detect_spikes(daily_stats, sentiment_stats)
        insights = generate_insight_results(spike_infos)
        
        # 6. Spring 엔티티 형식으로 변환
        print("[파이프라인] 6단계: Spring 형식 변환")
        spring_daily_stats = transform_to_spring_daily_stats(daily_stats)
        spring_sentiment_stats = transform_to_spring_sentiment_stats(sentiment_stats)
        spring_token_stats = transform_to_spring_token_stats(token_stats)
        spring_baseline_stats = transform_to_spring_baseline_stats(baseline_stats)
        spring_insights = transform_to_spring_insights(insights)
        
        print(f"[파이프라인] 완료: daily_stats={len(spring_daily_stats)}, "
              f"sentiment_stats={len(spring_sentiment_stats)}, "
              f"token_stats={len(spring_token_stats)}, "
              f"baseline_stats={len(spring_baseline_stats)}, "
              f"insights={len(spring_insights)}")
        
        # 7. raw_data 파일에 sentiment 업데이트
        try:
            print("[파이프라인] 7단계: raw_data 파일 업데이트")
            update_raw_data_with_sentiment(file_path, analyzed_docs)
        except Exception as e:
            print(f"[파이프라인] raw_data 업데이트 실패 (계속 진행): {e}")
            # 업데이트 실패해도 분석 결과는 반환
        
        return {
            "status": "success",
            "daily_stats": spring_daily_stats,
            "sentiment_stats": spring_sentiment_stats,
            "token_stats": spring_token_stats,
            "baseline_stats": spring_baseline_stats,
            "insights": spring_insights
        }
    
    except Exception as e:
        import traceback
        error_msg = f"파이프라인 실행 중 오류: {str(e)}"
        print(f"[파이프라인 오류] {error_msg}")
        print(traceback.format_exc())
        return {
            "status": "error",
            "message": error_msg
        }


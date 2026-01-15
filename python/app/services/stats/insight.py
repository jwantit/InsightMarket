from datetime import date
from typing import List, Dict, Tuple
from collections import defaultdict
import statistics
from app.services.stats.enrich import enrich_spike_infos

SPIKE_THRESHOLD_RATIO = 0.2   # 20% 이상 급증일 때 spike
LOOKBACK_DAYS = 3             # 최근 3일 기준

def detect_spikes(
    daily_stats: List[Tuple[int, int | None, int | None, int | None, date, str, int]],
    sentiment_stats: List[Tuple[int, int | None, int | None, int | None, date, str, float, float, float]],
) -> List[Dict]:
    # (brand, project, keyword, competitor, date, source) -> sentiment ratios
    sentiment_map = {}
    for b, p, k, comp, d, src, pos, neg, neu in sentiment_stats:
        sentiment_map[(b, p, k, comp, d, src)] = {"POS": float(pos), "NEG": float(neg), "NEU": float(neu)}

    # group by (brand, project, keyword, competitor, source)
    stats_by_key = defaultdict(list)
    for brand_id, project_id, keyword_id, competitor_id, stat_date, src, mention_count in daily_stats:
        stats_by_key[(brand_id, project_id, keyword_id, competitor_id, src)].append((stat_date, mention_count))

    spike_info_list = []

    for (brand_id, project_id, keyword_id, competitor_id, src), records in stats_by_key.items():
        records.sort()
        if len(records) < 2:
            continue

        window = records[-(LOOKBACK_DAYS + 1):] if len(records) >= (LOOKBACK_DAYS + 1) else records
        dates, counts = zip(*window)

        baseline = statistics.mean(counts[:-1]) if len(counts) > 1 else counts[0]
        latest = counts[-1]

        spike_ratio = (latest - baseline) / baseline if baseline > 0 else 0.0
        is_spike = spike_ratio >= SPIKE_THRESHOLD_RATIO

        latest_date = dates[-1]
        senti = sentiment_map.get((brand_id, project_id, keyword_id, competitor_id, latest_date, src))
        dominant_sentiment = max(senti, key=senti.get) if senti else "NEU"

        spike_info_list.append({
            "brand_id": brand_id,
            "project_id": project_id,
            "keyword_id": keyword_id,
            "competitor_id": competitor_id,
            "stat_date": latest_date,
            "source": src,
            "is_spike": is_spike,
            "spike_ratio": round(spike_ratio * 100, 2),
            "period": LOOKBACK_DAYS,
            "dominant_sentiment": dominant_sentiment,
        })

    return spike_info_list


def generate_insight_text(info: Dict) -> str:
    dom_map = {"POS": "긍정", "NEG": "부정", "NEU": "중립"}
    dom = dom_map.get(info.get("dominant_sentiment"), "중립")

    # enrich로 붙인 문자열이 있으면 사용, 없으면 fallback
    brand = info.get("brand_name") or f"브랜드({info['brand_id']})"
    
    # project_id가 None인 경우 처리
    project_id = info.get("project_id")
    if project_id is not None:
        project = info.get("project_name") or f"프로젝트({project_id})"
    else:
        project = info.get("project_name") or "프로젝트"
    
    # keyword_id가 None인 경우 처리
    keyword_id = info.get("keyword_id")
    if keyword_id is not None:
        keyword = info.get("keyword_text") or f"키워드({keyword_id})"
    else:
        keyword = info.get("keyword_text") or "키워드"

    period = info.get("period", LOOKBACK_DAYS)
    ratio = info.get("spike_ratio", 0.0)

    if info.get("is_spike"):
        return (
            f"{brand}의 {project} 관련 '{keyword}' 언급량이 "
            f"최근 {period}일간 {ratio}% 증가했으며, {dom} 반응이 우세합니다."
        )
    else:
        return (
            f"{brand}의 {project} 관련 '{keyword}' 언급량은 "
            f"최근 {period}일간 큰 변동 없이 유지되며, {dom} 반응이 우세합니다."
        )


def generate_insight_results(spike_infos: List[Dict]) -> List[Dict]:
    """
    인사이트 결과 생성 (DB 삽입 없이 결과만 반환)
    
    Args:
        spike_infos: Spike 감지 결과 리스트
    
    Returns:
        List[Dict]: 인사이트 결과 리스트
            각 항목은 {
                "brand_id": int,
                "project_id": int | None,
                "keyword_id": int | None,
                "stat_date": date,
                "source": str,
                "insight_text": str,
                "confidence_score": float
            }
    """
    spike_infos = enrich_spike_infos(spike_infos)
    
    results = []
    for info in spike_infos:
        text = generate_insight_text(info)
        results.append({
            "brand_id": info["brand_id"],
            "project_id": info.get("project_id"),
            "keyword_id": info.get("keyword_id"),
            "competitor_id": info.get("competitor_id"),
            "stat_date": info["stat_date"],
            "source": info.get("source", "UNKNOWN"),
            "insight_text": text,
            "confidence_score": 1.0
        })
    
    return results

from datetime import date
from typing import List, Dict, Tuple
from collections import defaultdict
import statistics
from db.insert import insert_keyword_insight_result
from stats.enrich import enrich_spike_infos

SPIKE_THRESHOLD_RATIO = 0.2   # 20% 이상 급증일 때 spike
LOOKBACK_DAYS = 3             # 최근 3일 기준

def detect_spikes(
    daily_stats: List[Tuple[int, int, int, date, str, int]],
    sentiment_stats: List[Tuple[int, int, int, date, str, float, float, float]],
) -> List[Dict]:
    # (brand, project, keyword, date, source) -> sentiment ratios
    sentiment_map = {}
    for b, p, k, d, src, pos, neg, neu in sentiment_stats:
        sentiment_map[(b, p, k, d, src)] = {"POS": float(pos), "NEG": float(neg), "NEU": float(neu)}

    # group by (brand, project, keyword, source)
    stats_by_key = defaultdict(list)
    for brand_id, project_id, keyword_id, stat_date, src, mention_count in daily_stats:
        stats_by_key[(brand_id, project_id, keyword_id, src)].append((stat_date, mention_count))

    spike_info_list = []

    for (brand_id, project_id, keyword_id, src), records in stats_by_key.items():
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
        senti = sentiment_map.get((brand_id, project_id, keyword_id, latest_date, src))
        dominant_sentiment = max(senti, key=senti.get) if senti else "NEU"

        spike_info_list.append({
            "brand_id": brand_id,
            "project_id": project_id,
            "keyword_id": keyword_id,
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
    project = info.get("project_name") or f"프로젝트({info['project_id']})"
    keyword = info.get("keyword_text") or f"키워드({info['keyword_id']})"

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


def save_insight_results(spike_infos: List[Dict]):

    spike_infos = enrich_spike_infos(spike_infos)

    for info in spike_infos:
        text = generate_insight_text(info)
        insert_keyword_insight_result(
            brand_id=info["brand_id"],
            project_id=info["project_id"],
            keyword_id=info["keyword_id"],
            stat_date=info["stat_date"],
            insight_text=text,
            confidence_score=1.0,
            source=info.get("source", "UNKNOWN"),
        )

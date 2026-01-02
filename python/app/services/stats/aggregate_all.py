from collections import defaultdict
from datetime import date
from typing import List, Dict, Tuple
import statistics

# ==================================================
# 입력 데이터 형태
# analyzed_docs = [
#   {
#     "brand_id": int,
#     "project_id": int | None,
#     "keyword_id": int | None,
#     "competitor_id": int | None,
#     "stat_date": date,
#     "sentiment": "POS" | "NEG" | "NEU",
#     "tokens": [str, ...],
#     "source": "NAVER" | "YOUTUBE" | ...
#   }
# ]
# ==================================================

#집계 함수 

# --------------------------------------------------
# 1️⃣ 언급량 (analytics_keyword_daily_stats)
# --------------------------------------------------
def aggregate_keyword_daily_stats(
    analyzed_docs: List[Dict]
) -> List[Tuple[int, int | None, int | None, int | None, date, str, int]]:
    """
    return: (brand_id, project_id, keyword_id, competitor_id, stat_date, source, mention_count)
    """
    counter = defaultdict(int)

    for doc in analyzed_docs:
        key = (
            doc["brand_id"],
            doc.get("project_id"),
            doc.get("keyword_id"),
            doc.get("competitor_id"),
            doc["stat_date"],
            doc.get("source", "UNKNOWN")
        )
        counter[key] += 1

    return [
        (brand_id, project_id, keyword_id, competitor_id, stat_date, source, count)
        for (brand_id, project_id, keyword_id, competitor_id, stat_date, source), count in counter.items()
    ]


# --------------------------------------------------
# 2️⃣ 감성 비율 (analytics_keyword_sentiment_daily_stats)
# --------------------------------------------------
def aggregate_keyword_sentiment_daily_stats(
    analyzed_docs: List[Dict]
) -> List[Tuple[int, int | None, int | None, int | None, date, str, float, float, float]]:
    """
    return: (brand_id, project_id, keyword_id, competitor_id, stat_date, source, positive_ratio, negative_ratio, neutral_ratio)
    """
    counter = defaultdict(lambda: {"POS": 0, "NEG": 0, "NEU": 0})

    for doc in analyzed_docs:
        key = (
            doc["brand_id"],
            doc.get("project_id"),
            doc.get("keyword_id"),
            doc.get("competitor_id"),
            doc["stat_date"],
            doc.get("source", "UNKNOWN")
        )
        counter[key][doc["sentiment"]] += 1

    rows = []
    for (brand_id, project_id, keyword_id, competitor_id, stat_date, source), counts in counter.items():
        total = sum(counts.values())
        rows.append((
            brand_id,
            project_id,
            keyword_id,
            competitor_id,
            stat_date,
            source,
            round(counts["POS"] / total * 100, 2),
            round(counts["NEG"] / total * 100, 2),
            round(counts["NEU"] / total * 100, 2)
        ))

    return rows


# --------------------------------------------------
# 3️⃣ 워드클라우드 (analytics_keyword_token_sentiment_stats)
# --------------------------------------------------
def aggregate_keyword_token_sentiment_stats(
    analyzed_docs: List[Dict]
) -> List[Tuple[int, int | None, int | None, int | None, date, str, str, str, int]]:
    """
    return: (brand_id, project_id, keyword_id, competitor_id, stat_date, source, token, sentiment, token_count)
    """
    counter = defaultdict(int)

    for doc in analyzed_docs:
        source = doc.get("source", "UNKNOWN")
        for token in doc["tokens"]:
            key = (
                doc["brand_id"],
                doc.get("project_id"),
                doc.get("keyword_id"),
                doc.get("competitor_id"),
                doc["stat_date"],
                source,
                token,
                doc["sentiment"]
            )
            counter[key] += 1

    return [
        (brand_id, project_id, keyword_id, competitor_id, stat_date, source, token, sentiment, count)
        for (brand_id, project_id, keyword_id, competitor_id, stat_date, source, token, sentiment), count in counter.items()
    ]


# --------------------------------------------------
# 4️⃣ 기준선 / 이동 평균 (analytics_keyword_baseline_stats)
# --------------------------------------------------
def aggregate_keyword_baseline_stats(
    daily_stats: List[Tuple[int, int | None, int | None, int | None, date, str, int]]
) -> List[Tuple[int, int | None, int | None, int | None, str, int, int]]:
    """
    daily_stats = (brand_id, project_id, keyword_id, competitor_id, stat_date, source, mention_count)
    return: (brand_id, project_id, keyword_id, competitor_id, source, avg_mention_count, stddev_mention_count)
    """
    counter = defaultdict(list)

    for brand_id, project_id, keyword_id, competitor_id, _, source, mention_count in daily_stats:
        counter[(brand_id, project_id, keyword_id, competitor_id, source)].append(mention_count)

    rows = []
    for (brand_id, project_id, keyword_id, competitor_id, source), counts in counter.items():
        rows.append((
            brand_id,
            project_id,
            keyword_id,
            competitor_id,
            source,
            int(statistics.mean(counts)),
            int(statistics.pstdev(counts))
        ))

    return rows
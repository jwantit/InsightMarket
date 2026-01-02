from typing import Dict, List
from app.config.database import get_connection

def _fetch_map(sql: str, ids: List[int], key_col: str, val_col: str) -> Dict[int, str]:
    if not ids:
        return {}
    placeholders = ",".join(["%s"] * len(ids))
    sql = sql.format(placeholders=placeholders)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, ids)
            rows = cur.fetchall()

        # dict 커서 / tuple 커서 둘 다 처리
        result = {}
        for r in rows:
            if isinstance(r, dict):
                k = int(r[key_col])
                v = r[val_col]
            else:
                k = int(r[0])
                v = r[1]
            result[k] = v
        return result
    finally:
        conn.close()

def enrich_spike_infos(spike_infos: List[Dict]) -> List[Dict]:
    if not spike_infos:
        return spike_infos

    brand_ids = sorted({int(x["brand_id"]) for x in spike_infos})
    project_ids = sorted({int(x["project_id"]) for x in spike_infos})
    keyword_ids = sorted({int(x["keyword_id"]) for x in spike_infos})

    brand_map = _fetch_map(
        "SELECT brand_id, name FROM brand WHERE brand_id IN ({placeholders})",
        brand_ids,
        key_col="brand_id",
        val_col="name",
    )
    project_map = _fetch_map(
        "SELECT project_id, name FROM project WHERE project_id IN ({placeholders})",
        project_ids,
        key_col="project_id",
        val_col="name",
    )
    keyword_map = _fetch_map(
        "SELECT project_keyword_id, keyword FROM project_keyword WHERE project_keyword_id IN ({placeholders})",
        keyword_ids,
        key_col="project_keyword_id",
        val_col="keyword",
    )

    enriched = []
    for info in spike_infos:
        i = dict(info)
        i["brand_name"] = brand_map.get(int(i["brand_id"]), f"brand({i['brand_id']})")
        i["project_name"] = project_map.get(int(i["project_id"]), f"project({i['project_id']})")
        i["keyword_text"] = keyword_map.get(int(i["keyword_id"]), f"keyword({i['keyword_id']})")
        enriched.append(i)

    return enriched

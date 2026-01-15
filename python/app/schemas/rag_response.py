# app/schemas/rag_response.py
# ============================================================
# [기능] /rag/ask 응답 스키마(단순형)
# ============================================================

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RagAskResponse(BaseModel):
    ok: bool
    data: Optional[Dict[str, Any]] = None
    sources: Optional[List[Dict[str, Any]]] = None
    reason: Optional[str] = None
    raw: Optional[str] = None

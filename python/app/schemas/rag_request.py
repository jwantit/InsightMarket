# app/schemas/rag_request.py
# ============================================================
# [기능] /rag/ask 요청 스키마
# ============================================================

from pydantic import BaseModel, Field


class RagAskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    brandId: int = Field(..., ge=1)
    topK: int = Field(5, ge=1, le=20)

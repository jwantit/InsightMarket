# app/api/routes/health.py
# ✅ 헬스체크 엔드포인트

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

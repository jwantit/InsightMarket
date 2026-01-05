# app/config/settings.py
# ============================================================
# [기능] FastAPI Settings (환경변수 기반 설정)
# - Pydantic BaseSettings 사용
# - 환경변수 우선, 없으면 기본값 사용
# ============================================================

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # pydantic v1 호환성
    from pydantic import BaseSettings

from typing import Optional


class Settings(BaseSettings):
    # Qdrant 설정
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "im_chunks"
    
    # Ollama 설정
    ollama_url: str = "http://localhost:11434/api/generate"
    ollama_model: str = "qwen3:1.7b"
    ollama_timeout_sec: int = 600
    
    # OpenAI 설정
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    openai_timeout_sec: int = 300
    
    # Embedding 모델 설정
    embed_model_name: str = "nlpai-lab/KoE5"
    
    # 인덱싱 설정
    chunk_max_chars: int = 450
    chunk_overlap: int = 50
    
    # Spring API 설정 (indexer에서 사용)
    spring_api_base_url: Optional[str] = None  # 예: "http://localhost:8080"
    
    # API 키 설정 (데이터 수집용)
    youtube_api_key: Optional[str] = None
    naver_client_id: Optional[str] = None
    naver_client_secret: Optional[str] = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # 정의되지 않은 필드는 무시


# 싱글톤 인스턴스
settings = Settings()


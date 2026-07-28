from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./bench_allocator.db"
    cors_origin: str = "http://localhost:5173"
    auth_cookie_name: str = "auth_token"
    rag_mode: str = "hybrid"
    rag_openai_api_key: str | None = None
    rag_openai_embedding_model: str = "text-embedding-3-small"
    rag_cloud_timeout_seconds: float = 20.0

    model_config = SettingsConfigDict(env_prefix="BACKEND_", env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()

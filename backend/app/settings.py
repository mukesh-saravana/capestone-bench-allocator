from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./bench_allocator.db"
    cors_origin: str = "http://localhost:5173"
    auth_cookie_name: str = "auth_token"

    model_config = SettingsConfigDict(env_prefix="BACKEND_", env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()

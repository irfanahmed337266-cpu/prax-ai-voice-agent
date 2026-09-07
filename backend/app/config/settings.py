from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration.

    Values are loaded from backend/.env
    and environment variables.
    """

    app_name: str = "PRAX Configurable Chatbot Platform"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_key: str = Field(default="", alias="SUPABASE_KEY")

    # Encryption
    encryption_key: str = Field(default="", alias="ENCRYPTION_KEY")

    # API
    api_prefix: str = "/api"

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    def validate_required_settings(self) -> None:
        missing = []

        if not self.supabase_url:
            missing.append("SUPABASE_URL")

        if not self.supabase_key:
            missing.append("SUPABASE_KEY")

        if not self.encryption_key:
            missing.append("ENCRYPTION_KEY")

        if missing:
            raise RuntimeError(
                "Missing required environment variables: "
                + ", ".join(missing)
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
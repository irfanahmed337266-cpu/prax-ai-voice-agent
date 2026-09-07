from typing import Literal, Optional

from pydantic import BaseModel, Field


SupportedProvider = Literal[
    "gemini",
    "openai",
    "anthropic",
]


class AIProviderCreate(BaseModel):
    chatbot_id: str
    provider: SupportedProvider
    model: str = Field(
        min_length=1,
        max_length=150,
    )
    api_key: str = Field(
        min_length=1,
        max_length=1000,
    )


class AIProviderUpdate(BaseModel):
    provider: Optional[SupportedProvider] = None

    model: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    api_key: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=1000,
    )

    is_active: Optional[bool] = None


class AIProviderResponse(BaseModel):
    id: str
    chatbot_id: str
    provider: str
    model: str
    is_active: bool
    has_api_key: bool


class AIProviderGenerateRequest(BaseModel):
    system_prompt: str = Field(
        default="You are a helpful business assistant.",
        max_length=20000,
    )

    user_message: str = Field(
        min_length=1,
        max_length=20000,
    )


class AIProviderGenerateResponse(BaseModel):
    success: bool
    provider: str
    model: str
    content: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
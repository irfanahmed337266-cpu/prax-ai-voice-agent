from typing import Any

from pydantic import BaseModel, Field


class KnowledgeBaseCreateRequest(BaseModel):
    chatbot_id: str = Field(
        min_length=1,
        max_length=100,
    )

    name: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    is_active: bool = True


class KnowledgeBaseUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=2000,
    )

    is_active: bool | None = None


class KnowledgeBaseResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    description: str | None = None
    is_active: bool
    created_at: str | None = None
    updated_at: str | None = None


class KnowledgeBaseDetailResponse(
    KnowledgeBaseResponse
):
    document_count: int = 0
    chunk_count: int = 0
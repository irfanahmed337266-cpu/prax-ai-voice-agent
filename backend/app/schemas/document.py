from typing import Any

from pydantic import BaseModel, Field


class DocumentCreateRequest(BaseModel):
    knowledge_base_id: str
    name: str = Field(
        min_length=1,
        max_length=500,
    )
    source_type: str = Field(
        default="text",
        min_length=1,
        max_length=50,
    )
    content: str = Field(
        min_length=1,
        max_length=5_000_000,
    )
    source_url: str | None = None
    mime_type: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )


class DocumentResponse(BaseModel):
    id: str
    knowledge_base_id: str
    name: str
    source_type: str
    source_url: str | None = None
    storage_path: str | None = None
    mime_type: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )
    created_at: str | None = None


class DocumentIngestionResponse(
    DocumentResponse
):
    chunk_count: int = 0
    embedding_count: int = 0


class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    content: str
    chunk_index: int
    metadata: dict[str, Any] = Field(
        default_factory=dict
    )
    created_at: str | None = None
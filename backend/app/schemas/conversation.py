from typing import Any

from pydantic import BaseModel, Field


class ConversationCreateRequest(BaseModel):
    chatbot_id: str
    current_stage_id: str | None = None


class ConversationResponse(BaseModel):
    id: str
    chatbot_id: str
    current_stage_id: str | None = None
    state: dict[str, Any] = Field(
        default_factory=dict
    )
    status: str
    created_at: str | None = None
    updated_at: str | None = None


class ConversationMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str | None = None


class ConversationWithMessagesResponse(BaseModel):
    conversation: ConversationResponse
    messages: list[
        ConversationMessageResponse
    ]


class ConversationStateUpdateRequest(BaseModel):
    state: dict[str, Any] = Field(
        default_factory=dict
    )


class ConversationStatusResponse(BaseModel):
    id: str
    status: str
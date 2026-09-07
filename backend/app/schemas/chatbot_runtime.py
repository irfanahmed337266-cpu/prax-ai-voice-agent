from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    chatbot_id: str
    conversation_id: str
    user_message: str = Field(
        min_length=1,
        max_length=20000,
    )


class ChatResponse(BaseModel):
    chatbot_id: str
    conversation_id: str
    response: str
    current_stage: dict | None = None
    provider: str | None = None
    model: str | None = None
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    handoff_required: bool = False
    handoff_reason: str = ""
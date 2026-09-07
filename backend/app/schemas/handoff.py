from pydantic import BaseModel, Field


class HandoffRuleCreateRequest(BaseModel):
    chatbot_id: str = Field(
        min_length=1,
        max_length=100,
    )
    name: str = Field(
        min_length=1,
        max_length=200,
    )
    condition: str = Field(
        min_length=1,
        max_length=1000,
    )
    priority: int = 0
    is_active: bool = True


class HandoffRuleUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    condition: str | None = Field(
        default=None,
        min_length=1,
        max_length=1000,
    )
    priority: int | None = None
    is_active: bool | None = None


class HandoffRuleResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    condition: str
    priority: int
    is_active: bool
    created_at: str | None = None


class HandoffEvaluationResponse(BaseModel):
    handoff_required: bool
    handoff_reason: str = ""
    matched_rule_id: str | None = None
    matched_rule_name: str | None = None
    handoff_status: str | None = None
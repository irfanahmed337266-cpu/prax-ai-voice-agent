from datetime import datetime

from pydantic import BaseModel, Field, field_validator


# =========================================================
# CHATBOT
# =========================================================


class ChatbotUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    business_name: str | None = Field(default=None, max_length=200)
    use_case: str | None = Field(default=None, max_length=500)
    website_url: str | None = None
    system_prompt: str | None = None
    is_active: bool | None = None

    @field_validator(
        "name",
        "business_name",
        "use_case",
        "website_url",
        "system_prompt",
    )
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        return value


class ChatbotAdminResponse(BaseModel):
    id: str
    name: str
    business_name: str | None = None
    use_case: str | None = None
    website_url: str | None = None
    system_prompt: str | None = None
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


# =========================================================
# STAGES
# =========================================================


class StageCreateRequest(BaseModel):
    chatbot_id: str = Field(min_length=1)

    name: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    stage_order: int = Field(
        default=0,
        ge=0,
    )

    is_start: bool = False
    is_terminal: bool = False

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Stage name cannot be empty.")

        return value

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class StageUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    stage_order: int | None = Field(
        default=None,
        ge=0,
    )

    is_start: bool | None = None
    is_terminal: bool | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Stage name cannot be empty.")

        return value

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class StageResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    description: str | None = None
    stage_order: int
    is_start: bool
    is_terminal: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


# =========================================================
# STAGE TRANSITIONS
# =========================================================


class TransitionCreateRequest(BaseModel):
    chatbot_id: str = Field(min_length=1)
    from_stage_id: str = Field(min_length=1)
    to_stage_id: str = Field(min_length=1)
    condition: str | None = None
    priority: int = 0

    @field_validator("condition")
    @classmethod
    def validate_condition(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class TransitionUpdateRequest(BaseModel):
    from_stage_id: str | None = None
    to_stage_id: str | None = None
    condition: str | None = None
    priority: int | None = None

    @field_validator("condition")
    @classmethod
    def validate_condition(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class TransitionResponse(BaseModel):
    id: str
    chatbot_id: str
    from_stage_id: str
    to_stage_id: str
    condition: str | None = None
    priority: int
    created_at: datetime | None = None


# =========================================================
# KNOWLEDGE BASE
# =========================================================


class KnowledgeBaseResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    description: str | None = None
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class KnowledgeBaseUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Knowledge base name cannot be empty."
            )

        return value

    @field_validator("description")
    @classmethod
    def validate_description(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


# =========================================================
# HANDOFF RULE
# =========================================================


class HandoffRuleResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    condition: str
    priority: int
    is_active: bool
    created_at: datetime | None = None


# =========================================================
# BRANDING
# =========================================================


class BrandingAdminResponse(BaseModel):
    id: str | None = None
    chatbot_id: str

    primary_color: str | None = None
    secondary_color: str | None = None
    logo_url: str | None = None
    bot_name: str | None = None
    welcome_message: str | None = None
    widget_position: str


# =========================================================
# AI PROVIDER
# =========================================================


class AIProviderAdminResponse(BaseModel):
    id: str
    chatbot_id: str
    provider: str
    model: str
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


# =========================================================
# CENTRAL CONFIGURATION
# =========================================================


class ChatbotConfigurationResponse(BaseModel):
    chatbot: ChatbotAdminResponse
    stages: list[StageResponse]
    transitions: list[TransitionResponse]
    knowledge_bases: list[KnowledgeBaseResponse]
    handoff_rules: list[HandoffRuleResponse]
    branding: BrandingAdminResponse
    ai_providers: list[AIProviderAdminResponse]
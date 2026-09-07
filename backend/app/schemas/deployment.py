from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class DeploymentCreateRequest(BaseModel):
    chatbot_id: str = Field(min_length=1)
    name: str = Field(
        default="Website Deployment",
        min_length=1,
        max_length=200,
    )
    allowed_domains: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Deployment name cannot be empty.")

        return value

    @field_validator("allowed_domains")
    @classmethod
    def validate_domains(
        cls,
        value: list[str],
    ) -> list[str]:
        cleaned: list[str] = []

        for domain in value:
            domain = domain.strip().lower()

            if not domain:
                continue

            if len(domain) > 255:
                raise ValueError(
                    "Each allowed domain must be 255 characters or fewer."
                )

            cleaned.append(domain)

        return list(dict.fromkeys(cleaned))


class DeploymentUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    allowed_domains: list[str] | None = None
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def validate_name(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Deployment name cannot be empty."
            )

        return value

    @field_validator("allowed_domains")
    @classmethod
    def validate_domains(
        cls,
        value: list[str] | None,
    ) -> list[str] | None:
        if value is None:
            return None

        cleaned: list[str] = []

        for domain in value:
            domain = domain.strip().lower()

            if not domain:
                continue

            if len(domain) > 255:
                raise ValueError(
                    "Each allowed domain must be 255 characters or fewer."
                )

            cleaned.append(domain)

        return list(dict.fromkeys(cleaned))


class DeploymentResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    key_prefix: str
    allowed_domains: list[str]
    is_active: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DeploymentCreateResponse(DeploymentResponse):
    deployment_key: str


class DeploymentRotateKeyResponse(BaseModel):
    id: str
    chatbot_id: str
    name: str
    key_prefix: str
    allowed_domains: list[str]
    is_active: bool
    deployment_key: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DeploymentPublicResponse(BaseModel):
    deployment_id: str
    chatbot_id: str
    chatbot_name: str
    business_name: str | None = None
    use_case: str | None = None
    is_active: bool
    branding: dict
    welcome_message: str | None = None
    allowed_domains: list[str]
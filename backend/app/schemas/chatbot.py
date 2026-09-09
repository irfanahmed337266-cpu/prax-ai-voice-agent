from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ChatbotCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    business_name: Optional[str] = Field(default=None, max_length=200)
    use_case: Optional[str] = Field(default=None, max_length=500)
    website_url: Optional[HttpUrl] = None
    system_prompt: Optional[str] = None
    is_active: bool = True


class ChatbotUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    business_name: Optional[str] = Field(default=None, max_length=200)
    use_case: Optional[str] = Field(default=None, max_length=500)
    website_url: Optional[HttpUrl] = None
    system_prompt: Optional[str] = None
    is_active: Optional[bool] = None


class ChatbotAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    business_name: Optional[str] = None
    use_case: Optional[str] = None
    website_url: Optional[str] = None
    system_prompt: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ChatbotListResponse(BaseModel):
    items: list[ChatbotAdminResponse]
    total: int
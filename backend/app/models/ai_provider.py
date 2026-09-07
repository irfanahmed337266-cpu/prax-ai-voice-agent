from dataclasses import dataclass
from typing import Optional


@dataclass
class AIProvider:
    id: Optional[str] = None
    chatbot_id: Optional[str] = None
    provider: str = "gemini"
    model: str = "gemini-2.5-flash"
    api_key_encrypted: Optional[str] = None
    is_active: bool = True
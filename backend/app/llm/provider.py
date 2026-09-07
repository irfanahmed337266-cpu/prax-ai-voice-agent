from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class LLMResponse:
    content: str
    provider: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    raw_response: dict[str, Any] | None = None


class LLMProvider(ABC):
    provider_name: str

    def __init__(self, api_key: str, model: str):
        if not api_key:
            raise ValueError("API key is required.")

        if not model:
            raise ValueError("Model is required.")

        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def test_connection(self) -> dict[str, Any]:
        """Verify that the API key and model are usable."""
        raise NotImplementedError

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_message: str,
    ) -> LLMResponse:
        """Generate an AI response."""
        raise NotImplementedError
from app.llm.anthropic import AnthropicProvider
from app.llm.gemini import GeminiProvider
from app.llm.openai import OpenAIProvider
from app.llm.provider import LLMProvider


class LLMProviderFactory:

    @staticmethod
    def create(
        provider: str,
        api_key: str,
        model: str,
    ) -> LLMProvider:

        normalized_provider = provider.strip().lower()

        if normalized_provider == "gemini":
            return GeminiProvider(
                api_key=api_key,
                model=model,
            )

        if normalized_provider == "openai":
            return OpenAIProvider(
                api_key=api_key,
                model=model,
            )

        if normalized_provider == "anthropic":
            return AnthropicProvider(
                api_key=api_key,
                model=model,
            )

        raise ValueError(
            f"Unsupported AI provider: {provider}"
        )
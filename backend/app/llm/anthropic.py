from typing import Any

import httpx

from app.llm.provider import LLMProvider, LLMResponse


class AnthropicProvider(LLMProvider):
    provider_name = "anthropic"

    BASE_URL = "https://api.anthropic.com/v1/messages"

    ANTHROPIC_VERSION = "2023-06-01"

    async def test_connection(self) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "max_tokens": 20,
            "messages": [
                {
                    "role": "user",
                    "content": "Reply with exactly: CONNECTION_OK",
                }
            ],
        }

        headers = self._headers()

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.BASE_URL,
                headers=headers,
                json=payload,
            )

        if response.status_code >= 400:
            self._raise_api_error(response)

        return {
            "success": True,
            "provider": self.provider_name,
            "model": self.model,
            "message": "Anthropic connection successful.",
        }

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
    ) -> LLMResponse:

        payload: dict[str, Any] = {
            "model": self.model,
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": user_message,
                }
            ],
        }

        if system_prompt:
            payload["system"] = system_prompt

        headers = self._headers()

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.BASE_URL,
                headers=headers,
                json=payload,
            )

        if response.status_code >= 400:
            self._raise_api_error(response)

        data = response.json()

        try:
            content_blocks = data["content"]

            text_blocks = [
                block["text"]
                for block in content_blocks
                if block.get("type") == "text"
            ]

            content = "\n".join(text_blocks)

        except (KeyError, TypeError, IndexError) as exc:
            raise RuntimeError(
                "Anthropic returned an unexpected response."
            ) from exc

        if not content:
            raise RuntimeError(
                "Anthropic returned an empty response."
            )

        usage = data.get("usage", {})

        input_tokens = int(
            usage.get("input_tokens", 0)
        )

        output_tokens = int(
            usage.get("output_tokens", 0)
        )

        total_tokens = (
            input_tokens + output_tokens
        )

        return LLMResponse(
            content=content,
            provider=self.provider_name,
            model=self.model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            raw_response=data,
        )

    def _headers(self) -> dict[str, str]:
        return {
            "x-api-key": self.api_key,
            "anthropic-version": self.ANTHROPIC_VERSION,
            "Content-Type": "application/json",
        }

    @staticmethod
    def _raise_api_error(
        response: httpx.Response,
    ) -> None:

        try:
            data = response.json()
            error = data.get("error", {})
            message = error.get(
                "message",
                "Anthropic API request failed.",
            )
        except Exception:
            message = "Anthropic API request failed."

        raise RuntimeError(
            f"Anthropic API error ({response.status_code}): "
            f"{message}"
        )
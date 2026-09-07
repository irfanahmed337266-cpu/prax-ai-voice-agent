from typing import Any

import httpx

from app.llm.provider import LLMProvider, LLMResponse


class OpenAIProvider(LLMProvider):
    provider_name = "openai"

    BASE_URL = "https://api.openai.com/v1/chat/completions"

    async def test_connection(self) -> dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": "Reply with exactly: CONNECTION_OK",
                }
            ],
            "temperature": 0,
            "max_tokens": 20,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

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
            "message": "OpenAI connection successful.",
        }

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
    ) -> LLMResponse:

        messages: list[dict[str, str]] = []

        if system_prompt:
            messages.append(
                {
                    "role": "system",
                    "content": system_prompt,
                }
            )

        messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )

        payload = {
            "model": self.model,
            "messages": messages,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

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
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(
                "OpenAI returned an unexpected response."
            ) from exc

        usage = data.get("usage", {})

        input_tokens = int(
            usage.get("prompt_tokens", 0)
        )

        output_tokens = int(
            usage.get("completion_tokens", 0)
        )

        total_tokens = int(
            usage.get("total_tokens", 0)
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

    @staticmethod
    def _raise_api_error(
        response: httpx.Response,
    ) -> None:

        try:
            data = response.json()
            error = data.get("error", {})
            message = error.get(
                "message",
                "OpenAI API request failed.",
            )
        except Exception:
            message = "OpenAI API request failed."

        raise RuntimeError(
            f"OpenAI API error ({response.status_code}): "
            f"{message}"
        )
from typing import Any

import httpx

from app.llm.provider import LLMProvider, LLMResponse


class GeminiProvider(LLMProvider):
    provider_name = "gemini"

    BASE_URL = (
        "https://generativelanguage.googleapis.com"
        "/v1beta/models"
    )

    async def test_connection(self) -> dict[str, Any]:
        url = (
            f"{self.BASE_URL}/{self.model}:generateContent"
            f"?key={self.api_key}"
        )

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": "Reply with exactly: CONNECTION_OK"
                        }
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0,
                "maxOutputTokens": 20,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                json=payload,
            )

        if response.status_code >= 400:
            self._raise_api_error(response)

        response.json()

        return {
            "success": True,
            "provider": self.provider_name,
            "model": self.model,
            "message": "Gemini connection successful.",
        }

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
    ) -> LLMResponse:

        url = (
            f"{self.BASE_URL}/{self.model}:generateContent"
            f"?key={self.api_key}"
        )

        payload: dict[str, Any] = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": user_message
                        }
                    ],
                }
            ]
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [
                    {
                        "text": system_prompt
                    }
                ]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json=payload,
            )

        if response.status_code >= 400:
            self._raise_api_error(response)

        data = response.json()

        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(
                "Gemini returned an unexpected response."
            ) from exc

        usage = data.get("usageMetadata", {})

        input_tokens = int(
            usage.get("promptTokenCount", 0)
        )

        output_tokens = int(
            usage.get("candidatesTokenCount", 0)
        )

        total_tokens = int(
            usage.get("totalTokenCount", 0)
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
                "Gemini API request failed.",
            )
        except Exception:
            message = "Gemini API request failed."

        raise RuntimeError(
            f"Gemini API error ({response.status_code}): "
            f"{message}"
        )
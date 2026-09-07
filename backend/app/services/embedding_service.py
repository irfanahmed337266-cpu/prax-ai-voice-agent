from dataclasses import dataclass
from typing import Any

import httpx

from app.security.credentials import get_credential_manager
from app.services.ai_provider_service import AIProviderService


@dataclass
class EmbeddingResult:
    provider: str
    model: str
    embedding: list[float]


class EmbeddingService:
    """
    Embedding service for PRAX RAG.

    Storage dimension:
        1536

    Supported providers:
        Gemini
        OpenAI

    Gemini:
        gemini-embedding-001

    OpenAI:
        text-embedding-3-small
    """

    VECTOR_DIMENSIONS = 1536

    GEMINI_MODEL = "gemini-embedding-001"
    OPENAI_MODEL = "text-embedding-3-small"

    GEMINI_ENDPOINT = (
        "https://generativelanguage.googleapis.com/"
        "v1beta/models/"
    )

    OPENAI_ENDPOINT = (
        "https://api.openai.com/v1/embeddings"
    )

    def __init__(self) -> None:
        self.ai_provider_service = AIProviderService()
        self.credentials = get_credential_manager()

    # =========================================================
    # PROVIDER SELECTION
    # =========================================================

    def _get_embedding_provider(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        providers = (
            self.ai_provider_service
            .list_providers_for_chatbot(
                chatbot_id=chatbot_id
            )
        )

        active = [
            provider
            for provider in providers
            if provider.get("is_active") is True
            and provider.get("provider")
            in {"gemini", "openai"}
        ]

        if not active:
            raise ValueError(
                "No active Gemini or OpenAI provider "
                "is configured for this chatbot. "
                "An embedding-capable provider is "
                "required for RAG."
            )

        # Prefer Gemini when available because the
        # current PRAX test chatbot already uses Gemini.
        for provider in active:
            if provider.get("provider") == "gemini":
                return provider

        return active[0]

    # =========================================================
    # DOCUMENT EMBEDDING
    # =========================================================

    async def embed_text(
        self,
        chatbot_id: str,
        text: str,
    ) -> EmbeddingResult:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        text = text.strip()

        if not text:
            raise ValueError(
                "Cannot create an embedding "
                "for empty text."
            )

        provider = self._get_embedding_provider(
            chatbot_id
        )

        provider_name = provider["provider"]

        encrypted_key = provider.get(
            "api_key_encrypted"
        )

        if not encrypted_key:
            raise ValueError(
                "Configured AI provider has no "
                "encrypted API key."
            )

        api_key = self.credentials.reveal(
            encrypted_key
        )

        if provider_name == "gemini":
            return await self._embed_gemini(
                api_key=api_key,
                text=text,
                task_type="RETRIEVAL_DOCUMENT",
            )

        if provider_name == "openai":
            return await self._embed_openai(
                api_key=api_key,
                text=text,
            )

        raise ValueError(
            f"Unsupported embedding provider: "
            f"{provider_name}"
        )

    # =========================================================
    # MULTIPLE DOCUMENT EMBEDDINGS
    # =========================================================

    async def embed_texts(
        self,
        chatbot_id: str,
        texts: list[str],
    ) -> list[EmbeddingResult]:

        if not texts:
            return []

        results: list[EmbeddingResult] = []

        for text in texts:
            results.append(
                await self.embed_text(
                    chatbot_id=chatbot_id,
                    text=text,
                )
            )

        return results

    # =========================================================
    # QUERY EMBEDDING
    # =========================================================

    async def embed_query(
        self,
        chatbot_id: str,
        query: str,
    ) -> EmbeddingResult:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        query = query.strip()

        if not query:
            raise ValueError(
                "Cannot create an embedding "
                "for an empty query."
            )

        provider = self._get_embedding_provider(
            chatbot_id
        )

        provider_name = provider["provider"]

        encrypted_key = provider.get(
            "api_key_encrypted"
        )

        if not encrypted_key:
            raise ValueError(
                "Configured AI provider has no "
                "encrypted API key."
            )

        api_key = self.credentials.reveal(
            encrypted_key
        )

        if provider_name == "gemini":
            return await self._embed_gemini(
                api_key=api_key,
                text=query,
                task_type="RETRIEVAL_QUERY",
            )

        if provider_name == "openai":
            return await self._embed_openai(
                api_key=api_key,
                text=query,
            )

        raise ValueError(
            f"Unsupported embedding provider: "
            f"{provider_name}"
        )

    # =========================================================
    # GEMINI EMBEDDING
    # =========================================================

    async def _embed_gemini(
        self,
        api_key: str,
        text: str,
        task_type: str,
    ) -> EmbeddingResult:

        if task_type not in {
            "RETRIEVAL_DOCUMENT",
            "RETRIEVAL_QUERY",
        }:
            raise ValueError(
                "Invalid Gemini embedding task type: "
                f"{task_type}"
            )

        url = (
            self.GEMINI_ENDPOINT
            + f"{self.GEMINI_MODEL}:embedContent"
        )

        # IMPORTANT:
        #
        # Gemini embedding-001 defaults to 3072
        # dimensions.
        #
        # PRAX database uses vector(1536).
        #
        # We therefore explicitly request 1536.
        #
        # The top-level outputDimensionality field is
        # supported by the Gemini REST API and ensures
        # the returned vector matches our pgvector schema.

        payload = {
            "model": f"models/{self.GEMINI_MODEL}",
            "content": {
                "parts": [
                    {
                        "text": text,
                    }
                ]
            },
            "taskType": task_type,
            "outputDimensionality": self.VECTOR_DIMENSIONS,
        }

        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=60.0
        ) as client:

            response = await client.post(
                url,
                json=payload,
                headers=headers,
            )

        if response.status_code >= 400:
            raise RuntimeError(
                "Gemini embedding API error "
                f"({response.status_code}): "
                f"{response.text}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise RuntimeError(
                "Gemini embedding API returned "
                "invalid JSON."
            ) from exc

        embedding_object = data.get(
            "embedding"
        )

        if not isinstance(
            embedding_object,
            dict,
        ):
            raise RuntimeError(
                "Gemini embedding API returned "
                "an invalid embedding response."
            )

        embedding = embedding_object.get(
            "values"
        )

        if not isinstance(
            embedding,
            list,
        ):
            raise RuntimeError(
                "Gemini embedding API returned "
                "no vector values."
            )

        self._validate_embedding(
            embedding
        )

        return EmbeddingResult(
            provider="gemini",
            model=self.GEMINI_MODEL,
            embedding=embedding,
        )

    # =========================================================
    # OPENAI EMBEDDING
    # =========================================================

    async def _embed_openai(
        self,
        api_key: str,
        text: str,
    ) -> EmbeddingResult:

        payload = {
            "model": self.OPENAI_MODEL,
            "input": text,
            "dimensions": self.VECTOR_DIMENSIONS,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=60.0
        ) as client:

            response = await client.post(
                self.OPENAI_ENDPOINT,
                json=payload,
                headers=headers,
            )

        if response.status_code >= 400:
            raise RuntimeError(
                "OpenAI embedding API error "
                f"({response.status_code}): "
                f"{response.text}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise RuntimeError(
                "OpenAI embedding API returned "
                "invalid JSON."
            ) from exc

        embedding_data = data.get(
            "data"
        ) or []

        if not embedding_data:
            raise RuntimeError(
                "OpenAI embedding API returned "
                "no embedding."
            )

        embedding = (
            embedding_data[0].get(
                "embedding"
            )
            or []
        )

        self._validate_embedding(
            embedding
        )

        return EmbeddingResult(
            provider="openai",
            model=self.OPENAI_MODEL,
            embedding=embedding,
        )

    # =========================================================
    # VALIDATION
    # =========================================================

    def _validate_embedding(
        self,
        embedding: list[float],
    ) -> None:

        if not embedding:
            raise RuntimeError(
                "Embedding provider returned "
                "an empty vector."
            )

        if len(embedding) != self.VECTOR_DIMENSIONS:
            raise RuntimeError(
                "Embedding dimension mismatch. "
                f"Expected "
                f"{self.VECTOR_DIMENSIONS}, "
                f"received {len(embedding)}."
            )

        try:
            for value in embedding:
                float(value)
        except (TypeError, ValueError) as exc:
            raise RuntimeError(
                "Embedding provider returned "
                "a vector containing non-numeric "
                "values."
            ) from exc


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
from typing import Any

from app.llm.factory import LLMProviderFactory
from app.llm.provider import LLMResponse
from app.security.credentials import get_credential_manager
from app.supabase.client import get_supabase_client


class AIProviderService:
    TABLE_NAME = "ai_providers"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

        # Correct Phase 1 credential manager initialization.
        self.credentials = get_credential_manager()

    def create_provider(
        self,
        chatbot_id: str,
        provider: str,
        model: str,
        api_key: str,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        if not provider:
            raise ValueError(
                "provider is required."
            )

        if not model:
            raise ValueError(
                "model is required."
            )

        if not api_key:
            raise ValueError(
                "api_key is required."
            )

        encrypted_key = self.credentials.protect(
            api_key
        )

        payload = {
            "chatbot_id": chatbot_id,
            "provider": provider,
            "model": model,
            "api_key_encrypted": encrypted_key,
            "is_active": True,
        }

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create AI provider "
                "configuration."
            )

        return self._safe_response(
            response.data[0]
        )

    def get_provider(
        self,
        provider_id: str,
    ) -> dict[str, Any]:

        if not provider_id:
            raise ValueError(
                "provider_id is required."
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("id", provider_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"AI provider '{provider_id}' not found."
            )

        return response.data

    def list_providers_for_chatbot(
        self,
        chatbot_id: str,
        active_only: bool = False,
    ) -> list[dict[str, Any]]:
        """
        Return provider records belonging to a chatbot.

        This method intentionally returns the internal
        database records, including api_key_encrypted,
        because backend services such as the embedding
        service need to decrypt the customer's BYOK key.

        This method must never be exposed directly through
        a public API response.
        """

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        query = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("chatbot_id", chatbot_id)
        )

        if active_only:
            query = query.eq(
                "is_active",
                True,
            )

        response = (
            query
            .order("created_at")
            .execute()
        )

        return response.data or []

    def get_active_providers_for_chatbot(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:
        """
        Convenience method for runtime services that need
        active providers only.
        """

        return self.list_providers_for_chatbot(
            chatbot_id=chatbot_id,
            active_only=True,
        )

    def get_provider_for_chatbot(
        self,
        chatbot_id: str,
    ) -> dict[str, Any] | None:

        providers = (
            self.list_providers_for_chatbot(
                chatbot_id=chatbot_id,
                active_only=True,
            )
        )

        if not providers:
            return None

        return providers[0]

    def get_decrypted_api_key(
        self,
        provider_id: str,
    ) -> str:

        record = self.get_provider(
            provider_id
        )

        encrypted_key = record.get(
            "api_key_encrypted"
        )

        if not encrypted_key:
            raise ValueError(
                "No API key configured for this provider."
            )

        return self.credentials.reveal(
            encrypted_key
        )

    def update_provider(
        self,
        provider_id: str,
        updates: dict[str, Any],
    ) -> dict[str, Any]:

        if not provider_id:
            raise ValueError(
                "provider_id is required."
            )

        updates = dict(updates)

        if "api_key" in updates:
            api_key = updates.pop("api_key")

            if api_key:
                updates["api_key_encrypted"] = (
                    self.credentials.protect(
                        api_key
                    )
                )

        if not updates:
            return self._safe_response(
                self.get_provider(
                    provider_id
                )
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .update(updates)
            .eq("id", provider_id)
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"AI provider '{provider_id}' not found."
            )

        return self._safe_response(
            response.data[0]
        )

    def delete_provider(
        self,
        provider_id: str,
    ) -> bool:

        if not provider_id:
            raise ValueError(
                "provider_id is required."
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .delete()
            .eq("id", provider_id)
            .execute()
        )

        return bool(response.data)

    async def test_connection(
        self,
        provider_id: str,
    ) -> dict[str, Any]:

        record = self.get_provider(
            provider_id
        )

        api_key = self.get_decrypted_api_key(
            provider_id
        )

        provider = LLMProviderFactory.create(
            provider=record["provider"],
            api_key=api_key,
            model=record["model"],
        )

        return await provider.test_connection()

    async def generate_response(
        self,
        provider_id: str,
        system_prompt: str,
        user_message: str,
    ) -> LLMResponse:

        if not user_message.strip():
            raise ValueError(
                "User message cannot be empty."
            )

        record = self.get_provider(
            provider_id
        )

        if not record.get("is_active"):
            raise ValueError(
                "This AI provider is inactive."
            )

        api_key = self.get_decrypted_api_key(
            provider_id
        )

        provider = LLMProviderFactory.create(
            provider=record["provider"],
            api_key=api_key,
            model=record["model"],
        )

        return await provider.generate(
            system_prompt=system_prompt,
            user_message=user_message,
        )

    @staticmethod
    def _safe_response(
        record: dict[str, Any],
    ) -> dict[str, Any]:

        return {
            "id": record["id"],
            "chatbot_id": record["chatbot_id"],
            "provider": record["provider"],
            "model": record["model"],
            "is_active": record["is_active"],
            "has_api_key": bool(
                record.get("api_key_encrypted")
            ),
        }
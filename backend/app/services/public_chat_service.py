from typing import Any

from app.services.chatbot_service import (
    get_chatbot_runtime_service,
)
from app.services.deployment_service import (
    get_deployment_service,
)
from app.supabase.client import get_supabase_client


class PublicChatService:
    CONVERSATIONS_TABLE = "conversations"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()
        self.deployment_service = (
            get_deployment_service()
        )
        self.runtime_service = (
            get_chatbot_runtime_service()
        )

    def _validate_conversation(
        self,
        conversation_id: str,
        chatbot_id: str,
    ) -> dict[str, Any]:
        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table(self.CONVERSATIONS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "status,"
                "current_stage_id"
            )
            .eq(
                "id",
                conversation_id,
            )
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                "Conversation not found."
            )

        conversation = data[0]

        if conversation.get("chatbot_id") != chatbot_id:
            raise PermissionError(
                "This conversation does not belong "
                "to the requested chatbot."
            )

        status = conversation.get("status")

        if status == "closed":
            raise ValueError(
                "This conversation is closed."
            )

        return conversation

    async def chat(
        self,
        deployment_key: str,
        origin: str | None,
        conversation_id: str,
        user_message: str,
    ) -> dict[str, Any]:
        if not deployment_key:
            raise ValueError(
                "Deployment key is required."
            )

        if not origin:
            raise PermissionError(
                "Origin header is required."
            )

        if not user_message or not user_message.strip():
            raise ValueError(
                "user_message cannot be empty."
            )

        deployment = (
            self.deployment_service
            .resolve_public_deployment(
                deployment_key=deployment_key,
                origin=origin,
            )
        )

        deployment_id = deployment.get(
            "deployment_id"
        )

        chatbot_id = deployment.get(
            "chatbot_id"
        )

        if not deployment_id:
            raise RuntimeError(
                "Deployment resolution returned "
                "no deployment_id."
            )

        if not chatbot_id:
            raise RuntimeError(
                "Deployment resolution returned "
                "no chatbot_id."
            )

        self._validate_conversation(
            conversation_id=conversation_id,
            chatbot_id=chatbot_id,
        )

        result = await self.runtime_service.chat(
            chatbot_id=chatbot_id,
            conversation_id=conversation_id,
            user_message=user_message.strip(),
        )

        return {
            "deployment_id": deployment_id,
            "chatbot_id": chatbot_id,
            "conversation_id": conversation_id,
            "response": result.get(
                "response",
                "",
            ),
            "current_stage": result.get(
                "current_stage"
            ),
            "provider": result.get(
                "provider"
            ),
            "model": result.get(
                "model"
            ),
            "input_tokens": result.get(
                "input_tokens",
                0,
            ),
            "output_tokens": result.get(
                "output_tokens",
                0,
            ),
            "total_tokens": result.get(
                "total_tokens",
                0,
            ),
            "handoff_required": result.get(
                "handoff_required",
                False,
            ),
            "handoff_reason": result.get(
                "handoff_reason",
                "",
            ),
        }


def get_public_chat_service() -> PublicChatService:
    return PublicChatService()
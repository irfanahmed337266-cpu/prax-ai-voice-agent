from typing import Any

from app.supabase.client import get_supabase_client


class ConversationService:
    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    def _get_start_stage(
        self,
        chatbot_id: str,
    ) -> dict[str, Any] | None:

        response = (
            self.supabase
            .table("chatbot_stages")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .eq("is_start", True)
            .order("stage_order")
            .limit(1)
            .execute()
        )

        stages = response.data or []

        if stages:
            return stages[0]

        # Fallback: first stage by stage_order
        response = (
            self.supabase
            .table("chatbot_stages")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("stage_order")
            .limit(1)
            .execute()
        )

        stages = response.data or []

        if stages:
            return stages[0]

        return None

    def create_conversation(
        self,
        chatbot_id: str,
        current_stage_id: str | None = None,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        chatbot_response = (
            self.supabase
            .table("chatbots")
            .select("id")
            .eq("id", chatbot_id)
            .single()
            .execute()
        )

        chatbot = chatbot_response.data

        if not chatbot:
            raise ValueError(
                f"Chatbot '{chatbot_id}' not found."
            )

        # Automatically select the configured
        # starting stage when one was not supplied.
        if not current_stage_id:
            start_stage = self._get_start_stage(
                chatbot_id
            )

            if start_stage:
                current_stage_id = (
                    start_stage.get("id")
                )

        payload: dict[str, Any] = {
            "chatbot_id": chatbot_id,
            "state": {},
            "status": "active",
        }

        if current_stage_id:
            payload["current_stage_id"] = (
                current_stage_id
            )

        response = (
            self.supabase
            .table("conversations")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create conversation."
            )

        return response.data[0]

    def get_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("conversations")
            .select("*")
            .eq("id", conversation_id)
            .single()
            .execute()
        )

        conversation = response.data

        if not conversation:
            raise ValueError(
                f"Conversation "
                f"'{conversation_id}' not found."
            )

        return conversation

    def get_messages(
        self,
        conversation_id: str,
    ) -> list[dict[str, Any]]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("messages")
            .select("*")
            .eq(
                "conversation_id",
                conversation_id,
            )
            .order("created_at")
            .execute()
        )

        return response.data or []

    def get_conversation_with_messages(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        conversation = self.get_conversation(
            conversation_id
        )

        messages = self.get_messages(
            conversation_id
        )

        return {
            "conversation": conversation,
            "messages": messages,
        }

    def update_conversation_state(
        self,
        conversation_id: str,
        state: dict[str, Any],
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("conversations")
            .update(
                {
                    "state": state,
                }
            )
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to update conversation state."
            )

        return response.data[0]

    def update_current_stage(
        self,
        conversation_id: str,
        stage_id: str | None,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("conversations")
            .update(
                {
                    "current_stage_id": stage_id,
                }
            )
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to update current "
                "conversation stage."
            )

        return response.data[0]

    def close_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("conversations")
            .update(
                {
                    "status": "closed",
                }
            )
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to close conversation."
            )

        return response.data[0]

    def reopen_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table("conversations")
            .update(
                {
                    "status": "active",
                }
            )
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to reopen conversation."
            )

        return response.data[0]

    def reset_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        conversation = self.get_conversation(
            conversation_id
        )

        chatbot_id = conversation.get(
            "chatbot_id"
        )

        if not chatbot_id:
            raise ValueError(
                "Conversation has no chatbot_id."
            )

        start_stage = self._get_start_stage(
            chatbot_id
        )

        update_payload: dict[str, Any] = {
            "state": {},
            "status": "active",
        }

        if start_stage:
            update_payload[
                "current_stage_id"
            ] = start_stage.get("id")
        else:
            update_payload[
                "current_stage_id"
            ] = None

        conversation_response = (
            self.supabase
            .table("conversations")
            .update(update_payload)
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not conversation_response.data:
            raise RuntimeError(
                "Failed to reset conversation."
            )

        self.supabase.table(
            "messages"
        ).delete().eq(
            "conversation_id",
            conversation_id,
        ).execute()

        return conversation_response.data[0]


def get_conversation_service() -> ConversationService:
    return ConversationService()
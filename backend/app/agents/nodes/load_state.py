from typing import Any

from app.supabase.client import get_supabase_client


class ConversationStateLoader:
    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    def load(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        conversation_response = (
            self.supabase
            .table("conversations")
            .select("*")
            .eq(
                "id",
                conversation_id,
            )
            .single()
            .execute()
        )

        conversation = (
            conversation_response.data
        )

        if not conversation:
            raise ValueError(
                f"Conversation "
                f"'{conversation_id}' not found."
            )

        messages_response = (
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

        messages = (
            messages_response.data or []
        )

        return {
            "conversation": conversation,
            "messages": messages,
        }


def load_state_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    conversation_id = state.get(
        "conversation_id"
    )

    if not conversation_id:
        raise ValueError(
            "conversation_id is required."
        )

    loader = ConversationStateLoader()

    result = loader.load(
        conversation_id
    )

    conversation = (
        result["conversation"]
    )

    persisted_state = (
        conversation.get("state")
        or {}
    )

    if not isinstance(
        persisted_state,
        dict,
    ):
        persisted_state = {}

    return {
        "conversation": conversation,
        "messages": result["messages"],
        "current_stage": None,
        **persisted_state,
    }
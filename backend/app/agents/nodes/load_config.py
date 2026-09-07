from typing import Any

from app.supabase.client import get_supabase_client


class ChatbotConfigLoader:
    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    def load(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:
        chatbot_response = (
            self.supabase
            .table("chatbots")
            .select("*")
            .eq("id", chatbot_id)
            .single()
            .execute()
        )

        chatbot = chatbot_response.data

        if not chatbot:
            raise ValueError(
                f"Chatbot '{chatbot_id}' not found."
            )

        stages_response = (
            self.supabase
            .table("chatbot_stages")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("stage_order")
            .execute()
        )

        stages = stages_response.data or []

        transitions_response = (
            self.supabase
            .table("stage_transitions")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .execute()
        )

        transitions = (
            transitions_response.data or []
        )

        return {
            "chatbot": chatbot,
            "stages": stages,
            "transitions": transitions,
        }


def load_config_node(
    state: dict[str, Any],
) -> dict[str, Any]:
    chatbot_id = state.get("chatbot_id")

    if not chatbot_id:
        raise ValueError(
            "chatbot_id is required."
        )

    loader = ChatbotConfigLoader()

    config = loader.load(chatbot_id)

    return {
        "chatbot": config["chatbot"],
        "stages": config["stages"],
        "transitions": config["transitions"],
    }
from typing import Any

from app.agents.graph import run_chatbot


class ChatbotRuntimeService:
    async def chat(
        self,
        chatbot_id: str,
        conversation_id: str,
        user_message: str,
    ) -> dict[str, Any]:

        result = await run_chatbot(
            chatbot_id=chatbot_id,
            conversation_id=conversation_id,
            user_message=user_message,
        )

        return {
            "chatbot_id": chatbot_id,
            "conversation_id": conversation_id,
            "response": result.get("ai_response", ""),
            "current_stage": result.get("current_stage"),
            "provider": result.get("provider"),
            "model": result.get("model"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "total_tokens": result.get("total_tokens", 0),
            "handoff_required": result.get(
                "handoff_required",
                False,
            ),
            "handoff_reason": result.get(
                "handoff_reason",
                "",
            ),
        }


def get_chatbot_runtime_service() -> ChatbotRuntimeService:
    return ChatbotRuntimeService()
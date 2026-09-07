from typing import Any

from app.services.handoff_service import (
    get_handoff_service,
)


class HandoffNode:

    def __init__(self) -> None:
        self.service = get_handoff_service()

    def run(
        self,
        state: dict[str, Any],
    ) -> dict[str, Any]:

        chatbot = state.get("chatbot") or {}

        chatbot_id = chatbot.get("id")

        if not chatbot_id:
            raise ValueError(
                "Chatbot configuration has no id."
            )

        user_message = (
            state.get("user_message") or ""
        ).strip()

        if not user_message:
            return {
                "handoff_required": False,
                "handoff_reason": "",
                "matched_handoff_rule_id": None,
                "matched_handoff_rule_name": None,
                "handoff_status": "",
            }

        result = self.service.evaluate(
            chatbot_id=chatbot_id,
            user_message=user_message,
        )

        handoff_required = bool(
            result.get(
                "handoff_required",
                False,
            )
        )

        if handoff_required:

            return {
                "handoff_required": True,
                "handoff_reason": str(
                    result.get(
                        "handoff_reason",
                        "",
                    )
                ),
                "matched_handoff_rule_id": result.get(
                    "matched_rule_id"
                ),
                "matched_handoff_rule_name": result.get(
                    "matched_rule_name"
                ),
                "handoff_status": "pending",

                "ai_response": (
                    "I understand. I'll connect you "
                    "with a human representative who "
                    "can assist you further."
                ),

                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
            }

        return {
            "handoff_required": False,
            "handoff_reason": "",
            "matched_handoff_rule_id": None,
            "matched_handoff_rule_name": None,
            "handoff_status": "",
        }


def handoff_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    node = HandoffNode()

    return node.run(state)
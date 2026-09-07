from typing import Any

from app.supabase.client import get_supabase_client


def update_state_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    conversation_id = state.get(
        "conversation_id"
    )

    if not conversation_id:
        raise ValueError(
            "conversation_id is required."
        )

    user_message = (
        state.get("user_message") or ""
    ).strip()

    ai_response = (
        state.get("ai_response") or ""
    ).strip()

    supabase = get_supabase_client()

    # =========================================================
    # SAVE USER MESSAGE
    # =========================================================

    if user_message:
        supabase.table("messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "user",
                "content": user_message,
            }
        ).execute()

    # =========================================================
    # SAVE ASSISTANT MESSAGE
    # =========================================================

    if ai_response:
        supabase.table("messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": ai_response,
            }
        ).execute()

    # =========================================================
    # CURRENT STAGE
    # =========================================================

    current_stage = state.get(
        "current_stage"
    )

    current_stage_id = None

    if current_stage:
        current_stage_id = (
            current_stage.get("id")
        )

    # =========================================================
    # EXISTING CONVERSATION STATE
    # =========================================================

    persisted_state: dict[str, Any] = {}

    existing_conversation = (
        state.get("conversation") or {}
    )

    existing_state = (
        existing_conversation.get("state")
        or {}
    )

    if isinstance(
        existing_state,
        dict,
    ):
        persisted_state.update(
            existing_state
        )

    # =========================================================
    # UPDATE PERSISTED STATE
    # =========================================================

    persisted_state.update(
        {
            "current_stage_id": (
                current_stage_id
            ),
            "stage_changed": (
                state.get(
                    "stage_changed",
                    False,
                )
            ),

            # -------------------------------------------------
            # HANDOFF
            # -------------------------------------------------

            "handoff_required": (
                state.get(
                    "handoff_required",
                    False,
                )
            ),

            "handoff_reason": (
                state.get(
                    "handoff_reason",
                    "",
                )
            ),

            "handoff_status": (
                state.get(
                    "handoff_status",
                    "",
                )
            ),

            "matched_handoff_rule_id": (
                state.get(
                    "matched_handoff_rule_id"
                )
            ),

            "matched_handoff_rule_name": (
                state.get(
                    "matched_handoff_rule_name"
                )
            ),
        }
    )

    # =========================================================
    # UPDATE CONVERSATION
    # =========================================================

    conversation_payload: dict[str, Any] = {
        "state": persisted_state,
    }

    if current_stage_id:
        conversation_payload[
            "current_stage_id"
        ] = current_stage_id

    supabase.table("conversations").update(
        conversation_payload
    ).eq(
        "id",
        conversation_id,
    ).execute()

    # =========================================================
    # RETURN UPDATED STATE
    # =========================================================

    return {
        "conversation": {
            **existing_conversation,
            **conversation_payload,
        }
    }
from typing import Any

from app.supabase.client import get_supabase_client


def update_state_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    conversation_id = state.get("conversation_id")

    if not conversation_id:
        raise ValueError("conversation_id is required.")

    user_message = (
        state.get("user_message") or ""
    ).strip()

    ai_response = (
        state.get("ai_response") or ""
    ).strip()

    supabase = get_supabase_client()

    current_stage = state.get("current_stage")
    next_stage = state.get("next_stage")

    current_stage_id = (
        current_stage.get("id")
        if current_stage
        else None
    )

    next_stage_id = (
        next_stage.get("id")
        if next_stage
        else None
    )

    stage_changed = bool(
        state.get("stage_changed", False)
    )

    persisted_stage_id = (
        next_stage_id
        if stage_changed and next_stage_id
        else current_stage_id
    )

    existing_conversation = (
        state.get("conversation") or {}
    )

    existing_state = (
        existing_conversation.get("state") or {}
    )

    persisted_state: dict[str, Any] = {}

    if isinstance(existing_state, dict):
        persisted_state.update(existing_state)

    persisted_state.update(
        {
            "current_stage_id": persisted_stage_id,
            "stage_changed": stage_changed,
            "handoff_required": state.get(
                "handoff_required",
                False,
            ),
            "handoff_reason": state.get(
                "handoff_reason",
                "",
            ),
            "handoff_status": state.get(
                "handoff_status",
                "",
            ),
            "matched_handoff_rule_id": state.get(
                "matched_handoff_rule_id"
            ),
            "matched_handoff_rule_name": state.get(
                "matched_handoff_rule_name"
            ),
        }
    )

    print("\n========== UPDATE STATE DEBUG ==========")
    print("conversation_id:", conversation_id)
    print("current_stage_id:", current_stage_id)
    print("next_stage_id:", next_stage_id)
    print("stage_changed:", stage_changed)
    print("persisted_stage_id:", persisted_stage_id)
    print("persisted_state:", persisted_state)

    if user_message:
        supabase.table("messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "user",
                "content": user_message,
            }
        ).execute()

    if ai_response:
        supabase.table("messages").insert(
            {
                "conversation_id": conversation_id,
                "role": "assistant",
                "content": ai_response,
            }
        ).execute()

    conversation_payload = {
        "state": persisted_state,
    }

    if persisted_stage_id:
        conversation_payload["current_stage_id"] = (
            persisted_stage_id
        )

    print("UPDATE PAYLOAD:", conversation_payload)

    update_response = (
        supabase
        .table("conversations")
        .update(conversation_payload)
        .eq("id", conversation_id)
        .select("*")
        .execute()
    )

    print("UPDATE RESULT:", update_response.data)
    print("========================================\n")

    if not update_response.data:
        raise RuntimeError(
            "Conversation update returned 0 rows. "
            f"conversation_id={conversation_id}"
        )

    updated_conversation = update_response.data[0]

    return {
        "conversation": updated_conversation,
        "current_stage": (
            next_stage
            if stage_changed and next_stage
            else current_stage
        ),
    }
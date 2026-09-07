from typing import Any


def determine_current_stage(
    state: dict[str, Any],
) -> dict[str, Any]:
    stages = state.get("stages") or []

    if not stages:
        return {
            "current_stage": None,
            "next_stage": None,
            "stage_changed": False,
        }

    conversation = (
        state.get("conversation") or {}
    )

    current_stage_id = (
        conversation.get("current_stage_id")
    )

    current_stage = None

    # Try to restore the conversation's
    # existing stage.
    if current_stage_id:
        for stage in stages:
            if str(stage.get("id")) == str(
                current_stage_id
            ):
                current_stage = stage
                break

    # If the conversation has no stage yet,
    # use the configured start stage.
    if current_stage is None:

        start_stages = [
            stage
            for stage in stages
            if stage.get("is_start") is True
        ]

        if start_stages:
            current_stage = sorted(
                start_stages,
                key=lambda item: item.get(
                    "stage_order",
                    0,
                ),
            )[0]

        else:
            # Fallback to the first stage.
            current_stage = sorted(
                stages,
                key=lambda item: item.get(
                    "stage_order",
                    0,
                ),
            )[0]

    return {
        "current_stage": current_stage,
        "next_stage": None,
        "stage_changed": False,
    }


def find_transition(
    state: dict[str, Any],
) -> dict[str, Any] | None:

    current_stage = state.get(
        "current_stage"
    )

    if not current_stage:
        return None

    current_stage_id = current_stage.get(
        "id"
    )

    transitions = (
        state.get("transitions") or []
    )

    candidates = [
        transition
        for transition in transitions
        if str(
            transition.get("from_stage_id")
        )
        == str(current_stage_id)
    ]

    if not candidates:
        return None

    # Higher priority first.
    candidates = sorted(
        candidates,
        key=lambda item: item.get(
            "priority",
            0,
        ),
        reverse=True,
    )

    user_message = (
        state.get("user_message") or ""
    ).strip().lower()

    if not user_message:
        return None

    for transition in candidates:

        condition = transition.get(
            "condition"
        )

        if not condition:
            continue

        condition_text = (
            str(condition)
            .strip()
            .lower()
        )

        if condition_text in user_message:
            return transition

    return None
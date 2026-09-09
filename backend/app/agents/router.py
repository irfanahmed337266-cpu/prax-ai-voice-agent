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

    # Restore the conversation's existing stage.
    if current_stage_id:
        for stage in stages:
            if str(stage.get("id")) == str(
                current_stage_id
            ):
                current_stage = stage
                break

    # If no stage is saved yet, use the configured
    # start stage.
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
            current_stage = sorted(
                stages,
                key=lambda item: item.get(
                    "stage_order",
                    0,
                ),
            )[0]

    # =========================================================
    # TERMINAL STAGE
    # =========================================================
    #
    # A terminal stage ends the configured flow.
    # It must never select another outgoing transition.
    # =========================================================

    if current_stage.get("is_terminal") is True:
        return {
            "current_stage": current_stage,
            "next_stage": None,
            "stage_changed": False,
        }

    # =========================================================
    # FIND TRANSITION
    # =========================================================

    transitions = (
        state.get("transitions") or []
    )

    current_stage_id = current_stage.get("id")

    candidates = [
        transition
        for transition in transitions
        if str(
            transition.get("from_stage_id")
        )
        == str(current_stage_id)
    ]

    if not candidates:
        return {
            "current_stage": current_stage,
            "next_stage": None,
            "stage_changed": False,
        }

    # Higher priority is evaluated first.
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

    matched_transition = None

    for transition in candidates:
        condition = transition.get("condition")

        # Null/empty condition means unconditional
        # transition.
        if not condition:
            matched_transition = transition
            break

        condition_text = (
            str(condition)
            .strip()
            .lower()
        )

        if condition_text in user_message:
            matched_transition = transition
            break

    if not matched_transition:
        return {
            "current_stage": current_stage,
            "next_stage": None,
            "stage_changed": False,
        }

    next_stage_id = matched_transition.get(
        "to_stage_id"
    )

    next_stage = None

    for stage in stages:
        if str(stage.get("id")) == str(
            next_stage_id
        ):
            next_stage = stage
            break

    if not next_stage:
        return {
            "current_stage": current_stage,
            "next_stage": None,
            "stage_changed": False,
        }

    return {
        "current_stage": current_stage,
        "next_stage": next_stage,
        "stage_changed": True,
    }


def find_transition(
    state: dict[str, Any],
) -> dict[str, Any] | None:
    current_stage = state.get(
        "current_stage"
    )

    if not current_stage:
        return None

    # Terminal stages have no further transition.
    if current_stage.get("is_terminal") is True:
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
            return transition

        condition_text = (
            str(condition)
            .strip()
            .lower()
        )

        if condition_text in user_message:
            return transition

    return None
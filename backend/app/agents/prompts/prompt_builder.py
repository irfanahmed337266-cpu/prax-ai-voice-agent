from typing import Any


def build_system_prompt(
    chatbot: dict[str, Any],
    current_stage: dict[str, Any] | None,
    knowledge_context: str = "",
) -> str:

    base_prompt = (
        chatbot.get("system_prompt")
        or "You are a helpful business assistant."
    )

    parts = [
        base_prompt.strip()
    ]

    business_name = chatbot.get("business_name")

    if business_name:
        parts.append(
            f"\nBusiness name: {business_name}"
        )

    use_case = chatbot.get("use_case")

    if use_case:
        parts.append(
            f"\nChatbot use case: {use_case}"
        )

    if current_stage:
        stage_name = current_stage.get("name")
        stage_description = current_stage.get(
            "description"
        )

        if stage_name:
            parts.append(
                f"\nCurrent conversation stage: "
                f"{stage_name}"
            )

        if stage_description:
            parts.append(
                "\nStage instructions:\n"
                + str(stage_description)
            )

    if knowledge_context.strip():
        parts.append(
            "\nRelevant knowledge:\n"
            + knowledge_context.strip()
        )

    parts.append(
        "\nRules:\n"
        "- Follow the configured chatbot identity.\n"
        "- Follow the current stage instructions.\n"
        "- Do not invent business information.\n"
        "- If information is unavailable, say so honestly.\n"
        "- Answer the user's latest message directly.\n"
        "- This is a voice customer-support agent, so keep responses concise, natural, and suitable for spoken conversation.\n"
        "- When greeting the user in Urdu, use \"ہیلو\" instead of \"नमस्ते\".\n"
        "- Never use \"नमस्ते\" as a greeting.\n"
        "- Do not add an unnecessary greeting when the user has already started the conversation or asked a specific question.\n"
        "- Stay focused on the configured business use case and the user's current request."
    )

    return "\n".join(parts)


def prompt_builder_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    chatbot = state.get("chatbot") or {}

    current_stage = state.get(
        "current_stage"
    )

    knowledge_context = (
        state.get("knowledge_context")
        or ""
    )

    system_prompt = build_system_prompt(
        chatbot=chatbot,
        current_stage=current_stage,
        knowledge_context=knowledge_context,
    )

    return {
        "system_prompt": system_prompt
    }

from typing import Any

from app.services.ai_provider_service import AIProviderService


async def generate_response_node(
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
        raise ValueError(
            "user_message is required."
        )

    service = AIProviderService()

    provider_record = (
        service.get_provider_for_chatbot(
            chatbot_id
        )
    )

    if not provider_record:
        raise ValueError(
            "No active AI provider is configured "
            "for this chatbot."
        )

    result = await service.generate_response(
        provider_id=provider_record["id"],
        system_prompt=state.get(
            "system_prompt",
            "",
        ),
        user_message=user_message,
    )

    return {
        "ai_response": result.content,
        "provider_id": provider_record["id"],
        "provider": result.provider,
        "model": result.model,
        "input_tokens": result.input_tokens,
        "output_tokens": result.output_tokens,
        "total_tokens": result.total_tokens,
    }
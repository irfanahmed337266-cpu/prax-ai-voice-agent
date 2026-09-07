from typing import Any, TypedDict


class AgentState(TypedDict, total=False):
    # =========================================================
    # REQUEST
    # =========================================================

    chatbot_id: str
    conversation_id: str
    user_message: str

    # =========================================================
    # CHATBOT CONFIGURATION
    # =========================================================

    chatbot: dict[str, Any]
    stages: list[dict[str, Any]]
    transitions: list[dict[str, Any]]

    # =========================================================
    # CONVERSATION STATE
    # =========================================================

    conversation: dict[str, Any]
    messages: list[dict[str, Any]]

    # =========================================================
    # STAGE ROUTING
    # =========================================================

    current_stage: dict[str, Any] | None
    next_stage: dict[str, Any] | None
    stage_changed: bool

    # =========================================================
    # RAG / KNOWLEDGE
    # =========================================================

    knowledge_base_id: str
    knowledge_context: str
    retrieved_results: list[dict[str, Any]]
    retrieval_result_count: int

    # =========================================================
    # PROMPT
    # =========================================================

    system_prompt: str

    # =========================================================
    # AI PROVIDER
    # =========================================================

    provider_id: str
    provider: str
    model: str

    # =========================================================
    # AI RESPONSE
    # =========================================================

    ai_response: str

    # =========================================================
    # TOKEN USAGE
    # =========================================================

    input_tokens: int
    output_tokens: int
    total_tokens: int

    # =========================================================
    # HANDOFF
    # =========================================================

    handoff_required: bool
    handoff_reason: str
    matched_handoff_rule_id: str | None
    matched_handoff_rule_name: str | None

    # Handoff lifecycle:
    # pending -> assigned -> resolved
    handoff_status: str

    # =========================================================
    # ERROR
    # =========================================================

    error: str | None
from typing import Any

from langgraph.graph import END, START, StateGraph

from app.agents.nodes.generate_response import (
    generate_response_node,
)
from app.agents.nodes.handoff import (
    handoff_node,
)
from app.agents.nodes.load_config import (
    load_config_node,
)
from app.agents.nodes.load_state import (
    load_state_node,
)
from app.agents.nodes.retrieve_knowledge import (
    retrieve_knowledge_node,
)
from app.agents.nodes.update_state import (
    update_state_node,
)
from app.agents.prompts.prompt_builder import (
    prompt_builder_node,
)
from app.agents.router import determine_current_stage
from app.agents.state import AgentState


def stage_router_node(
    state: dict[str, Any],
) -> dict[str, Any]:
    return determine_current_stage(state)


def route_after_handoff(
    state: dict[str, Any],
) -> str:
    """
    Decide whether the conversation should go directly
    to state persistence or continue through RAG + AI.

    Handoff requests bypass AI generation.
    """

    if state.get("handoff_required", False):
        return "handoff_response"

    return "continue"


def handoff_response_node(
    state: dict[str, Any],
) -> dict[str, Any]:
    """
    Prepare the standard response returned when a human
    handoff rule has matched.
    """

    return {
        "ai_response": (
            state.get("ai_response")
            or "I understand. I'll connect you "
            "with a human representative who "
            "can assist you further."
        ),
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
    }


def build_chatbot_graph():
    builder = StateGraph(AgentState)

    # --------------------------------------------------
    # NODES
    # --------------------------------------------------

    builder.add_node(
        "load_config",
        load_config_node,
    )

    builder.add_node(
        "load_state",
        load_state_node,
    )

    builder.add_node(
        "stage_router",
        stage_router_node,
    )

    builder.add_node(
        "handoff",
        handoff_node,
    )

    builder.add_node(
        "handoff_response",
        handoff_response_node,
    )

    builder.add_node(
        "retrieve_knowledge",
        retrieve_knowledge_node,
    )

    builder.add_node(
        "prompt_builder",
        prompt_builder_node,
    )

    builder.add_node(
        "generate_response",
        generate_response_node,
    )

    builder.add_node(
        "update_state",
        update_state_node,
    )

    # --------------------------------------------------
    # NORMAL FLOW
    # --------------------------------------------------

    builder.add_edge(
        START,
        "load_config",
    )

    builder.add_edge(
        "load_config",
        "load_state",
    )

    builder.add_edge(
        "load_state",
        "stage_router",
    )

    # --------------------------------------------------
    # HANDOFF CHECK
    # --------------------------------------------------

    builder.add_edge(
        "stage_router",
        "handoff",
    )

    builder.add_conditional_edges(
        "handoff",
        route_after_handoff,
        {
            "handoff_response": "handoff_response",
            "continue": "retrieve_knowledge",
        },
    )

    # --------------------------------------------------
    # HANDOFF RESPONSE
    # --------------------------------------------------

    builder.add_edge(
        "handoff_response",
        "update_state",
    )

    # --------------------------------------------------
    # NORMAL RAG + AI FLOW
    # --------------------------------------------------

    builder.add_edge(
        "retrieve_knowledge",
        "prompt_builder",
    )

    builder.add_edge(
        "prompt_builder",
        "generate_response",
    )

    builder.add_edge(
        "generate_response",
        "update_state",
    )

    # --------------------------------------------------
    # FINAL STATE PERSISTENCE
    # --------------------------------------------------

    builder.add_edge(
        "update_state",
        END,
    )

    return builder.compile()


chatbot_graph = build_chatbot_graph()


async def run_chatbot(
    chatbot_id: str,
    conversation_id: str,
    user_message: str,
) -> dict[str, Any]:

    if not chatbot_id:
        raise ValueError(
            "chatbot_id is required."
        )

    if not conversation_id:
        raise ValueError(
            "conversation_id is required."
        )

    if not user_message or not user_message.strip():
        raise ValueError(
            "user_message cannot be empty."
        )

    initial_state: AgentState = {
        "chatbot_id": chatbot_id,
        "conversation_id": conversation_id,
        "user_message": user_message.strip(),

        "knowledge_context": "",
        "retrieved_results": [],
        "retrieval_result_count": 0,

        "handoff_required": False,
        "handoff_reason": "",
        "matched_handoff_rule_id": None,
        "matched_handoff_rule_name": None,
        "handoff_status": "",

        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,

        "error": None,
    }

    result = await chatbot_graph.ainvoke(
        initial_state
    )

    return result
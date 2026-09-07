from typing import Any

from app.services.retrieval_service import (
    get_retrieval_service,
)


class KnowledgeRetrievalNode:
    """
    LangGraph RAG retrieval node.

    Flow:

        User message
            ↓
        Active chatbot knowledge base
            ↓
        Query embedding
            ↓
        pgvector similarity search
            ↓
        Relevant knowledge chunks
            ↓
        knowledge_context
    """

    DEFAULT_MATCH_THRESHOLD = 0.20
    DEFAULT_MATCH_COUNT = 5

    def __init__(self) -> None:
        self.retrieval_service = (
            get_retrieval_service()
        )

    def _get_active_knowledge_base(
        self,
        chatbot_id: str,
    ) -> dict[str, Any] | None:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        from app.supabase.client import (
            get_supabase_client,
        )

        supabase = get_supabase_client()

        response = (
            supabase
            .table("knowledge_bases")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .eq("is_active", True)
            .order("created_at")
            .limit(1)
            .execute()
        )

        knowledge_bases = response.data or []

        if not knowledge_bases:
            return None

        return knowledge_bases[0]

    async def run(
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
            raise ValueError(
                "user_message is required."
            )

        knowledge_base = (
            self._get_active_knowledge_base(
                chatbot_id
            )
        )

        # -----------------------------------------------------
        # No knowledge base configured
        # -----------------------------------------------------

        if not knowledge_base:
            return {
                "knowledge_context": "",
                "knowledge_base_id": "",
                "retrieved_results": [],
                "retrieval_result_count": 0,
            }

        knowledge_base_id = knowledge_base["id"]

        # -----------------------------------------------------
        # Semantic retrieval
        # -----------------------------------------------------

        result = (
            await self.retrieval_service
            .search_with_context(
                knowledge_base_id=knowledge_base_id,
                query=user_message,
                match_threshold=(
                    self.DEFAULT_MATCH_THRESHOLD
                ),
                match_count=(
                    self.DEFAULT_MATCH_COUNT
                ),
            )
        )

        return {
            "knowledge_context": (
                result.get("context") or ""
            ),
            "knowledge_base_id": knowledge_base_id,
            "retrieved_results": (
                result.get("results") or []
            ),
            "retrieval_result_count": (
                result.get("result_count", 0)
            ),
        }


async def retrieve_knowledge_node(
    state: dict[str, Any],
) -> dict[str, Any]:

    node = KnowledgeRetrievalNode()

    return await node.run(state)
from typing import Any

from app.services.embedding_service import EmbeddingService
from app.supabase.client import get_supabase_client


class RetrievalService:
    """
    Semantic retrieval service for PRAX knowledge bases.

    Flow:

        User query
            ↓
        Query embedding
            ↓
        pgvector RPC
            ↓
        Similarity search
            ↓
        Relevant knowledge chunks
    """

    RPC_NAME = "match_document_chunks"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()
        self.embedding_service = EmbeddingService()

    async def search(
        self,
        knowledge_base_id: str,
        query: str,
        match_threshold: float = 0.20,
        match_count: int = 5,
    ) -> list[dict[str, Any]]:

        if not knowledge_base_id:
            raise ValueError(
                "knowledge_base_id is required."
            )

        if not query or not query.strip():
            raise ValueError(
                "query cannot be empty."
            )

        if not 0.0 <= match_threshold <= 1.0:
            raise ValueError(
                "match_threshold must be between 0 and 1."
            )

        if not 1 <= match_count <= 50:
            raise ValueError(
                "match_count must be between 1 and 50."
            )

        query = query.strip()

        # ----------------------------------------------------
        # Create query embedding
        # ----------------------------------------------------

        embedding_result = (
            await self.embedding_service.embed_query(
                chatbot_id=self._get_chatbot_id(
                    knowledge_base_id
                ),
                query=query,
            )
        )

        # ----------------------------------------------------
        # pgvector similarity search
        # ----------------------------------------------------

        response = self.supabase.rpc(
            self.RPC_NAME,
            {
                "query_embedding": (
                    embedding_result.embedding
                ),
                "match_knowledge_base_id": (
                    knowledge_base_id
                ),
                "match_threshold": match_threshold,
                "match_count": match_count,
            },
        ).execute()

        return response.data or []

    def _get_chatbot_id(
        self,
        knowledge_base_id: str,
    ) -> str:

        response = (
            self.supabase
            .table("knowledge_bases")
            .select("chatbot_id")
            .eq("id", knowledge_base_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Knowledge base "
                f"'{knowledge_base_id}' not found."
            )

        chatbot_id = response.data.get(
            "chatbot_id"
        )

        if not chatbot_id:
            raise ValueError(
                "Knowledge base has no chatbot_id."
            )

        return chatbot_id

    async def search_with_context(
        self,
        knowledge_base_id: str,
        query: str,
        match_threshold: float = 0.20,
        match_count: int = 5,
    ) -> dict[str, Any]:

        results = await self.search(
            knowledge_base_id=knowledge_base_id,
            query=query,
            match_threshold=match_threshold,
            match_count=match_count,
        )

        context_parts: list[str] = []

        for index, result in enumerate(
            results,
            start=1,
        ):
            content = str(
                result.get("content") or ""
            ).strip()

            if not content:
                continue

            similarity = result.get(
                "similarity"
            )

            if similarity is not None:
                context_parts.append(
                    f"[Knowledge Result {index} | "
                    f"similarity="
                    f"{float(similarity):.4f}]\n"
                    f"{content}"
                )
            else:
                context_parts.append(
                    f"[Knowledge Result {index}]\n"
                    f"{content}"
                )

        return {
            "results": results,
            "context": "\n\n".join(
                context_parts
            ),
            "result_count": len(results),
        }


def get_retrieval_service() -> RetrievalService:
    return RetrievalService()
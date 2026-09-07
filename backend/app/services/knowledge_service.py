from typing import Any

from app.supabase.client import get_supabase_client


class KnowledgeBaseService:
    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    def create(
        self,
        chatbot_id: str,
        name: str,
        description: str | None = None,
        is_active: bool = True,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        if not name.strip():
            raise ValueError(
                "Knowledge base name is required."
            )

        chatbot_response = (
            self.supabase
            .table("chatbots")
            .select("id")
            .eq("id", chatbot_id)
            .single()
            .execute()
        )

        if not chatbot_response.data:
            raise ValueError(
                f"Chatbot '{chatbot_id}' not found."
            )

        response = (
            self.supabase
            .table("knowledge_bases")
            .insert(
                {
                    "chatbot_id": chatbot_id,
                    "name": name.strip(),
                    "description": (
                        description.strip()
                        if description
                        else None
                    ),
                    "is_active": is_active,
                }
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create knowledge base."
            )

        return response.data[0]

    def get(
        self,
        knowledge_base_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table("knowledge_bases")
            .select("*")
            .eq("id", knowledge_base_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Knowledge base "
                f"'{knowledge_base_id}' not found."
            )

        return response.data

    def list_for_chatbot(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        response = (
            self.supabase
            .table("knowledge_bases")
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("created_at")
            .execute()
        )

        return response.data or []

    def update(
        self,
        knowledge_base_id: str,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any]:

        self.get(knowledge_base_id)

        payload: dict[str, Any] = {}

        if name is not None:
            if not name.strip():
                raise ValueError(
                    "Knowledge base name "
                    "cannot be empty."
                )

            payload["name"] = name.strip()

        if description is not None:
            payload["description"] = (
                description.strip()
                or None
            )

        if is_active is not None:
            payload["is_active"] = is_active

        if not payload:
            return self.get(
                knowledge_base_id
            )

        response = (
            self.supabase
            .table("knowledge_bases")
            .update(payload)
            .eq("id", knowledge_base_id)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to update knowledge base."
            )

        return response.data[0]

    def delete(
        self,
        knowledge_base_id: str,
    ) -> None:

        self.get(knowledge_base_id)

        documents_response = (
            self.supabase
            .table("documents")
            .select("id")
            .eq(
                "knowledge_base_id",
                knowledge_base_id,
            )
            .execute()
        )

        documents = (
            documents_response.data or []
        )

        for document in documents:
            document_id = document.get("id")

            self.supabase.table(
                "document_chunks"
            ).delete().eq(
                "document_id",
                document_id,
            ).execute()

        self.supabase.table(
            "documents"
        ).delete().eq(
            "knowledge_base_id",
            knowledge_base_id,
        ).execute()

        response = (
            self.supabase
            .table("knowledge_bases")
            .delete()
            .eq("id", knowledge_base_id)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to delete knowledge base."
            )

    def get_stats(
        self,
        knowledge_base_id: str,
    ) -> dict[str, Any]:

        self.get(knowledge_base_id)

        documents_response = (
            self.supabase
            .table("documents")
            .select("id")
            .eq(
                "knowledge_base_id",
                knowledge_base_id,
            )
            .execute()
        )

        documents = (
            documents_response.data or []
        )

        document_count = len(documents)
        chunk_count = 0

        for document in documents:
            document_id = document.get("id")

            chunks_response = (
                self.supabase
                .table("document_chunks")
                .select("id")
                .eq(
                    "document_id",
                    document_id,
                )
                .execute()
            )

            chunk_count += len(
                chunks_response.data or []
            )

        return {
            "document_count":
                document_count,
            "chunk_count":
                chunk_count,
        }


def get_knowledge_base_service() -> KnowledgeBaseService:
    return KnowledgeBaseService()
from typing import Any

from app.services.chunking_service import (
    get_chunking_service,
)
from app.services.embedding_service import (
    get_embedding_service,
)
from app.services.knowledge_service import (
    get_knowledge_base_service,
)
from app.supabase.client import get_supabase_client


class DocumentService:
    def __init__(self) -> None:
        self.supabase = get_supabase_client()

        self.knowledge_service = (
            get_knowledge_base_service()
        )

        self.chunking_service = (
            get_chunking_service()
        )

        self.embedding_service = (
            get_embedding_service()
        )

    async def ingest_text(
        self,
        knowledge_base_id: str,
        name: str,
        content: str,
        source_type: str = "text",
        source_url: str | None = None,
        mime_type: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        if not knowledge_base_id:
            raise ValueError(
                "knowledge_base_id is required."
            )

        if not name.strip():
            raise ValueError(
                "Document name is required."
            )

        if not content.strip():
            raise ValueError(
                "Document content is required."
            )

        knowledge_base = (
            self.knowledge_service.get(
                knowledge_base_id
            )
        )

        if not knowledge_base.get(
            "is_active",
            True,
        ):
            raise ValueError(
                "Cannot ingest a document into "
                "an inactive knowledge base."
            )

        chatbot_id = knowledge_base.get(
            "chatbot_id"
        )

        if not chatbot_id:
            raise ValueError(
                "Knowledge base has no chatbot_id."
            )

        chunks = (
            self.chunking_service.chunk_text(
                content
            )
        )

        if not chunks:
            raise ValueError(
                "Document produced no text chunks."
            )

        document_payload = {
            "knowledge_base_id":
                knowledge_base_id,
            "name":
                name.strip(),
            "source_type":
                source_type.strip().lower(),
            "source_url":
                source_url,
            "storage_path":
                None,
            "mime_type":
                mime_type,
            "metadata":
                metadata or {},
        }

        document_response = (
            self.supabase
            .table("documents")
            .insert(document_payload)
            .execute()
        )

        if not document_response.data:
            raise RuntimeError(
                "Failed to create document."
            )

        document = (
            document_response.data[0]
        )

        document_id = document["id"]

        try:
            texts = [
                chunk.content
                for chunk in chunks
            ]

            embeddings = (
                await self.embedding_service
                .embed_texts(
                    chatbot_id=chatbot_id,
                    texts=texts,
                )
            )

            if len(embeddings) != len(chunks):
                raise RuntimeError(
                    "Embedding count does not "
                    "match chunk count."
                )

            chunk_rows = []

            for chunk, embedding_result in zip(
                chunks,
                embeddings,
            ):
                chunk_rows.append(
                    {
                        "document_id":
                            document_id,
                        "content":
                            chunk.content,
                        "chunk_index":
                            chunk.index,
                        "embedding":
                            embedding_result.embedding,
                        "metadata": {
                            "embedding_provider":
                                embedding_result.provider,
                            "embedding_model":
                                embedding_result.model,
                        },
                    }
                )

            chunk_response = (
                self.supabase
                .table("document_chunks")
                .insert(chunk_rows)
                .execute()
            )

            if not chunk_response.data:
                raise RuntimeError(
                    "Failed to store document chunks."
                )

            return {
                **document,
                "chunk_count":
                    len(chunk_response.data),
                "embedding_count":
                    len(embeddings),
            }

        except Exception:
            # Prevent half-ingested documents.
            self.supabase.table(
                "document_chunks"
            ).delete().eq(
                "document_id",
                document_id,
            ).execute()

            self.supabase.table(
                "documents"
            ).delete().eq(
                "id",
                document_id,
            ).execute()

            raise

    def get(
        self,
        document_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table("documents")
            .select("*")
            .eq("id", document_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Document '{document_id}' not found."
            )

        return response.data

    def list_for_knowledge_base(
        self,
        knowledge_base_id: str,
    ) -> list[dict[str, Any]]:

        self.knowledge_service.get(
            knowledge_base_id
        )

        response = (
            self.supabase
            .table("documents")
            .select("*")
            .eq(
                "knowledge_base_id",
                knowledge_base_id,
            )
            .order("created_at")
            .execute()
        )

        return response.data or []

    def get_chunks(
        self,
        document_id: str,
    ) -> list[dict[str, Any]]:

        self.get(document_id)

        response = (
            self.supabase
            .table("document_chunks")
            .select(
                "id,document_id,content,"
                "chunk_index,metadata,created_at"
            )
            .eq(
                "document_id",
                document_id,
            )
            .order("chunk_index")
            .execute()
        )

        return response.data or []

    def delete(
        self,
        document_id: str,
    ) -> None:

        self.get(document_id)

        self.supabase.table(
            "document_chunks"
        ).delete().eq(
            "document_id",
            document_id,
        ).execute()

        response = (
            self.supabase
            .table("documents")
            .delete()
            .eq("id", document_id)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to delete document."
            )


def get_document_service() -> DocumentService:
    return DocumentService()
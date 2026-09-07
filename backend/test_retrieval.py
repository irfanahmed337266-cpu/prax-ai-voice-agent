import asyncio

from app.services.retrieval_service import (
    RetrievalService,
)


KNOWLEDGE_BASE_ID = (
    "6170419e-7111-426d-bd10-e6b19843f7b0"
)

QUERY = "What services does PRAX provide?"


async def main() -> None:
    service = RetrievalService()

    result = await service.search_with_context(
        knowledge_base_id=KNOWLEDGE_BASE_ID,
        query=QUERY,
        match_threshold=0.20,
        match_count=5,
    )

    print()
    print("=" * 70)
    print("PRAX SEMANTIC RETRIEVAL TEST")
    print("=" * 70)

    print()
    print("Query:")
    print(QUERY)

    print()
    print("Result count:")
    print(result["result_count"])

    print()
    print("Retrieved context:")
    print("-" * 70)
    print(result["context"])
    print("-" * 70)

    print()
    print("Raw results:")

    for index, item in enumerate(
        result["results"],
        start=1,
    ):
        print()
        print(f"Result #{index}")
        print("ID:", item.get("id"))
        print(
            "Document ID:",
            item.get("document_id"),
        )
        print(
            "Chunk index:",
            item.get("chunk_index"),
        )
        print(
            "Similarity:",
            item.get("similarity"),
        )
        print(
            "Content:",
            item.get("content"),
        )

    print()
    print("=" * 70)
    print("RETRIEVAL TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
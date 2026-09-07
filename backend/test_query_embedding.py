import asyncio

from app.services.embedding_service import EmbeddingService


CHATBOT_ID = "e1c9288c-84dd-494e-80bc-fb11dbd54c06"
QUERY = "What services does PRAX provide?"


async def main() -> None:
    service = EmbeddingService()

    result = await service.embed_query(
        chatbot_id=CHATBOT_ID,
        query=QUERY,
    )

    print("SUCCESS")
    print("provider:", result.provider)
    print("model:", result.model)
    print("dimensions:", len(result.embedding))
    print("first_values:", result.embedding[:5])


if __name__ == "__main__":
    asyncio.run(main())
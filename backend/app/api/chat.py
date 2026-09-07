from fastapi import APIRouter, HTTPException

from app.schemas.chatbot_runtime import (
    ChatRequest,
    ChatResponse,
)
from app.services.chatbot_service import (
    get_chatbot_runtime_service,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    payload: ChatRequest,
):
    try:
        service = get_chatbot_runtime_service()

        return await service.chat(
            chatbot_id=payload.chatbot_id,
            conversation_id=payload.conversation_id,
            user_message=payload.user_message,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
from fastapi import APIRouter, HTTPException

from app.schemas.conversation import (
    ConversationCreateRequest,
    ConversationMessageResponse,
    ConversationResponse,
    ConversationStateUpdateRequest,
    ConversationStatusResponse,
    ConversationWithMessagesResponse,
)
from app.services.conversation_service import (
    get_conversation_service,
)


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=ConversationResponse,
)
def create_conversation(
    payload: ConversationCreateRequest,
):
    try:
        service = (
            get_conversation_service()
        )

        return service.create_conversation(
            chatbot_id=payload.chatbot_id,
            current_stage_id=(
                payload.current_stage_id
            ),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
def get_conversation(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        return service.get_conversation(
            conversation_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{conversation_id}/messages",
    response_model=list[
        ConversationMessageResponse
    ],
)
def get_conversation_messages(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        service.get_conversation(
            conversation_id
        )

        return service.get_messages(
            conversation_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{conversation_id}/full",
    response_model=ConversationWithMessagesResponse,
)
def get_conversation_full(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        return (
            service
            .get_conversation_with_messages(
                conversation_id
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{conversation_id}/state",
    response_model=ConversationResponse,
)
def update_conversation_state(
    conversation_id: str,
    payload: ConversationStateUpdateRequest,
):
    try:
        service = (
            get_conversation_service()
        )

        return (
            service.update_conversation_state(
                conversation_id=conversation_id,
                state=payload.state,
            )
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.post(
    "/{conversation_id}/close",
    response_model=ConversationStatusResponse,
)
def close_conversation(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        return service.close_conversation(
            conversation_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.post(
    "/{conversation_id}/reopen",
    response_model=ConversationStatusResponse,
)
def reopen_conversation(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        return service.reopen_conversation(
            conversation_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.post(
    "/{conversation_id}/reset",
    response_model=ConversationResponse,
)
def reset_conversation(
    conversation_id: str,
):
    try:
        service = (
            get_conversation_service()
        )

        return service.reset_conversation(
            conversation_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
from fastapi import APIRouter, HTTPException

from app.schemas.knowledge import (
    KnowledgeBaseCreateRequest,
    KnowledgeBaseDetailResponse,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdateRequest,
)
from app.services.knowledge_service import (
    get_knowledge_base_service,
)


router = APIRouter(
    prefix="/knowledge-bases",
    tags=["Knowledge Bases"],
)


@router.post(
    "",
    response_model=KnowledgeBaseResponse,
)
def create_knowledge_base(
    payload: KnowledgeBaseCreateRequest,
):
    try:
        service = (
            get_knowledge_base_service()
        )

        return service.create(
            chatbot_id=payload.chatbot_id,
            name=payload.name,
            description=payload.description,
            is_active=payload.is_active,
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
    "/{knowledge_base_id}",
    response_model=KnowledgeBaseDetailResponse,
)
def get_knowledge_base(
    knowledge_base_id: str,
):
    try:
        service = (
            get_knowledge_base_service()
        )

        knowledge_base = service.get(
            knowledge_base_id
        )

        stats = service.get_stats(
            knowledge_base_id
        )

        return {
            **knowledge_base,
            **stats,
        }

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
    "/chatbot/{chatbot_id}",
    response_model=list[
        KnowledgeBaseResponse
    ],
)
def list_knowledge_bases(
    chatbot_id: str,
):
    try:
        service = (
            get_knowledge_base_service()
        )

        return service.list_for_chatbot(
            chatbot_id
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.patch(
    "/{knowledge_base_id}",
    response_model=KnowledgeBaseResponse,
)
def update_knowledge_base(
    knowledge_base_id: str,
    payload: KnowledgeBaseUpdateRequest,
):
    try:
        service = (
            get_knowledge_base_service()
        )

        return service.update(
            knowledge_base_id=
                knowledge_base_id,
            name=payload.name,
            description=payload.description,
            is_active=payload.is_active,
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


@router.delete(
    "/{knowledge_base_id}",
)
def delete_knowledge_base(
    knowledge_base_id: str,
):
    try:
        service = (
            get_knowledge_base_service()
        )

        service.delete(
            knowledge_base_id
        )

        return {
            "success": True,
            "message":
                "Knowledge base deleted successfully.",
        }

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
from fastapi import APIRouter, HTTPException

from app.schemas.admin_config import (
    ChatbotAdminResponse,
    ChatbotConfigurationResponse,
    ChatbotUpdateRequest,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdateRequest,
    StageCreateRequest,
    StageResponse,
    StageUpdateRequest,
    TransitionCreateRequest,
    TransitionResponse,
    TransitionUpdateRequest,
)
from app.services.admin_config_service import (
    get_admin_configuration_service,
)


router = APIRouter(
    prefix="/admin/config",
    tags=["Admin Configuration"],
)


# =========================================================
# CHATBOT
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}",
    response_model=ChatbotAdminResponse,
)
async def get_chatbot_configuration(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_chatbot(
            chatbot_id=chatbot_id,
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
    "/chatbots/{chatbot_id}",
    response_model=ChatbotAdminResponse,
)
async def update_chatbot_configuration(
    chatbot_id: str,
    payload: ChatbotUpdateRequest,
):
    try:
        service = get_admin_configuration_service()

        return service.update_chatbot(
            chatbot_id=chatbot_id,
            data=payload.model_dump(
                exclude_unset=True
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


# =========================================================
# STAGES
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/stages",
    response_model=list[StageResponse],
)
async def list_stages(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.list_stages(
            chatbot_id=chatbot_id,
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
    "/chatbots/{chatbot_id}/stages",
    response_model=StageResponse,
)
async def create_stage(
    chatbot_id: str,
    payload: StageCreateRequest,
):
    try:
        if payload.chatbot_id != chatbot_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Path chatbot_id and body chatbot_id "
                    "must match."
                ),
            )

        service = get_admin_configuration_service()

        data = payload.model_dump()

        data.pop("chatbot_id")

        return service.create_stage(
            chatbot_id=chatbot_id,
            data=data,
        )

    except HTTPException:
        raise

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
    "/stages/{stage_id}",
    response_model=StageResponse,
)
async def get_stage(
    stage_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_stage(
            stage_id=stage_id,
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
    "/stages/{stage_id}",
    response_model=StageResponse,
)
async def update_stage(
    stage_id: str,
    payload: StageUpdateRequest,
):
    try:
        service = get_admin_configuration_service()

        return service.update_stage(
            stage_id=stage_id,
            data=payload.model_dump(
                exclude_unset=True
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


@router.delete(
    "/stages/{stage_id}",
)
async def delete_stage(
    stage_id: str,
):
    try:
        service = get_admin_configuration_service()

        deleted = service.delete_stage(
            stage_id=stage_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Stage not found.",
            )

        return {
            "success": True,
            "stage_id": stage_id,
            "message": "Stage deleted successfully.",
        }

    except HTTPException:
        raise

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


# =========================================================
# TRANSITIONS
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/transitions",
    response_model=list[TransitionResponse],
)
async def list_transitions(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.list_transitions(
            chatbot_id=chatbot_id,
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
    "/chatbots/{chatbot_id}/transitions",
    response_model=TransitionResponse,
)
async def create_transition(
    chatbot_id: str,
    payload: TransitionCreateRequest,
):
    try:
        if payload.chatbot_id != chatbot_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Path chatbot_id and body chatbot_id "
                    "must match."
                ),
            )

        service = get_admin_configuration_service()

        data = payload.model_dump()

        data.pop("chatbot_id")

        return service.create_transition(
            chatbot_id=chatbot_id,
            data=data,
        )

    except HTTPException:
        raise

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
    "/transitions/{transition_id}",
    response_model=TransitionResponse,
)
async def get_transition(
    transition_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_transition(
            transition_id=transition_id,
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
    "/transitions/{transition_id}",
    response_model=TransitionResponse,
)
async def update_transition(
    transition_id: str,
    payload: TransitionUpdateRequest,
):
    try:
        service = get_admin_configuration_service()

        return service.update_transition(
            transition_id=transition_id,
            data=payload.model_dump(
                exclude_unset=True
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


@router.delete(
    "/transitions/{transition_id}",
)
async def delete_transition(
    transition_id: str,
):
    try:
        service = get_admin_configuration_service()

        deleted = service.delete_transition(
            transition_id=transition_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Transition not found.",
            )

        return {
            "success": True,
            "transition_id": transition_id,
            "message": (
                "Stage transition deleted successfully."
            ),
        }

    except HTTPException:
        raise

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


# =========================================================
# KNOWLEDGE BASE
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/knowledge-bases",
    response_model=list[KnowledgeBaseResponse],
)
async def list_knowledge_bases(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.list_knowledge_bases(
            chatbot_id=chatbot_id,
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
    "/knowledge-bases/{knowledge_base_id}",
    response_model=KnowledgeBaseResponse,
)
async def get_knowledge_base(
    knowledge_base_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_knowledge_base(
            knowledge_base_id=knowledge_base_id,
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
    "/knowledge-bases/{knowledge_base_id}",
    response_model=KnowledgeBaseResponse,
)
async def update_knowledge_base(
    knowledge_base_id: str,
    payload: KnowledgeBaseUpdateRequest,
):
    try:
        service = get_admin_configuration_service()

        return service.update_knowledge_base(
            knowledge_base_id=knowledge_base_id,
            data=payload.model_dump(
                exclude_unset=True
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


# =========================================================
# HANDOFF
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/handoff-rules",
)
async def list_handoff_rules(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.list_handoff_rules(
            chatbot_id=chatbot_id,
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


# =========================================================
# BRANDING
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/branding",
)
async def get_branding(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_branding(
            chatbot_id=chatbot_id,
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


# =========================================================
# AI PROVIDERS
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/ai-providers",
)
async def list_ai_providers(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.list_ai_providers(
            chatbot_id=chatbot_id,
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


# =========================================================
# FULL CONFIGURATION
# =========================================================


@router.get(
    "/chatbots/{chatbot_id}/configuration",
    response_model=ChatbotConfigurationResponse,
)
async def get_full_chatbot_configuration(
    chatbot_id: str,
):
    try:
        service = get_admin_configuration_service()

        return service.get_full_configuration(
            chatbot_id=chatbot_id,
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
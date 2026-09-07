from fastapi import APIRouter, HTTPException

from app.schemas.branding import (
    BrandingCreateRequest,
    BrandingResponse,
    BrandingUpdateRequest,
    PublicBrandingResponse,
)
from app.services.branding_service import get_branding_service


router = APIRouter(
    prefix="/branding",
    tags=["Branding"],
)


# =========================================================
# CREATE / UPDATE BRANDING
# =========================================================

@router.post(
    "",
    response_model=BrandingResponse,
)
async def create_or_update_branding(
    payload: BrandingCreateRequest,
):
    try:
        service = get_branding_service()

        data = payload.model_dump()

        chatbot_id = data.pop("chatbot_id")

        return service.create_or_update_branding(
            chatbot_id=chatbot_id,
            data=data,
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
# GET BRANDING FOR CHATBOT
# =========================================================

@router.get(
    "/chatbot/{chatbot_id}",
    response_model=BrandingResponse,
)
async def get_chatbot_branding(
    chatbot_id: str,
):
    try:
        service = get_branding_service()

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
# PUBLIC BRANDING
# =========================================================

@router.get(
    "/chatbot/{chatbot_id}/public",
    response_model=PublicBrandingResponse,
)
async def get_public_chatbot_branding(
    chatbot_id: str,
):
    try:
        service = get_branding_service()

        return service.get_public_branding(
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
# GET BRANDING BY ID
# =========================================================

@router.get(
    "/{branding_id}",
    response_model=BrandingResponse,
)
async def get_branding(
    branding_id: str,
):
    try:
        service = get_branding_service()

        return service.get_branding_by_id(
            branding_id=branding_id,
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
# UPDATE BRANDING
# =========================================================

@router.patch(
    "/chatbot/{chatbot_id}",
    response_model=BrandingResponse,
)
async def update_chatbot_branding(
    chatbot_id: str,
    payload: BrandingUpdateRequest,
):
    try:
        service = get_branding_service()

        data = payload.model_dump(
            exclude_unset=True
        )

        return service.create_or_update_branding(
            chatbot_id=chatbot_id,
            data=data,
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
# DELETE BRANDING
# =========================================================

@router.delete(
    "/chatbot/{chatbot_id}",
)
async def delete_chatbot_branding(
    chatbot_id: str,
):
    try:
        service = get_branding_service()

        deleted = service.delete_branding(
            chatbot_id=chatbot_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No branding configuration found "
                    f"for chatbot '{chatbot_id}'."
                ),
            )

        return {
            "success": True,
            "chatbot_id": chatbot_id,
            "message": "Branding deleted successfully.",
        }

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
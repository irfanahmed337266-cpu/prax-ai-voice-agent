from fastapi import APIRouter, HTTPException, status

from app.schemas.ai_provider import (
    AIProviderCreate,
    AIProviderGenerateRequest,
    AIProviderGenerateResponse,
    AIProviderResponse,
    AIProviderUpdate,
)
from app.services.ai_provider_service import (
    AIProviderService,
)


router = APIRouter(
    prefix="/ai-providers",
    tags=["AI Providers"],
)


@router.post(
    "",
    response_model=AIProviderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ai_provider(
    payload: AIProviderCreate,
):
    try:
        service = AIProviderService()

        return service.create_provider(
            chatbot_id=payload.chatbot_id,
            provider=payload.provider,
            model=payload.model,
            api_key=payload.api_key,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{provider_id}",
    response_model=AIProviderResponse,
)
def get_ai_provider(
    provider_id: str,
):
    try:
        service = AIProviderService()

        record = service.get_provider(
            provider_id
        )

        return service._safe_response(record)

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
    "/{provider_id}",
    response_model=AIProviderResponse,
)
def update_ai_provider(
    provider_id: str,
    payload: AIProviderUpdate,
):
    try:
        service = AIProviderService()

        updates = payload.model_dump(
            exclude_unset=True
        )

        return service.update_provider(
            provider_id,
            updates,
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
    "/{provider_id}",
)
def delete_ai_provider(
    provider_id: str,
):
    try:
        service = AIProviderService()

        deleted = service.delete_provider(
            provider_id
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="AI provider not found.",
            )

        return {
            "success": True,
            "message": "AI provider deleted.",
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.post(
    "/{provider_id}/test",
)
async def test_ai_provider(
    provider_id: str,
):
    try:
        service = AIProviderService()

        return await service.test_connection(
            provider_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
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


@router.post(
    "/{provider_id}/generate",
    response_model=AIProviderGenerateResponse,
)
async def generate_ai_response(
    provider_id: str,
    payload: AIProviderGenerateRequest,
):
    try:
        service = AIProviderService()

        result = await service.generate_response(
            provider_id=provider_id,
            system_prompt=payload.system_prompt,
            user_message=payload.user_message,
        )

        return {
            "success": True,
            "provider": result.provider,
            "model": result.model,
            "content": result.content,
            "input_tokens": result.input_tokens,
            "output_tokens": result.output_tokens,
            "total_tokens": result.total_tokens,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
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
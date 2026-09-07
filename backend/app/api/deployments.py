from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

from app.schemas.deployment import (
    DeploymentCreateRequest,
    DeploymentCreateResponse,
    DeploymentPublicResponse,
    DeploymentResponse,
    DeploymentRotateKeyResponse,
    DeploymentUpdateRequest,
)

from app.schemas.public_chat import (
    PublicChatRequest,
    PublicChatResponse,
)

from app.services.deployment_service import (
    get_deployment_service,
)

from app.services.public_chat_service import (
    get_public_chat_service,
)

from app.services.embed_service import (
    get_embed_service,
)


router = APIRouter(
    prefix="/deployments",
    tags=["Deployments"],
)


# ============================================================================
# ADMIN DEPLOYMENT APIs
# ============================================================================


@router.post(
    "",
    response_model=DeploymentCreateResponse,
)
async def create_deployment(
    payload: DeploymentCreateRequest,
):
    try:
        service = get_deployment_service()

        return service.create_deployment(
            chatbot_id=payload.chatbot_id,
            name=payload.name,
            allowed_domains=payload.allowed_domains,
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
    "/chatbot/{chatbot_id}",
    response_model=list[DeploymentResponse],
)
async def list_deployments(
    chatbot_id: str,
):
    try:
        service = get_deployment_service()

        return service.list_deployments(
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


# ============================================================================
# PUBLIC DEPLOYMENT CONFIGURATION
# ============================================================================


@router.get(
    "/public/config",
    response_model=DeploymentPublicResponse,
)
async def get_public_deployment_config(
    request: Request,
    deployment_key: str,
):
    try:
        origin = request.headers.get(
            "origin"
        )

        service = get_deployment_service()

        return service.resolve_public_deployment(
            deployment_key=deployment_key,
            origin=origin,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=403,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        message = str(exc)

        if (
            "Deployment key" in message
            or "Invalid or inactive deployment"
            in message
        ):
            raise HTTPException(
                status_code=401,
                detail=message,
            ) from exc

        raise HTTPException(
            status_code=400,
            detail=message,
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


# ============================================================================
# TASK 6 — PUBLIC EMBED SCRIPT
# ============================================================================


@router.get(
    "/public/embed.js",
)
async def get_public_embed_script(
    request: Request,
    deployment_key: str,
):
    """
    Return the PRAX browser embed loader.

    The deployment key is required to identify the deployment.

    The script itself does not receive any AI provider credentials.
    The browser subsequently requests public configuration and chat
    using the deployment key.

    Domain protection remains enforced by the public configuration
    endpoint and public chat endpoint.
    """

    try:
        if not deployment_key:
            raise ValueError(
                "Deployment key is required."
            )

        service = get_deployment_service()

        # Verify that the deployment exists and is active.
        #
        # We intentionally do not require Origin here because
        # browsers may request a classic <script> resource without
        # sending an Origin header.
        deployment = service.get_public_deployment_by_key(
            deployment_key=deployment_key
        )

        if not deployment.get(
            "is_active",
            False,
        ):
            raise ValueError(
                "Invalid or inactive deployment."
            )

        api_base_url = str(
            request.base_url
        ).rstrip("/")

        embed_service = get_embed_service()

        script = embed_service.generate_embed_script(
            deployment_key=deployment_key,
            api_base_url=api_base_url,
        )

        return Response(
            content=script,
            media_type="application/javascript",
            headers={
                "Cache-Control": (
                    "no-store, "
                    "no-cache, "
                    "must-revalidate"
                ),
                "X-Content-Type-Options": "nosniff",
            },
        )

    except ValueError as exc:
        message = str(exc)

        if (
            "Deployment key" in message
            or "Invalid or inactive deployment"
            in message
        ):
            raise HTTPException(
                status_code=401,
                detail=message,
            ) from exc

        raise HTTPException(
            status_code=400,
            detail=message,
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


# ============================================================================
# TASK 7 — GENERATED EMBED SNIPPET
# ============================================================================


@router.get(
    "/public/embed-snippet",
)
async def get_public_embed_snippet(
    request: Request,
    deployment_key: str,
):
    """
    Return the copy-paste HTML snippet for a PRAX chatbot.

    The deployment key identifies the public deployment.

    No AI provider credentials are exposed.
    """

    if not deployment_key:
        raise HTTPException(
            status_code=400,
            detail="Deployment key is required.",
        )

    service = get_deployment_service()

    try:
        deployment = service.get_public_deployment_by_key(
            deployment_key=deployment_key,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=401,
            detail=str(exc),
        ) from exc

    if not deployment.get(
        "is_active",
        False,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or inactive deployment.",
        )

    api_base_url = str(
        request.base_url
    ).rstrip("/")

    embed_url = (
        f"{api_base_url}"
        f"/api/deployments/public/embed.js"
        f"?deployment_key={deployment_key}"
    )

    snippet = (
        "<!-- PRAX AI Chatbot -->\n"
        "<script\n"
        f'    src="{embed_url}"\n'
        "    defer>\n"
        "</script>"
    )

    return {
        "deployment_id": deployment["id"],
        "chatbot_id": deployment["chatbot_id"],
        "embed_url": embed_url,
        "snippet": snippet,
    }


# ============================================================================
# PUBLIC CHAT
# ============================================================================


@router.post(
    "/public/chat",
    response_model=PublicChatResponse,
)
async def public_chat(
    request: Request,
    payload: PublicChatRequest,
):
    try:
        origin = request.headers.get(
            "origin"
        )

        deployment_key = request.headers.get(
            "x-deployment-key"
        )

        service = get_public_chat_service()

        return await service.chat(
            deployment_key=deployment_key or "",
            origin=origin,
            conversation_id=payload.conversation_id,
            user_message=payload.user_message,
        )

    except PermissionError as exc:
        raise HTTPException(
            status_code=403,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        message = str(exc)

        if (
            "Deployment key" in message
            or "Invalid or inactive deployment"
            in message
        ):
            raise HTTPException(
                status_code=401,
                detail=message,
            ) from exc

        if "Conversation not found" in message:
            raise HTTPException(
                status_code=404,
                detail=message,
            ) from exc

        raise HTTPException(
            status_code=400,
            detail=message,
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


# ============================================================================
# DEPLOYMENT KEY ROTATION
# ============================================================================


@router.post(
    "/{deployment_id}/rotate-key",
    response_model=DeploymentRotateKeyResponse,
)
async def rotate_deployment_key(
    deployment_id: str,
):
    try:
        service = get_deployment_service()

        return service.rotate_deployment_key(
            deployment_id=deployment_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


# ============================================================================
# ADMIN SINGLE DEPLOYMENT APIs
# ============================================================================


@router.get(
    "/{deployment_id}",
    response_model=DeploymentResponse,
)
async def get_deployment(
    deployment_id: str,
):
    try:
        service = get_deployment_service()

        return service.get_deployment(
            deployment_id=deployment_id,
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
    "/{deployment_id}",
    response_model=DeploymentResponse,
)
async def update_deployment(
    deployment_id: str,
    payload: DeploymentUpdateRequest,
):
    try:
        service = get_deployment_service()

        return service.update_deployment(
            deployment_id=deployment_id,
            name=payload.name,
            allowed_domains=payload.allowed_domains,
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


@router.delete(
    "/{deployment_id}",
)
async def delete_deployment(
    deployment_id: str,
):
    try:
        service = get_deployment_service()

        deleted = service.delete_deployment(
            deployment_id=deployment_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Deployment not found.",
            )

        return {
            "success": True,
            "deployment_id": deployment_id,
            "message": (
                "Deployment deleted successfully."
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
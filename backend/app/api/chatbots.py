from fastapi import APIRouter, HTTPException, status

from app.schemas.chatbot import (
    ChatbotAdminResponse,
    ChatbotCreateRequest,
    ChatbotListResponse,
    ChatbotUpdateRequest,
)
from app.supabase.client import supabase


router = APIRouter(
    prefix="/chatbots",
    tags=["Chatbots"],
)


@router.post(
    "",
    response_model=ChatbotAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_chatbot(payload: ChatbotCreateRequest):
    data = payload.model_dump(mode="json")

    try:
        response = (
            supabase
            .table("chatbots")
            .insert(data)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create chatbot: {exc}",
        ) from exc

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Chatbot was not created.",
        )

    return response.data[0]


@router.get(
    "",
    response_model=ChatbotListResponse,
)
async def list_chatbots():
    try:
        response = (
            supabase
            .table("chatbots")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list chatbots: {exc}",
        ) from exc

    items = response.data or []

    return {
        "items": items,
        "total": len(items),
    }


@router.get(
    "/{chatbot_id}",
    response_model=ChatbotAdminResponse,
)
async def get_chatbot(chatbot_id: str):
    try:
        response = (
            supabase
            .table("chatbots")
            .select("*")
            .eq("id", chatbot_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get chatbot: {exc}",
        ) from exc

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Chatbot not found.",
        )

    return response.data


@router.patch(
    "/{chatbot_id}",
    response_model=ChatbotAdminResponse,
)
async def update_chatbot(
    chatbot_id: str,
    payload: ChatbotUpdateRequest,
):
    updates = payload.model_dump(
        mode="json",
        exclude_unset=True,
    )

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields were provided for update.",
        )

    try:
        response = (
            supabase
            .table("chatbots")
            .update(updates)
            .eq("id", chatbot_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update chatbot: {exc}",
        ) from exc

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Chatbot not found.",
        )

    return response.data[0]


@router.delete(
    "/{chatbot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_chatbot(chatbot_id: str):
    try:
        response = (
            supabase
            .table("chatbots")
            .delete()
            .eq("id", chatbot_id)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete chatbot: {exc}",
        ) from exc

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Chatbot not found.",
        )

    return None
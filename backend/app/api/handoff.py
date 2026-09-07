from fastapi import APIRouter, HTTPException

from app.schemas.handoff import (
    HandoffEvaluationResponse,
    HandoffRuleCreateRequest,
    HandoffRuleResponse,
    HandoffRuleUpdateRequest,
)
from app.services.handoff_service import (
    get_handoff_service,
)


router = APIRouter(
    prefix="/handoff",
    tags=["Human Handoff"],
)


# =========================================================
# CREATE RULE
# =========================================================

@router.post(
    "/rules",
    response_model=HandoffRuleResponse,
)
def create_rule(
    payload: HandoffRuleCreateRequest,
):
    try:
        service = get_handoff_service()

        return service.create_rule(
            chatbot_id=payload.chatbot_id,
            name=payload.name,
            condition=payload.condition,
            priority=payload.priority,
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


# =========================================================
# LIST RULES
# =========================================================

@router.get(
    "/rules/chatbot/{chatbot_id}",
    response_model=list[HandoffRuleResponse],
)
def list_rules(
    chatbot_id: str,
    active_only: bool = False,
):
    try:
        service = get_handoff_service()

        return service.list_rules(
            chatbot_id=chatbot_id,
            active_only=active_only,
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
# GET RULE
# =========================================================

@router.get(
    "/rules/{rule_id}",
    response_model=HandoffRuleResponse,
)
def get_rule(
    rule_id: str,
):
    try:
        service = get_handoff_service()

        return service.get_rule(
            rule_id
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
# UPDATE RULE
# =========================================================

@router.patch(
    "/rules/{rule_id}",
    response_model=HandoffRuleResponse,
)
def update_rule(
    rule_id: str,
    payload: HandoffRuleUpdateRequest,
):
    try:
        service = get_handoff_service()

        updates = payload.model_dump(
            exclude_unset=True
        )

        return service.update_rule(
            rule_id=rule_id,
            updates=updates,
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
# DELETE RULE
# =========================================================

@router.delete(
    "/rules/{rule_id}",
)
def delete_rule(
    rule_id: str,
):
    try:
        service = get_handoff_service()

        deleted = service.delete_rule(
            rule_id
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Handoff rule "
                    f"'{rule_id}' not found."
                ),
            )

        return {
            "success": True,
            "id": rule_id,
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


# =========================================================
# TEST / EVALUATE
# =========================================================

@router.post(
    "/evaluate",
    response_model=HandoffEvaluationResponse,
)
def evaluate_handoff(
    chatbot_id: str,
    user_message: str,
):
    try:
        service = get_handoff_service()

        return service.evaluate(
            chatbot_id=chatbot_id,
            user_message=user_message,
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
# GET CONVERSATION HANDOFF STATUS
# =========================================================

@router.get(
    "/conversations/{conversation_id}",
    response_model=HandoffEvaluationResponse,
)
def get_conversation_handoff(
    conversation_id: str,
):
    try:
        service = get_handoff_service()

        return service.get_handoff_status(
            conversation_id=conversation_id,
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
# UPDATE CONVERSATION HANDOFF STATUS
# =========================================================

@router.patch(
    "/conversations/{conversation_id}/status",
)
def update_conversation_handoff_status(
    conversation_id: str,
    status: str,
):
    try:
        service = get_handoff_service()

        return service.set_handoff_status(
            conversation_id=conversation_id,
            status=status,
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
# LIST PENDING HANDOFFS
# =========================================================

@router.get(
    "/conversations/chatbot/{chatbot_id}/pending",
)
def list_pending_handoffs(
    chatbot_id: str,
):
    try:
        service = get_handoff_service()

        return service.list_pending_handoffs(
            chatbot_id=chatbot_id,
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
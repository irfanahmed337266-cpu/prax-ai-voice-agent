from typing import Any

from app.supabase.client import get_supabase_client


class HandoffService:
    TABLE_NAME = "handoff_rules"
    CONVERSATIONS_TABLE = "conversations"

    VALID_HANDOFF_STATUSES = {
        "pending",
        "assigned",
        "resolved",
    }

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    # =========================================================
    # HANDOFF RULE MANAGEMENT
    # =========================================================

    def create_rule(
        self,
        chatbot_id: str,
        name: str,
        condition: str,
        priority: int = 0,
        is_active: bool = True,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError("chatbot_id is required.")

        if not name or not name.strip():
            raise ValueError("name is required.")

        if not condition or not condition.strip():
            raise ValueError("condition is required.")

        payload = {
            "chatbot_id": chatbot_id,
            "name": name.strip(),
            "condition": condition.strip(),
            "priority": priority,
            "is_active": is_active,
        }

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to create handoff rule."
            )

        return response.data[0]

    def get_rule(
        self,
        rule_id: str,
    ) -> dict[str, Any]:

        if not rule_id:
            raise ValueError(
                "rule_id is required."
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("id", rule_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Handoff rule '{rule_id}' not found."
            )

        return response.data

    def list_rules(
        self,
        chatbot_id: str,
        active_only: bool = False,
    ) -> list[dict[str, Any]]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        query = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("chatbot_id", chatbot_id)
        )

        if active_only:
            query = query.eq(
                "is_active",
                True,
            )

        response = (
            query
            .order("priority", desc=True)
            .order("created_at", desc=False)
            .execute()
        )

        return response.data or []

    def update_rule(
        self,
        rule_id: str,
        updates: dict[str, Any],
    ) -> dict[str, Any]:

        if not rule_id:
            raise ValueError(
                "rule_id is required."
            )

        allowed_fields = {
            "name",
            "condition",
            "priority",
            "is_active",
        }

        clean_updates = {
            key: value
            for key, value in dict(updates).items()
            if key in allowed_fields
            and value is not None
        }

        if "name" in clean_updates:
            clean_updates["name"] = (
                str(clean_updates["name"]).strip()
            )

        if "condition" in clean_updates:
            clean_updates["condition"] = (
                str(clean_updates["condition"]).strip()
            )

        if not clean_updates:
            return self.get_rule(rule_id)

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .update(clean_updates)
            .eq("id", rule_id)
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Handoff rule '{rule_id}' not found."
            )

        return response.data[0]

    def delete_rule(
        self,
        rule_id: str,
    ) -> bool:

        if not rule_id:
            raise ValueError(
                "rule_id is required."
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .delete()
            .eq("id", rule_id)
            .execute()
        )

        return bool(response.data)

    # =========================================================
    # HANDOFF EVALUATION
    # =========================================================

    def evaluate(
        self,
        chatbot_id: str,
        user_message: str,
    ) -> dict[str, Any]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        if not user_message or not user_message.strip():
            return {
                "handoff_required": False,
                "handoff_reason": "",
                "matched_rule_id": None,
                "matched_rule_name": None,
            }

        rules = self.list_rules(
            chatbot_id=chatbot_id,
            active_only=True,
        )

        message = user_message.strip().casefold()

        for rule in rules:

            condition = str(
                rule.get("condition") or ""
            ).strip()

            if not condition:
                continue

            if condition.casefold() in message:

                rule_name = str(
                    rule.get("name")
                    or "Human handoff"
                )

                return {
                    "handoff_required": True,
                    "handoff_reason": (
                        f"Handoff rule matched: "
                        f"{rule_name}"
                    ),
                    "matched_rule_id": rule.get(
                        "id"
                    ),
                    "matched_rule_name": rule_name,
                }

        return {
            "handoff_required": False,
            "handoff_reason": "",
            "matched_rule_id": None,
            "matched_rule_name": None,
        }

    # =========================================================
    # CONVERSATION HANDOFF MANAGEMENT
    # =========================================================

    def _get_conversation(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        if not conversation_id:
            raise ValueError(
                "conversation_id is required."
            )

        response = (
            self.supabase
            .table(self.CONVERSATIONS_TABLE)
            .select("*")
            .eq("id", conversation_id)
            .single()
            .execute()
        )

        if not response.data:
            raise ValueError(
                f"Conversation '{conversation_id}' "
                "not found."
            )

        return response.data

    def get_handoff_status(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:

        conversation = self._get_conversation(
            conversation_id
        )

        state = conversation.get("state") or {}

        return {
            "conversation_id": conversation_id,
            "handoff_required": bool(
                state.get(
                    "handoff_required",
                    False,
                )
            ),
            "handoff_status": state.get(
                "handoff_status"
            ),
            "handoff_reason": state.get(
                "handoff_reason",
                "",
            ),
            "matched_rule_id": state.get(
                "matched_handoff_rule_id"
            ),
            "matched_rule_name": state.get(
                "matched_handoff_rule_name"
            ),
        }

    def set_handoff_status(
        self,
        conversation_id: str,
        status: str,
    ) -> dict[str, Any]:

        if status not in self.VALID_HANDOFF_STATUSES:
            raise ValueError(
                "Invalid handoff status. "
                "Allowed values: pending, assigned, resolved."
            )

        conversation = self._get_conversation(
            conversation_id
        )

        state = dict(
            conversation.get("state") or {}
        )

        handoff_required = bool(
            state.get(
                "handoff_required",
                False,
            )
        )

        if not handoff_required:
            raise ValueError(
                "Conversation does not currently "
                "require human handoff."
            )

        state["handoff_status"] = status

        if status == "resolved":
            state["handoff_required"] = False

        response = (
            self.supabase
            .table(self.CONVERSATIONS_TABLE)
            .update(
                {
                    "state": state,
                }
            )
            .eq(
                "id",
                conversation_id,
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Failed to update handoff status."
            )

        return self.get_handoff_status(
            conversation_id
        )

    def list_pending_handoffs(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        if not chatbot_id:
            raise ValueError(
                "chatbot_id is required."
            )

        response = (
            self.supabase
            .table(self.CONVERSATIONS_TABLE)
            .select(
                "id,chatbot_id,external_user_id,"
                "current_stage_id,state,status,"
                "created_at,updated_at"
            )
            .eq(
                "chatbot_id",
                chatbot_id,
            )
            .eq(
                "status",
                "active",
            )
            .execute()
        )

        conversations = response.data or []

        pending: list[dict[str, Any]] = []

        for conversation in conversations:

            state = conversation.get(
                "state"
            ) or {}

            if not state.get(
                "handoff_required",
                False,
            ):
                continue

            handoff_status = state.get(
                "handoff_status",
                "pending",
            )

            if handoff_status != "pending":
                continue

            pending.append(
                {
                    "conversation_id": conversation.get(
                        "id"
                    ),
                    "chatbot_id": conversation.get(
                        "chatbot_id"
                    ),
                    "external_user_id": conversation.get(
                        "external_user_id"
                    ),
                    "handoff_status": (
                        handoff_status
                    ),
                    "handoff_reason": state.get(
                        "handoff_reason",
                        "",
                    ),
                    "matched_rule_id": state.get(
                        "matched_handoff_rule_id"
                    ),
                    "matched_rule_name": state.get(
                        "matched_handoff_rule_name"
                    ),
                    "current_stage_id": conversation.get(
                        "current_stage_id"
                    ),
                    "created_at": conversation.get(
                        "created_at"
                    ),
                    "updated_at": conversation.get(
                        "updated_at"
                    ),
                }
            )

        return pending


def get_handoff_service() -> HandoffService:
    return HandoffService()
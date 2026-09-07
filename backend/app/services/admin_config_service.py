from typing import Any

from app.supabase.client import get_supabase_client


class AdminConfigurationService:
    CHATBOTS_TABLE = "chatbots"
    STAGES_TABLE = "chatbot_stages"
    TRANSITIONS_TABLE = "stage_transitions"
    KNOWLEDGE_BASES_TABLE = "knowledge_bases"
    HANDOFF_RULES_TABLE = "handoff_rules"
    BRANDING_TABLE = "branding"
    AI_PROVIDERS_TABLE = "ai_providers"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    # =========================================================
    # COMMON VALIDATION
    # =========================================================

    def validate_chatbot(self, chatbot_id: str) -> dict[str, Any]:
        if not chatbot_id:
            raise ValueError("chatbot_id is required.")

        response = (
            self.supabase
            .table(self.CHATBOTS_TABLE)
            .select("*")
            .eq("id", chatbot_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Chatbot '{chatbot_id}' not found."
            )

        return data[0]

    def _get_stage(
        self,
        stage_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table(self.STAGES_TABLE)
            .select("*")
            .eq("id", stage_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Stage '{stage_id}' not found."
            )

        return data[0]

    def _validate_stage_belongs_to_chatbot(
        self,
        stage_id: str,
        chatbot_id: str,
    ) -> dict[str, Any]:

        stage = self._get_stage(stage_id)

        if stage.get("chatbot_id") != chatbot_id:
            raise ValueError(
                f"Stage '{stage_id}' does not belong to "
                f"chatbot '{chatbot_id}'."
            )

        return stage

    # =========================================================
    # CHATBOT
    # =========================================================

    def get_chatbot(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        return self.validate_chatbot(chatbot_id)

    def update_chatbot(
        self,
        chatbot_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        self.validate_chatbot(chatbot_id)

        allowed_fields = {
            "name",
            "business_name",
            "use_case",
            "website_url",
            "system_prompt",
            "is_active",
        }

        payload = {
            key: value
            for key, value in data.items()
            if key in allowed_fields
        }

        if not payload:
            return self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.CHATBOTS_TABLE)
            .update(payload)
            .eq("id", chatbot_id)
            .execute()
        )

        data = response.data or []

        if not data:
            raise RuntimeError(
                "Failed to update chatbot configuration."
            )

        return data[0]

    # =========================================================
    # STAGES
    # =========================================================

    def list_stages(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.STAGES_TABLE)
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("stage_order")
            .order("created_at")
            .execute()
        )

        return response.data or []

    def create_stage(
        self,
        chatbot_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        self.validate_chatbot(chatbot_id)

        payload = {
            "chatbot_id": chatbot_id,
            "name": data["name"],
            "description": data.get("description"),
            "stage_order": data.get("stage_order", 0),
            "is_start": bool(data.get("is_start", False)),
            "is_terminal": bool(data.get("is_terminal", False)),
        }

        # Only one start stage should exist.
        if payload["is_start"]:
            self.supabase.table(
                self.STAGES_TABLE
            ).update(
                {"is_start": False}
            ).eq(
                "chatbot_id",
                chatbot_id,
            ).execute()

        response = (
            self.supabase
            .table(self.STAGES_TABLE)
            .insert(payload)
            .execute()
        )

        inserted = response.data or []

        if not inserted:
            raise RuntimeError(
                "Failed to create chatbot stage."
            )

        return inserted[0]

    def get_stage(
        self,
        stage_id: str,
    ) -> dict[str, Any]:

        return self._get_stage(stage_id)

    def update_stage(
        self,
        stage_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        existing = self._get_stage(stage_id)

        payload = {
            key: value
            for key, value in data.items()
            if key in {
                "name",
                "description",
                "stage_order",
                "is_start",
                "is_terminal",
            }
        }

        if not payload:
            return existing

        if payload.get("is_start") is True:
            self.supabase.table(
                self.STAGES_TABLE
            ).update(
                {"is_start": False}
            ).eq(
                "chatbot_id",
                existing["chatbot_id"],
            ).neq(
                "id",
                stage_id,
            ).execute()

        response = (
            self.supabase
            .table(self.STAGES_TABLE)
            .update(payload)
            .eq("id", stage_id)
            .execute()
        )

        updated = response.data or []

        if not updated:
            raise RuntimeError(
                "Failed to update chatbot stage."
            )

        return updated[0]

    def delete_stage(
        self,
        stage_id: str,
    ) -> bool:

        self._get_stage(stage_id)

        response = (
            self.supabase
            .table(self.STAGES_TABLE)
            .delete()
            .eq("id", stage_id)
            .execute()
        )

        return bool(response.data)

    # =========================================================
    # TRANSITIONS
    # =========================================================

    def list_transitions(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.TRANSITIONS_TABLE)
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("priority", desc=True)
            .order("created_at")
            .execute()
        )

        return response.data or []

    def create_transition(
        self,
        chatbot_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        self.validate_chatbot(chatbot_id)

        from_stage_id = data["from_stage_id"]
        to_stage_id = data["to_stage_id"]

        self._validate_stage_belongs_to_chatbot(
            from_stage_id,
            chatbot_id,
        )

        self._validate_stage_belongs_to_chatbot(
            to_stage_id,
            chatbot_id,
        )

        if from_stage_id == to_stage_id:
            raise ValueError(
                "A stage transition cannot point to the same stage."
            )

        payload = {
            "chatbot_id": chatbot_id,
            "from_stage_id": from_stage_id,
            "to_stage_id": to_stage_id,
            "condition": data.get("condition"),
            "priority": data.get("priority", 0),
        }

        response = (
            self.supabase
            .table(self.TRANSITIONS_TABLE)
            .insert(payload)
            .execute()
        )

        inserted = response.data or []

        if not inserted:
            raise RuntimeError(
                "Failed to create stage transition."
            )

        return inserted[0]

    def get_transition(
        self,
        transition_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table(self.TRANSITIONS_TABLE)
            .select("*")
            .eq("id", transition_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Transition '{transition_id}' not found."
            )

        return data[0]

    def update_transition(
        self,
        transition_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        existing = self.get_transition(transition_id)

        chatbot_id = existing["chatbot_id"]

        from_stage_id = data.get(
            "from_stage_id",
            existing["from_stage_id"],
        )

        to_stage_id = data.get(
            "to_stage_id",
            existing["to_stage_id"],
        )

        self._validate_stage_belongs_to_chatbot(
            from_stage_id,
            chatbot_id,
        )

        self._validate_stage_belongs_to_chatbot(
            to_stage_id,
            chatbot_id,
        )

        if from_stage_id == to_stage_id:
            raise ValueError(
                "A stage transition cannot point to the same stage."
            )

        payload = {
            key: value
            for key, value in data.items()
            if key in {
                "from_stage_id",
                "to_stage_id",
                "condition",
                "priority",
            }
        }

        if not payload:
            return existing

        response = (
            self.supabase
            .table(self.TRANSITIONS_TABLE)
            .update(payload)
            .eq("id", transition_id)
            .execute()
        )

        updated = response.data or []

        if not updated:
            raise RuntimeError(
                "Failed to update stage transition."
            )

        return updated[0]

    def delete_transition(
        self,
        transition_id: str,
    ) -> bool:

        self.get_transition(transition_id)

        response = (
            self.supabase
            .table(self.TRANSITIONS_TABLE)
            .delete()
            .eq("id", transition_id)
            .execute()
        )

        return bool(response.data)

    # =========================================================
    # KNOWLEDGE BASES
    # =========================================================

    def list_knowledge_bases(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.KNOWLEDGE_BASES_TABLE)
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("created_at")
            .execute()
        )

        return response.data or []

    def get_knowledge_base(
        self,
        knowledge_base_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table(self.KNOWLEDGE_BASES_TABLE)
            .select("*")
            .eq("id", knowledge_base_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Knowledge base '{knowledge_base_id}' not found."
            )

        return data[0]

    def update_knowledge_base(
        self,
        knowledge_base_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        existing = self.get_knowledge_base(
            knowledge_base_id
        )

        payload = {
            key: value
            for key, value in data.items()
            if key in {
                "name",
                "description",
                "is_active",
            }
        }

        if not payload:
            return existing

        response = (
            self.supabase
            .table(self.KNOWLEDGE_BASES_TABLE)
            .update(payload)
            .eq("id", knowledge_base_id)
            .execute()
        )

        updated = response.data or []

        if not updated:
            raise RuntimeError(
                "Failed to update knowledge base."
            )

        return updated[0]

    # =========================================================
    # HANDOFF RULES
    # =========================================================

    def list_handoff_rules(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.HANDOFF_RULES_TABLE)
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .order("priority", desc=True)
            .order("created_at")
            .execute()
        )

        return response.data or []

    # =========================================================
    # BRANDING
    # =========================================================

    def get_branding(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        self.validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.BRANDING_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "primary_color,"
                "secondary_color,"
                "logo_url,"
                "bot_name,"
                "welcome_message,"
                "widget_position"
            )
            .eq("chatbot_id", chatbot_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if data:
            return data[0]

        return {
            "id": None,
            "chatbot_id": chatbot_id,
            "primary_color": "#000000",
            "secondary_color": "#FFFFFF",
            "logo_url": None,
            "bot_name": "Assistant",
            "welcome_message": "Hello! How can I help you?",
            "widget_position": "bottom-right",
        }

    # =========================================================
    # AI PROVIDERS
    # =========================================================

    def list_ai_providers(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self.validate_chatbot(chatbot_id)

        # IMPORTANT:
        # api_key_encrypted is deliberately NOT selected.
        response = (
            self.supabase
            .table(self.AI_PROVIDERS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "provider,"
                "model,"
                "is_active,"
                "created_at,"
                "updated_at"
            )
            .eq("chatbot_id", chatbot_id)
            .order("created_at")
            .execute()
        )

        return response.data or []

    # =========================================================
    # CENTRAL CONFIGURATION
    # =========================================================

    def get_full_configuration(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        chatbot = self.get_chatbot(chatbot_id)

        stages = self.list_stages(chatbot_id)

        transitions = self.list_transitions(chatbot_id)

        knowledge_bases = self.list_knowledge_bases(
            chatbot_id
        )

        handoff_rules = self.list_handoff_rules(
            chatbot_id
        )

        branding = self.get_branding(chatbot_id)

        ai_providers = self.list_ai_providers(
            chatbot_id
        )

        return {
            "chatbot": chatbot,
            "stages": stages,
            "transitions": transitions,
            "knowledge_bases": knowledge_bases,
            "handoff_rules": handoff_rules,
            "branding": branding,
            "ai_providers": ai_providers,
        }


def get_admin_configuration_service() -> AdminConfigurationService:
    return AdminConfigurationService()
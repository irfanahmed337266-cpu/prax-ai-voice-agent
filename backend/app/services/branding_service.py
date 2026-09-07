from typing import Any

from app.supabase.client import get_supabase_client


class BrandingService:
    TABLE_NAME = "branding"

    DEFAULT_BRANDING: dict[str, Any] = {
        "primary_color": "#000000",
        "secondary_color": "#FFFFFF",
        "logo_url": None,
        "bot_name": "Assistant",
        "welcome_message": "Hello! How can I help you?",
        "widget_position": "bottom-right",
    }

    ALLOWED_POSITIONS = {
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
    }

    ALLOWED_FIELDS = {
        "primary_color",
        "secondary_color",
        "logo_url",
        "bot_name",
        "welcome_message",
        "widget_position",
    }

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    # ---------------------------------------------------------
    # CHATBOT VALIDATION
    # ---------------------------------------------------------

    def _validate_chatbot(self, chatbot_id: str) -> None:
        if not chatbot_id:
            raise ValueError("chatbot_id is required.")

        response = (
            self.supabase
            .table("chatbots")
            .select("id")
            .eq("id", chatbot_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Chatbot '{chatbot_id}' not found."
            )

    # ---------------------------------------------------------
    # GET EXISTING BRANDING
    # ---------------------------------------------------------

    def _get_existing(
        self,
        chatbot_id: str,
    ) -> dict[str, Any] | None:

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("chatbot_id", chatbot_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            return None

        return data[0]

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    def _validate_position(
        self,
        position: str,
    ) -> str:

        position = position.strip().lower()

        if position not in self.ALLOWED_POSITIONS:
            raise ValueError(
                "widget_position must be one of: "
                "bottom-right, bottom-left, top-right, top-left."
            )

        return position

    def _validate_color(
        self,
        color: str,
    ) -> str:

        color = color.strip()

        if not color.startswith("#"):
            raise ValueError(
                "Color must be a hexadecimal value such as #000000."
            )

        if len(color) not in (4, 7):
            raise ValueError(
                "Color must use #RGB or #RRGGBB format."
            )

        hex_part = color[1:]

        if not all(
            character in "0123456789abcdefABCDEF"
            for character in hex_part
        ):
            raise ValueError(
                "Color must be a valid hexadecimal color."
            )

        return color

    def _validate_logo_url(
        self,
        logo_url: str | None,
    ) -> str | None:

        if logo_url is None:
            return None

        logo_url = str(logo_url).strip()

        if not logo_url:
            return None

        if not (
            logo_url.startswith("http://")
            or logo_url.startswith("https://")
        ):
            raise ValueError(
                "logo_url must be a valid HTTP or HTTPS URL."
            )

        return logo_url

    def _validate_text(
        self,
        value: str | None,
        field_name: str,
    ) -> str | None:

        if value is None:
            return None

        value = str(value).strip()

        if not value:
            raise ValueError(
                f"{field_name} cannot be empty."
            )

        return value

    # ---------------------------------------------------------
    # CREATE OR UPDATE
    # ---------------------------------------------------------

    def create_or_update_branding(
        self,
        chatbot_id: str,
        data: dict[str, Any],
    ) -> dict[str, Any]:

        self._validate_chatbot(chatbot_id)

        existing = self._get_existing(chatbot_id)

        payload: dict[str, Any] = {}

        for field in self.ALLOWED_FIELDS:

            if field not in data:
                continue

            value = data[field]

            if field in {
                "primary_color",
                "secondary_color",
            }:
                if value is not None:
                    value = self._validate_color(
                        str(value)
                    )

            elif field == "widget_position":
                if value is not None:
                    value = self._validate_position(
                        str(value)
                    )

            elif field == "logo_url":
                value = self._validate_logo_url(value)

            elif field == "bot_name":
                value = self._validate_text(
                    value,
                    "bot_name",
                )

            elif field == "welcome_message":
                value = self._validate_text(
                    value,
                    "welcome_message",
                )

            payload[field] = value

        # -----------------------------------------------------
        # UPDATE EXISTING BRANDING
        # -----------------------------------------------------

        if existing:

            if not payload:
                return existing

            response = (
                self.supabase
                .table(self.TABLE_NAME)
                .update(payload)
                .eq("chatbot_id", chatbot_id)
                .execute()
            )

            updated_data = response.data or []

            if not updated_data:
                raise RuntimeError(
                    "Failed to update chatbot branding."
                )

            return updated_data[0]

        # -----------------------------------------------------
        # CREATE NEW BRANDING
        # -----------------------------------------------------

        insert_payload: dict[str, Any] = {
            "chatbot_id": chatbot_id,
            **self.DEFAULT_BRANDING,
        }

        insert_payload.update(payload)

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .insert(insert_payload)
            .execute()
        )

        inserted_data = response.data or []

        if not inserted_data:
            raise RuntimeError(
                "Failed to create chatbot branding."
            )

        return inserted_data[0]

    # ---------------------------------------------------------
    # GET BRANDING BY CHATBOT
    # ---------------------------------------------------------

    def get_branding(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        self._validate_chatbot(chatbot_id)

        branding = self._get_existing(chatbot_id)

        if branding:
            return branding

        # Virtual defaults when no database record exists.
        return {
            "id": None,
            "chatbot_id": chatbot_id,
            **self.DEFAULT_BRANDING,
            "created_at": None,
            "updated_at": None,
        }

    # ---------------------------------------------------------
    # GET BRANDING BY ID
    # ---------------------------------------------------------

    def get_branding_by_id(
        self,
        branding_id: str,
    ) -> dict[str, Any]:

        if not branding_id:
            raise ValueError(
                "branding_id is required."
            )

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("id", branding_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                f"Branding '{branding_id}' not found."
            )

        return data[0]

    # ---------------------------------------------------------
    # DELETE BRANDING
    # ---------------------------------------------------------

    def delete_branding(
        self,
        chatbot_id: str,
    ) -> bool:

        self._validate_chatbot(chatbot_id)

        existing = self._get_existing(chatbot_id)

        if not existing:
            return False

        response = (
            self.supabase
            .table(self.TABLE_NAME)
            .delete()
            .eq("chatbot_id", chatbot_id)
            .execute()
        )

        return bool(response.data)

    # ---------------------------------------------------------
    # PUBLIC BRANDING
    # ---------------------------------------------------------

    def get_public_branding(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:

        branding = self.get_branding(chatbot_id)

        return {
            "chatbot_id": chatbot_id,

            "primary_color": (
                branding.get("primary_color")
                or self.DEFAULT_BRANDING["primary_color"]
            ),

            "secondary_color": (
                branding.get("secondary_color")
                or self.DEFAULT_BRANDING["secondary_color"]
            ),

            "logo_url": branding.get("logo_url"),

            "bot_name": (
                branding.get("bot_name")
                or self.DEFAULT_BRANDING["bot_name"]
            ),

            "welcome_message": (
                branding.get("welcome_message")
                or self.DEFAULT_BRANDING["welcome_message"]
            ),

            "widget_position": (
                branding.get("widget_position")
                or self.DEFAULT_BRANDING["widget_position"]
            ),
        }


def get_branding_service() -> BrandingService:
    return BrandingService()
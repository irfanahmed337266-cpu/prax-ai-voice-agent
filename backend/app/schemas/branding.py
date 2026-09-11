from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


ALLOWED_WIDGET_POSITIONS = {
    "bottom-right",
    "bottom-left",
    "top-right",
    "top-left",
}


class BrandingCreateRequest(BaseModel):
    chatbot_id: str = Field(min_length=1)

    primary_color: str | None = "#000000"
    secondary_color: str | None = "#FFFFFF"

    logo_url: str | None = None

    bot_name: str | None = Field(
        default="Assistant",
        max_length=100,
    )

    welcome_message: str | None = Field(
        default="Hello! How can I help you?",
        max_length=1000,
    )

    widget_position: str = Field(
        default="bottom-right",
    )

    @field_validator("primary_color", "secondary_color")
    @classmethod
    def validate_color(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if not value.startswith("#"):
            raise ValueError(
                "Color must be a hexadecimal value such as #000000."
            )

        if len(value) not in (4, 7):
            raise ValueError(
                "Color must use #RGB or #RRGGBB format."
            )

        hex_part = value[1:]

        if not all(
            character in "0123456789abcdefABCDEF"
            for character in hex_part
        ):
            raise ValueError(
                "Color must be a valid hexadecimal color."
            )

        return value

    @field_validator("logo_url")
    @classmethod
    def validate_logo_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if not (
            value.startswith("http://")
            or value.startswith("https://")
        ):
            raise ValueError(
                "logo_url must be a valid HTTP or HTTPS URL."
            )

        return value

    @field_validator("bot_name", "welcome_message")
    @classmethod
    def validate_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Value cannot be empty.")

        return value

    @field_validator("widget_position")
    @classmethod
    def validate_widget_position(cls, value: str) -> str:
        value = value.strip().lower()

        if value not in ALLOWED_WIDGET_POSITIONS:
            raise ValueError(
                "widget_position must be one of: "
                "bottom-right, bottom-left, top-right, top-left."
            )

        return value


class BrandingUpdateRequest(BaseModel):
    primary_color: str | None = None
    secondary_color: str | None = None
    logo_url: str | None = None
    bot_name: str | None = Field(
        default=None,
        max_length=100,
    )
    welcome_message: str | None = Field(
        default=None,
        max_length=1000,
    )
    widget_position: str | None = None

    @field_validator("primary_color", "secondary_color")
    @classmethod
    def validate_color(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if not value.startswith("#"):
            raise ValueError(
                "Color must be a hexadecimal value such as #000000."
            )

        if len(value) not in (4, 7):
            raise ValueError(
                "Color must use #RGB or #RRGGBB format."
            )

        hex_part = value[1:]

        if not all(
            character in "0123456789abcdefABCDEF"
            for character in hex_part
        ):
            raise ValueError(
                "Color must be a valid hexadecimal color."
            )

        return value

    @field_validator("logo_url")
    @classmethod
    def validate_logo_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            return None

        if not (
            value.startswith("http://")
            or value.startswith("https://")
        ):
            raise ValueError(
                "logo_url must be a valid HTTP or HTTPS URL."
            )

        return value

    @field_validator("bot_name", "welcome_message")
    @classmethod
    def validate_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Value cannot be empty.")

        return value

    @field_validator("widget_position")
    @classmethod
    def validate_widget_position(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().lower()

        if value not in ALLOWED_WIDGET_POSITIONS:
            raise ValueError(
                "widget_position must be one of: "
                "bottom-right, bottom-left, top-right, top-left."
            )

        return value


class BrandingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str | None = None
    chatbot_id: str

    primary_color: str | None = None
    secondary_color: str | None = None

    logo_url: str | None = None

    bot_name: str | None = None
    welcome_message: str | None = None

    widget_position: str

    created_at: datetime | None = None
    updated_at: datetime | None = None


class PublicBrandingResponse(BaseModel):
    chatbot_id: str

    primary_color: str
    secondary_color: str

    logo_url: str | None = None

    bot_name: str
    welcome_message: str

    widget_position: str
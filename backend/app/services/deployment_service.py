from __future__ import annotations

import hashlib
import secrets
from typing import Any
from urllib.parse import urlparse

from app.supabase.client import get_supabase_client


class DeploymentService:
    DEPLOYMENTS_TABLE = "deployments"
    CHATBOTS_TABLE = "chatbots"
    BRANDING_TABLE = "branding"

    KEY_PREFIX = "prax_pub_"

    def __init__(self) -> None:
        self.supabase = get_supabase_client()

    # ---------------------------------------------------------
    # Deployment key helpers
    # ---------------------------------------------------------

    @staticmethod
    def _hash_key(deployment_key: str) -> str:
        return hashlib.sha256(
            deployment_key.encode("utf-8")
        ).hexdigest()

    @staticmethod
    def _generate_deployment_key() -> str:
        random_part = secrets.token_urlsafe(32)
        return f"prax_pub_{random_part}"

    # ---------------------------------------------------------
    # Domain normalization
    # ---------------------------------------------------------

    @staticmethod
    def _normalize_domain(value: str) -> str:
        """
        Normalize either:
            example.com
            www.example.com
            http://example.com
            https://example.com
            http://example.com:5173
            example.com:5173

        into a hostname suitable for comparison.
        """

        if not value:
            return ""

        value = value.strip().lower()

        # urlparse needs a scheme to reliably parse hostnames.
        parsed_value = value

        if "://" not in parsed_value:
            parsed_value = f"https://{parsed_value}"

        parsed = urlparse(parsed_value)

        hostname = parsed.hostname or ""

        hostname = hostname.strip().lower().rstrip(".")

        # Treat www.example.com and example.com as the same domain.
        if hostname.startswith("www."):
            hostname = hostname[4:]

        return hostname

    @classmethod
    def _normalize_allowed_domains(
        cls,
        domains: list[str] | None,
    ) -> list[str]:
        normalized: list[str] = []

        for domain in domains or []:
            value = cls._normalize_domain(domain)

            if not value:
                continue

            if value not in normalized:
                normalized.append(value)

        return normalized

    # ---------------------------------------------------------
    # Origin validation
    # ---------------------------------------------------------

    @classmethod
    def validate_origin(
        cls,
        origin: str | None,
        allowed_domains: list[str] | None,
    ) -> bool:
        """
        Validate the browser Origin against the deployment's
        configured allowed domains.

        The port is intentionally ignored.

        Example:

            allowed_domains = ["localhost"]

            http://localhost:5173  -> True
            http://localhost:3000  -> True
            https://localhost      -> True
            http://evil.com        -> False
        """

        if not origin:
            return False

        origin = origin.strip()

        if not origin:
            return False

        parsed = urlparse(origin)

        # Browser Origin must contain a scheme and hostname.
        if parsed.scheme not in {"http", "https"}:
            return False

        hostname = cls._normalize_domain(origin)

        if not hostname:
            return False

        normalized_domains = cls._normalize_allowed_domains(
            allowed_domains
        )

        return hostname in normalized_domains

    # ---------------------------------------------------------
    # Chatbot validation
    # ---------------------------------------------------------

    def _validate_chatbot(
        self,
        chatbot_id: str,
    ) -> dict[str, Any]:
        response = (
            self.supabase
            .table(self.CHATBOTS_TABLE)
            .select(
                "id,"
                "name,"
                "business_name,"
                "use_case,"
                "website_url,"
                "is_active"
            )
            .eq("id", chatbot_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError("Chatbot not found.")

        chatbot = data[0]

        if not chatbot.get("is_active", False):
            raise ValueError("Chatbot is inactive.")

        return chatbot

    # ---------------------------------------------------------
    # Create deployment
    # ---------------------------------------------------------

    def create_deployment(
        self,
        chatbot_id: str,
        name: str,
        allowed_domains: list[str],
    ) -> dict[str, Any]:

        self._validate_chatbot(chatbot_id)

        normalized_domains = self._normalize_allowed_domains(
            allowed_domains
        )

        deployment_key = self._generate_deployment_key()
        deployment_key_hash = self._hash_key(deployment_key)

        key_prefix = deployment_key[:16]

        payload = {
            "chatbot_id": chatbot_id,
            "name": name.strip(),
            "deployment_key_hash": deployment_key_hash,
            "key_prefix": key_prefix,
            "allowed_domains": normalized_domains,
            "is_active": True,
        }

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .insert(payload)
            .execute()
        )

        data = response.data or []

        if not data:
            raise RuntimeError("Failed to create deployment.")

        deployment = data[0]

        # IMPORTANT:
        # The plaintext deployment key is returned only once.
        deployment["deployment_key"] = deployment_key

        return deployment

    # ---------------------------------------------------------
    # List deployments
    # ---------------------------------------------------------

    def list_deployments(
        self,
        chatbot_id: str,
    ) -> list[dict[str, Any]]:

        self._validate_chatbot(chatbot_id)

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "name,"
                "key_prefix,"
                "allowed_domains,"
                "is_active,"
                "created_at,"
                "updated_at"
            )
            .eq("chatbot_id", chatbot_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    # ---------------------------------------------------------
    # Get deployment
    # ---------------------------------------------------------

    def get_deployment(
        self,
        deployment_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "name,"
                "key_prefix,"
                "allowed_domains,"
                "is_active,"
                "created_at,"
                "updated_at"
            )
            .eq("id", deployment_id)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError("Deployment not found.")

        return data[0]

    def get_public_deployment_by_key(
        self,
        deployment_key: str,
    ) -> dict[str, Any]:
        if not deployment_key:
            raise ValueError(
                "Deployment key is required."
            )

        key_hash = self._hash_key(
            deployment_key
        )

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "name,"
                "key_prefix,"
                "allowed_domains,"
                "is_active"
            )
            .eq(
                "deployment_key_hash",
                key_hash,
            )
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                "Invalid or inactive deployment."
            )

        deployment = data[0]

        if not deployment.get(
            "is_active",
            False,
        ):
            raise ValueError(
                "Invalid or inactive deployment."
            )

        return deployment    

    # ---------------------------------------------------------
    # Update deployment
    # ---------------------------------------------------------

    def update_deployment(
        self,
        deployment_id: str,
        name: str | None = None,
        allowed_domains: list[str] | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any]:

        updates: dict[str, Any] = {}

        if name is not None:
            cleaned_name = name.strip()

            if not cleaned_name:
                raise ValueError(
                    "Deployment name cannot be empty."
                )

            updates["name"] = cleaned_name

        if allowed_domains is not None:
            updates["allowed_domains"] = (
                self._normalize_allowed_domains(
                    allowed_domains
                )
            )

        if is_active is not None:
            updates["is_active"] = is_active

        if not updates:
            return self.get_deployment(deployment_id)

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .update(updates)
            .eq("id", deployment_id)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError("Deployment not found.")

        return data[0]

    def rotate_deployment_key(
        self,
        deployment_id: str,
    ) -> dict[str, Any]:
        """
        Generate a completely new deployment key.

        Security properties:
        - The old key immediately becomes invalid.
        - Only the SHA-256 hash of the new key is stored.
        - The plaintext key is returned only in this response.
        """

        # Verify deployment exists.
        deployment = self.get_deployment(
            deployment_id
        )

        new_deployment_key = (
            self._generate_deployment_key()
        )

        new_key_hash = self._hash_key(
            new_deployment_key
        )

        new_key_prefix = new_deployment_key[:16]

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .update(
                {
                    "deployment_key_hash": new_key_hash,
                    "key_prefix": new_key_prefix,
                }
            )
            .eq("id", deployment_id)
            .execute()
        )

        data = response.data or []

        if not data:
            raise RuntimeError(
                "Failed to rotate deployment key."
            )

        updated_deployment = data[0]

        # Return the plaintext key only now.
        updated_deployment[
            "deployment_key"
        ] = new_deployment_key

        return updated_deployment
    

    # ---------------------------------------------------------
    # Delete deployment
    # ---------------------------------------------------------

    def delete_deployment(
        self,
        deployment_id: str,
    ) -> dict[str, Any]:

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .delete()
            .eq("id", deployment_id)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError("Deployment not found.")

        return data[0]

    # ---------------------------------------------------------
    # Resolve public deployment
    # ---------------------------------------------------------

    def resolve_public_deployment(
        self,
        deployment_key: str,
        origin: str | None = None,
    ) -> dict[str, Any]:

        if not deployment_key:
            raise ValueError(
                "Deployment key is required."
            )

        # Never query the database with plaintext key.
        key_hash = self._hash_key(deployment_key)

        response = (
            self.supabase
            .table(self.DEPLOYMENTS_TABLE)
            .select(
                "id,"
                "chatbot_id,"
                "name,"
                "allowed_domains,"
                "is_active"
            )
            .eq("deployment_key_hash", key_hash)
            .limit(1)
            .execute()
        )

        data = response.data or []

        if not data:
            raise ValueError(
                "Invalid or inactive deployment."
            )

        deployment = data[0]

        if not deployment.get("is_active", False):
            raise ValueError(
                "Invalid or inactive deployment."
            )

        allowed_domains = deployment.get(
            "allowed_domains"
        ) or []

        # Public deployments MUST have an Origin.
        if not origin:
            raise PermissionError(
                "Origin header is required."
            )

        # Strict origin validation.
        if not self.validate_origin(
            origin=origin,
            allowed_domains=allowed_domains,
        ):
            raise PermissionError(
                "Origin is not allowed for this deployment."
            )

        chatbot = self._validate_chatbot(
            deployment["chatbot_id"]
        )

        # -----------------------------------------------------
        # Branding
        # -----------------------------------------------------

        branding_response = (
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
            .eq(
                "chatbot_id",
                deployment["chatbot_id"],
            )
            .limit(1)
            .execute()
        )

        branding_data = (
            branding_response.data or []
        )

        branding = (
            branding_data[0]
            if branding_data
            else {}
        )

        # -----------------------------------------------------
        # PUBLIC-SAFE RESPONSE ONLY
        # -----------------------------------------------------

        return {
            "deployment_id": deployment["id"],
            "chatbot_id": deployment["chatbot_id"],
            "chatbot_name": chatbot["name"],
            "business_name": chatbot.get(
                "business_name"
            ),
            "use_case": chatbot.get(
                "use_case"
            ),
            "is_active": deployment["is_active"],
            "branding": branding,
            "welcome_message": branding.get(
                "welcome_message"
            ),
            "allowed_domains": allowed_domains,
        }


def get_deployment_service() -> DeploymentService:
    return DeploymentService()
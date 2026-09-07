from cryptography.fernet import Fernet, InvalidToken

from app.config.settings import get_settings


class EncryptionService:
    """
    Handles encryption/decryption of sensitive credentials.

    The master encryption key must stay in the server environment.
    """

    def __init__(self) -> None:
        settings = get_settings()

        if not settings.encryption_key:
            raise RuntimeError(
                "ENCRYPTION_KEY is not configured."
            )

        try:
            self._fernet = Fernet(
                settings.encryption_key.encode("utf-8")
            )
        except Exception as exc:
            raise RuntimeError(
                "ENCRYPTION_KEY is invalid. "
                "Generate a valid Fernet key."
            ) from exc

    def encrypt(self, value: str) -> str:
        if not value:
            raise ValueError("Cannot encrypt an empty value.")

        encrypted = self._fernet.encrypt(
            value.encode("utf-8")
        )

        return encrypted.decode("utf-8")

    def decrypt(self, encrypted_value: str) -> str:
        if not encrypted_value:
            raise ValueError(
                "Cannot decrypt an empty encrypted value."
            )

        try:
            decrypted = self._fernet.decrypt(
                encrypted_value.encode("utf-8")
            )

            return decrypted.decode("utf-8")

        except InvalidToken as exc:
            raise ValueError(
                "Unable to decrypt value. "
                "The encryption key may be incorrect."
            ) from exc


def get_encryption_service() -> EncryptionService:
    return EncryptionService()
from app.security.encryption import EncryptionService


class CredentialManager:

    def __init__(
        self,
        encryption: EncryptionService,
    ):
        self.encryption = encryption

    def protect(
        self,
        api_key: str,
    ) -> str:

        return self.encryption.encrypt(
            api_key
        )

    def reveal(
        self,
        encrypted_api_key: str,
    ) -> str:

        return self.encryption.decrypt(
            encrypted_api_key
        )


def get_credential_manager() -> CredentialManager:
    return CredentialManager(
        encryption=EncryptionService()
    )
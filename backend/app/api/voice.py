from urllib.parse import quote

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.services.ai_provider_service import AIProviderService
from app.services.chatbot_service import get_chatbot_runtime_service
from app.services.voice_service import get_voice_service


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


@router.post("/chat")
async def voice_chat(
    chatbot_id: str = Form(...),
    conversation_id: str = Form(...),
    audio: UploadFile = File(...),
):
    """
    Complete PRAX Gemini voice pipeline:

    Audio
      -> Gemini Speech-to-Text
      -> Existing PRAX Gemini Chatbot Runtime
      -> Gemini Text-to-Speech
      -> WAV response
    """

    try:
        if not chatbot_id.strip():
            raise ValueError(
                "chatbot_id is required."
            )

        if not conversation_id.strip():
            raise ValueError(
                "conversation_id is required."
            )

        audio_bytes = await audio.read()

        if not audio_bytes:
            raise ValueError(
                "Uploaded audio is empty."
            )

        provider_service = AIProviderService()

        providers = (
            provider_service
            .get_active_providers_for_chatbot(
                chatbot_id=chatbot_id
            )
        )

        gemini_provider = next(
            (
                provider
                for provider in providers
                if provider.get("provider", "").lower()
                == "gemini"
            ),
            None,
        )

        if not gemini_provider:
            raise ValueError(
                "No active Gemini provider is configured "
                "for this chatbot. Configure a Gemini "
                "provider first."
            )

        gemini_api_key = (
            provider_service
            .get_decrypted_api_key(
                gemini_provider["id"]
            )
        )

        if not gemini_api_key:
            raise ValueError(
                "Gemini API key could not be retrieved."
            )

        voice_service = get_voice_service(
            gemini_api_key=gemini_api_key
        )

        user_message = await voice_service.transcribe(
            audio_bytes=audio_bytes,
            filename=audio.filename or "audio.webm",
        )

        if not user_message:
            raise ValueError(
                "Could not understand the audio."
            )

        chatbot_service = (
            get_chatbot_runtime_service()
        )

        chat_result = await chatbot_service.chat(
            chatbot_id=chatbot_id,
            conversation_id=conversation_id,
            user_message=user_message,
        )

        response_text = chat_result.get(
            "response",
            "",
        )

        if not response_text:
            raise RuntimeError(
                "PRAX chatbot returned an empty response."
            )

        audio_response = await voice_service.synthesize(
            text=response_text
        )

        # HTTP headers only support latin-1/ASCII-safe values.
        # URL-encode Urdu/Unicode text before placing it in headers.
        encoded_transcript = quote(
            user_message,
            safe="",
        )

        encoded_response = quote(
            response_text,
            safe="",
        )

        return Response(
            content=audio_response,
            media_type="audio/wav",
            headers={
                "X-Transcript": encoded_transcript,
                "X-Chatbot-Response": encoded_response,
            },
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
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
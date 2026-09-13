from io import BytesIO
import wave

from google import genai
from google.genai import types


class VoiceService:
    """
    PRAX Gemini Voice Service

    Pipeline:

        Audio
          -> Gemini Speech-to-Text
          -> Existing PRAX Gemini Chatbot Runtime
          -> Gemini Text-to-Speech
          -> WAV Audio
    """

    # Gemini model used to understand/transcribe audio.
    STT_MODEL = "gemini-2.5-flash"

    # Gemini TTS model.
    TTS_MODEL = "gemini-2.5-flash-preview-tts"

    # Gemini prebuilt voice.
    TTS_VOICE = "Kore"

    # TTS output format from Gemini is PCM:
    # 24 kHz / mono / 16-bit.
    AUDIO_SAMPLE_RATE = 24000
    AUDIO_CHANNELS = 1
    AUDIO_SAMPLE_WIDTH = 2

    def __init__(
        self,
        gemini_api_key: str,
    ) -> None:

        if not gemini_api_key:
            raise ValueError(
                "Gemini API key is required for voice services."
            )

        self.client = genai.Client(
            api_key=gemini_api_key
        )

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "audio.webm",
    ) -> str:
        """
        Convert speech audio into text using Gemini.
        """

        if not audio_bytes:
            raise ValueError(
                "Audio data is empty."
            )

        mime_type = self._get_mime_type(
            filename=filename
        )

        response = await self.client.aio.models.generate_content(
            model=self.STT_MODEL,
            contents=[
                "Transcribe the speech in this audio exactly. "
                "Return only the spoken words as plain text. "
                "Do not summarize, explain, or add commentary.",
                types.Part.from_bytes(
                    data=audio_bytes,
                    mime_type=mime_type,
                ),
            ],
        )

        text = getattr(
            response,
            "text",
            "",
        )

        if not text:
            raise RuntimeError(
                "Gemini speech-to-text returned an empty response."
            )

        return text.strip()

    async def synthesize(
        self,
        text: str,
    ) -> bytes:
        """
        Convert chatbot response text into WAV audio
        using Gemini TTS.
        """

        if not text or not text.strip():
            raise ValueError(
                "Text-to-speech input cannot be empty."
            )

        response = await self.client.aio.models.generate_content(
            model=self.TTS_MODEL,
            contents=text.strip(),
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=(
                            types.PrebuiltVoiceConfig(
                                voice_name=self.TTS_VOICE
                            )
                        )
                    ),
                ),
            ),
        )

        pcm_data = self._extract_audio_bytes(
            response
        )

        if not pcm_data:
            raise RuntimeError(
                "Gemini text-to-speech returned empty audio."
            )

        return self._pcm_to_wav(
            pcm_data
        )

    @staticmethod
    def _extract_audio_bytes(
        response,
    ) -> bytes:
        """
        Extract raw PCM audio from Gemini response.
        """

        try:
            parts = (
                response.candidates[0]
                .content
                .parts
            )
        except (
            AttributeError,
            IndexError,
            TypeError,
        ) as exc:
            raise RuntimeError(
                "Invalid Gemini TTS response."
            ) from exc

        for part in parts:
            inline_data = getattr(
                part,
                "inline_data",
                None,
            )

            if inline_data is None:
                continue

            data = getattr(
                inline_data,
                "data",
                None,
            )

            if data:
                return data

        return b""

    @classmethod
    def _pcm_to_wav(
        cls,
        pcm_data: bytes,
    ) -> bytes:
        """
        Convert Gemini PCM audio into a browser-playable WAV file.
        """

        output = BytesIO()

        with wave.open(
            output,
            "wb",
        ) as wav_file:

            wav_file.setnchannels(
                cls.AUDIO_CHANNELS
            )

            wav_file.setsampwidth(
                cls.AUDIO_SAMPLE_WIDTH
            )

            wav_file.setframerate(
                cls.AUDIO_SAMPLE_RATE
            )

            wav_file.writeframes(
                pcm_data
            )

        return output.getvalue()

    @staticmethod
    def _get_mime_type(
        filename: str,
    ) -> str:
        """
        Determine MIME type from browser recording filename.
        """

        name = (
            filename or "audio.webm"
        ).lower()

        if name.endswith(".webm"):
            return "audio/webm"

        if name.endswith(".wav"):
            return "audio/wav"

        if name.endswith(".mp3"):
            return "audio/mpeg"

        if name.endswith(".mp4"):
            return "audio/mp4"

        if name.endswith(".m4a"):
            return "audio/mp4"

        if name.endswith(".ogg"):
            return "audio/ogg"

        if name.endswith(".oga"):
            return "audio/ogg"

        return "audio/webm"


def get_voice_service(
    gemini_api_key: str,
) -> VoiceService:

    return VoiceService(
        gemini_api_key=gemini_api_key
    )
from dataclasses import dataclass


@dataclass
class TextChunk:
    index: int
    content: str


class TextChunkingService:
    def __init__(
        self,
        chunk_size: int = 1200,
        chunk_overlap: int = 200,
    ) -> None:

        if chunk_size <= 0:
            raise ValueError(
                "chunk_size must be greater than zero."
            )

        if chunk_overlap < 0:
            raise ValueError(
                "chunk_overlap cannot be negative."
            )

        if chunk_overlap >= chunk_size:
            raise ValueError(
                "chunk_overlap must be smaller "
                "than chunk_size."
            )

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def _normalize_text(
        self,
        text: str,
    ) -> str:

        lines = [
            line.strip()
            for line in text.splitlines()
        ]

        normalized_lines = [
            line
            for line in lines
            if line
        ]

        return "\n".join(
            normalized_lines
        ).strip()

    def chunk_text(
        self,
        text: str,
    ) -> list[TextChunk]:

        text = self._normalize_text(text)

        if not text:
            return []

        chunks: list[TextChunk] = []

        start = 0
        text_length = len(text)

        while start < text_length:

            end = min(
                start + self.chunk_size,
                text_length,
            )

            if end < text_length:

                boundary_candidates = [
                    text.rfind("\n", start, end),
                    text.rfind(". ", start, end),
                    text.rfind("? ", start, end),
                    text.rfind("! ", start, end),
                    text.rfind(" ", start, end),
                ]

                boundary = max(
                    boundary_candidates
                )

                minimum_boundary = (
                    start
                    + int(
                        self.chunk_size * 0.5
                    )
                )

                if boundary >= minimum_boundary:
                    end = boundary + 1

            chunk_text = text[
                start:end
            ].strip()

            if chunk_text:
                chunks.append(
                    TextChunk(
                        index=len(chunks),
                        content=chunk_text,
                    )
                )

            if end >= text_length:
                break

            next_start = (
                end - self.chunk_overlap
            )

            if next_start <= start:
                next_start = end

            start = next_start

        return chunks


def get_chunking_service() -> TextChunkingService:
    return TextChunkingService()
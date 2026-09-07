from fastapi import APIRouter, HTTPException

from app.schemas.document import (
    DocumentChunkResponse,
    DocumentCreateRequest,
    DocumentIngestionResponse,
    DocumentResponse,
)
from app.services.document_service import (
    get_document_service,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/ingest",
    response_model=DocumentIngestionResponse,
)
async def ingest_document(
    payload: DocumentCreateRequest,
):
    try:
        service = (
            get_document_service()
        )

        return await service.ingest_text(
            knowledge_base_id=
                payload.knowledge_base_id,
            name=payload.name,
            content=payload.content,
            source_type=payload.source_type,
            source_url=payload.source_url,
            mime_type=payload.mime_type,
            metadata=payload.metadata,
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


@router.get(
    "/knowledge-base/{knowledge_base_id}",
    response_model=list[DocumentResponse],
)
def list_documents(
    knowledge_base_id: str,
):
    try:
        service = (
            get_document_service()
        )

        return service.list_for_knowledge_base(
            knowledge_base_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: str,
):
    try:
        service = (
            get_document_service()
        )

        return service.get(document_id)

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.get(
    "/{document_id}/chunks",
    response_model=list[
        DocumentChunkResponse
    ],
)
def get_document_chunks(
    document_id: str,
):
    try:
        service = (
            get_document_service()
        )

        return service.get_chunks(
            document_id
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{document_id}",
)
def delete_document(
    document_id: str,
):
    try:
        service = (
            get_document_service()
        )

        service.delete(document_id)

        return {
            "success": True,
            "message":
                "Document deleted successfully.",
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
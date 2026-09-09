from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.handoff import router as handoff_router
from app.api.branding import router as branding_router
from app.api.admin_config import router as admin_config_router
from app.api.deployments import router as deployments_router
from app.api.ai_providers import router as ai_provider_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversation_router
from app.api.documents import router as document_router
from app.api.knowledge import router as knowledge_router
from app.api.chatbots import router as chatbot_router


from app.config.settings import get_settings


settings = get_settings()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Reusable configurable AI chatbot platform for PRAX.",
)


# ============================================================================
# CORS
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HEALTH
# ============================================================================


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/api/health")
def api_health_check():
    return {
        "status": "ok",
        "service": "PRAX API",
    }


# ============================================================================
# API ROUTES
# ============================================================================

app.include_router(
    chatbot_router,
    prefix=settings.api_prefix,
)

app.include_router(
    ai_provider_router,
    prefix=settings.api_prefix,
)

app.include_router(
    chat_router,
    prefix=settings.api_prefix,
)

app.include_router(
    conversation_router,
    prefix=settings.api_prefix,
)

app.include_router(
    handoff_router,
    prefix=settings.api_prefix,
)

app.include_router(
    knowledge_router,
    prefix=settings.api_prefix,
)

app.include_router(
    document_router,
    prefix=settings.api_prefix,
)

app.include_router(
    branding_router,
    prefix=settings.api_prefix,
)

app.include_router(
    admin_config_router,
    prefix=settings.api_prefix,
)

app.include_router(
    deployments_router,
    prefix=settings.api_prefix,
)
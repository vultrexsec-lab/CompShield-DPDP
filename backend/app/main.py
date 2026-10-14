from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.auth import router as auth_router
from app.api.dsar import router as dsar_router
from app.api.consent import router as consent_router
from app.api.discovery import router as discovery_router
from app.api.ropa import router as ropa_router
from app.api.remediation import router as remediation_router
from app.api.dashboard import router as dashboard_router
from app.api.pii import router as pii_router
from app.api.modules import router as modules_router
from app.services.seed import seed_demo_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="CompShield DPDP — AI-Powered Privacy Compliance Platform API",
    version="0.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + (["*"] if settings.DEBUG else []),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(dsar_router, prefix="/api/v1")
app.include_router(consent_router, prefix="/api/v1")
app.include_router(discovery_router, prefix="/api/v1")
app.include_router(ropa_router, prefix="/api/v1")
app.include_router(remediation_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(pii_router, prefix="/api/v1")
app.include_router(modules_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.5.0",
        "status": "ok",
        "docs": "/docs",
        "modules": ["auth","dsar","consent","discovery","ropa","remediation","dashboard","pii","vendors","breaches","dpia","gaps","cookies","integrations","notifications","settings","reports"],
    }


@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.5.0"}

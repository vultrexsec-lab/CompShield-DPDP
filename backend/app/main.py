from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.auth import router as auth_router
from app.services.seed import seed_demo_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables + seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()
    yield
    # Shutdown
    pass


app = FastAPI(
    title=settings.APP_NAME,
    description="CompShield DPDP — AI-Powered Privacy Compliance Platform API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"] if settings.DEBUG else settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}

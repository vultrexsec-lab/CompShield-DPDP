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
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            for table, cols in {
                'data_sources': [
                    ('host','VARCHAR(255)'),('db_engine','VARCHAR(50)'),('schema_name','VARCHAR(255)'),
                    ('selected_tables','TEXT'),('selected_columns','TEXT'),('onboarding_stage','INTEGER DEFAULT 1'),
                ],
                'vendors': [
                    ('vendor_type','VARCHAR(100)'),('website_url','VARCHAR(500)'),('primary_domain','VARCHAR(255)'),
                    ('hq_country','VARCHAR(100)'),('onboarding_stage','INTEGER DEFAULT 1'),('onboarding_type','VARCHAR(50)'),
                    ('data_categories','TEXT'),('processing_purpose','TEXT'),('purposes','TEXT'),
                    ('sub_processors','TEXT'),('dpa_expiry','VARCHAR(50)'),('certifications','VARCHAR(500)'),
                    ('cross_border','BOOLEAN DEFAULT FALSE'),
                ],
            }.items():
                for col, typ in cols:
                    try: conn.execute(text(f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {typ}'))
                    except Exception:
                        try: conn.execute(text(f'ALTER TABLE {table} ADD COLUMN {col} {typ}'))
                        except Exception: pass
    except Exception as e:
        print('migrate', e)
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            for col, typ in [
                ('vendor_type','VARCHAR(100)'),('website_url','VARCHAR(500)'),
                ('primary_domain','VARCHAR(255)'),('hq_country','VARCHAR(100)'),
                ('onboarding_stage','INTEGER DEFAULT 1'),('onboarding_type','VARCHAR(50)'),
                ('data_categories','TEXT'),('processing_purpose','TEXT'),('purposes','TEXT'),
                ('sub_processors','TEXT'),('dpa_expiry','VARCHAR(50)'),
                ('certifications','VARCHAR(500)'),('cross_border','BOOLEAN DEFAULT FALSE'),
            ]:
                try:
                    conn.execute(text(f'ALTER TABLE vendors ADD COLUMN IF NOT EXISTS {col} {typ}'))
                except Exception:
                    try: conn.execute(text(f'ALTER TABLE vendors ADD COLUMN {col} {typ}'))
                    except Exception: pass
    except Exception as e:
        print('vendor migrate', e)
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

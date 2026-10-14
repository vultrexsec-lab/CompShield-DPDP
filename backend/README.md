# CompShield DPDP — Backend API

FastAPI backend for CompShield privacy compliance platform.

## Step 1 Complete ✅

- Project structure
- JWT Authentication (login / register / me / logout)
- User + Organization models
- SQLite (local) / PostgreSQL (Render) ready
- Demo user seed
- CORS configured for Vercel frontend

## Quick Start (Local)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Demo Credentials

```
Email: admin@compshield.com
Password: demo123
```

## Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login → JWT |
| POST | `/api/v1/auth/register` | Register org + user |
| GET | `/api/v1/auth/me` | Current user (Bearer token) |
| POST | `/api/v1/auth/logout` | Client-side logout |

### Login example

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@compshield.com","password":"demo123"}'
```

## Render Deploy

1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env: `DATABASE_URL` (Render PostgreSQL), `SECRET_KEY`, `CORS_ORIGINS`

## Next Steps

- Step 2: Core entity APIs (DSAR, Consent, ROPA…)
- Step 3: India PII Detection Engine

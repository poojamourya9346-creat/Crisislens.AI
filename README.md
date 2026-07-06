# CrisisLens AI

> Autonomous multi-agent decision intelligence platform for smarter, faster crisis response.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## Project Overview

CrisisLens AI is a production-ready prototype that helps teams capture incidents, analyze them with AI assistance, track response progress, review historical data, and export analytics. The platform combines a FastAPI backend, a React frontend, and containerized infrastructure so it can be run locally or deployed through Docker.

### Included capabilities

- Incident intake and structured analysis workflows
- AI orchestration endpoints for classification, risk scoring, and response planning
- Incident dashboard and history views
- Analytics and export-ready reporting
- Toast-based notifications and a resilient UI shell
- Request validation, rate limiting, and consistent error handling

---

## Features

- AI-assisted incident analysis and report generation
- Multi-agent orchestration flow for crisis assessment tasks
- Responsive incident dashboard with history and filtering
- Analytics page with summary cards and export actions
- Production-ready frontend error boundary and API client resilience
- Backend middleware for request context, auth, and throttling
- Docker and Docker Compose support for backend, frontend, and PostgreSQL

---

## Architecture

The application follows a modular structure with backend and frontend layers that can evolve independently.

```text
frontend/   React + TypeScript + Vite + Tailwind
backend/    FastAPI + Pydantic + SQLAlchemy + Alembic
infra/       Cloud Run deployment assets
```

### Backend structure

- api/: HTTP routes and versioned endpoints
- application/: services, validators, and orchestration use cases
- core/: configuration, middleware, logging, and exception handling
- domain/: entities, repositories, and domain services
- infrastructure/: database adapters and repository implementations
- models/: SQLAlchemy ORM models
- schemas/: API request and response models

### Frontend structure

- app/: app bootstrap and providers
- features/: incident intake, dashboard, and analytics experiences
- components/: shared UI primitives
- lib/: API client and utilities
- routes/: router and layout definitions

---

## Installation

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker and Docker Compose
- PostgreSQL 16 (optional when using Docker Compose)

### Clone and configure

```bash
git clone <repository-url>
cd crisislens
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Running the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
pip install -r requirements/dev.txt
uvicorn crisislens.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- http://localhost:8000/api/v1
- http://localhost:8000/api/v1/docs

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

- http://localhost:5173

---

## Environment Variables

The repository includes example files for the root, backend, and frontend environments.

### Root variables

- APP_ENV
- APP_DEBUG
- BACKEND_PORT
- FRONTEND_PORT
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- DATABASE_URL
- JWT_SECRET_KEY
- GEMINI_API_KEY
- LOG_LEVEL
- CORS_ORIGINS

### Frontend variables

- VITE_API_BASE_URL
- VITE_APP_NAME

---

## Docker Usage

### Local stack

```bash
docker compose up --build
```

### Development override

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Services

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api/v1
- PostgreSQL: localhost:5432

---

## API Endpoints

### AI endpoints

- POST /api/v1/ai/analyze
- POST /api/v1/ai/report
- POST /api/v1/ai/orchestrate

### Auth endpoints

- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh

---

## Testing

### Backend

```bash
cd backend
pytest -q
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

---

## Screenshots

Placeholder screenshots will be added in a future release cycle.

- Screenshot 1: Incident intake workflow
- Screenshot 2: Incident dashboard
- Screenshot 3: Analytics view

---

## Production Checklist

- [x] Backend tests are passing
- [x] Frontend production build is passing
- [x] API validation and error responses are standardized
- [x] Request throttling and safe configuration handling are enabled
- [x] Docker and Compose files are present for local deployment
- [ ] External secrets and production database credentials should be provided by the deployment environment
- [ ] Optional cloud deployment manifests should be customized per target environment

---

## Security, Performance, and Logging Notes

- Sensitive configuration values are handled through environment settings.
- Request context and structured logging are enabled for observability.
- Rate limiting helps reduce abusive traffic.
- Frontend error boundaries improve resilience for unexpected runtime failures.

---

## License

Proprietary — CrisisLens AI Team. All rights reserved.

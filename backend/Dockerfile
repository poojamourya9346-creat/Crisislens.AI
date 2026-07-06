# =============================================================================
# CrisisLens AI — Backend Production Dockerfile
# Multi-stage build optimized for Google Cloud Run
# =============================================================================

# --- Stage 1: Builder ---
FROM python:3.12-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ requirements/
RUN pip install --prefix=/install -r requirements/prod.txt \
    && pip install --prefix=/install -r requirements/base.txt

# --- Stage 2: Runtime ---
FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    APP_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system crisislens \
    && adduser --system --ingroup crisislens crisislens

COPY --from=builder /install /usr/local
COPY src/ src/

USER crisislens

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import socket; s=socket.create_connection(('127.0.0.1',8080),timeout=3); s.close()" || exit 1

CMD ["uvicorn", "crisislens.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]

# --- Stage 3: Development (hot reload) ---
FROM python:3.12-slim AS dev

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    APP_ENV=development \
    APP_DEBUG=true

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/dev.txt

COPY src/ src/

EXPOSE 8080

CMD ["uvicorn", "crisislens.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload", "--reload-dir", "/app/src"]

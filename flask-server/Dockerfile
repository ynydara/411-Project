# syntax=docker/dockerfile:1

# Use a slim Python base image for both builder and final stages
FROM python:3.11-slim AS base
WORKDIR /app

# Builder stage: install dependencies in a virtual environment
FROM base AS builder

# Copy only requirements.txt first for better caching
COPY --link requirements.txt ./

# Create virtual environment and install dependencies using pip cache
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt

# Copy application code (excluding venv, node_modules, .git, etc.)
COPY --link Ai/ ./Ai/
COPY --link server.py ./

# Final stage: create a non-root user and set up environment
FROM base AS final

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv
# Copy application code from builder
COPY --from=builder /app/Ai /app/Ai
COPY --from=builder /app/server.py /app/server.py

# Set PATH to use the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Expose Flask default port
EXPOSE 5000

# Switch to non-root user
USER appuser

# Start the Flask server
CMD ["python", "server.py"]

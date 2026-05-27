#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY must be set}"
: "${GHCR_TOKEN:?GHCR_TOKEN must be set}"
: "${GHCR_USER:?GHCR_USER must be set}"

REPO_LOWER="$(echo "$GITHUB_REPOSITORY" | tr '[:upper:]' '[:lower:]')"
IMAGE_TAG="${IMAGE_TAG:-latest}"

export DOCKER_IMAGE_API="ghcr.io/${REPO_LOWER}/api:${IMAGE_TAG}"
export DOCKER_IMAGE_WEB="ghcr.io/${REPO_LOWER}/web:${IMAGE_TAG}"

echo "Logging into GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

echo "Pulling images..."
docker compose -f docker-compose.prod.yml pull

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

if command -v pnpm >/dev/null 2>&1 && [ -f package.json ]; then
  echo "Running database migrations..."
  pnpm db:migrate
fi

echo "Pruning unused images..."
docker image prune -f

echo "Deployment complete."

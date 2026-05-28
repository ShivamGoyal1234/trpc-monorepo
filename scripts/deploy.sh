#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Building and starting production services..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

if command -v pnpm >/dev/null 2>&1 && [ -f package.json ]; then
  echo "Running database migrations..."
  pnpm db:migrate
fi

echo "Pruning dangling images..."
docker image prune -f

echo "Deployment complete."

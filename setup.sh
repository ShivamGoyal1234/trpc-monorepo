#!/bin/bash
set -e

if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

echo "Starting PostgreSQL and Redis..."
docker-compose up -d postgresdb redis

echo "Waiting for database..."
sleep 3

echo "Running migrations..."
pnpm db:migrate

echo "Seeding database..."
pnpm db:seed

echo "✅ FormCraft setup complete!"
echo "   Run: pnpm dev"
echo "   App:  http://localhost:3000"
echo "   API:  http://localhost:3001"
echo "   Docs: http://localhost:3002"
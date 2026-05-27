# FormCraft — AI-Powered Form Builder SaaS

> Build beautiful, intelligent forms in seconds. Powered by tRPC, Drizzle ORM, Zod, and OpenAI.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Creator | demo@formcraft.io | Demo@1234 |
| Admin | admin@formcraft.io | Admin@1234 |

## Features

### Core
- User authentication (credentials + Google OAuth ready)
- Create, edit, publish, unpublish, archive forms
- 17 field types with validation
- Conditional logic between fields
- Public and unlisted visibility modes
- Public form submission (no login required)
- Response collection and management
- Response analytics and charts

### AI-Powered
- Generate complete forms from natural language prompts
- AI field improvement suggestions
- Smart field suggestions
- Redis caching for AI responses

### Themes & Design
- 6 handcrafted system themes
- Custom theme creation
- Live theme preview
- Beautiful public form experience

### Technical
- Turborepo monorepo
- tRPC type-safe APIs
- Drizzle ORM + PostgreSQL
- Redis rate limiting, sessions, view counters
- Docker + Docker Compose
- Scalar API documentation
- GitHub Actions CI/CD

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js, Tailwind CSS, shadcn/ui |
| Backend | Express.js, tRPC |
| Database | PostgreSQL (Drizzle ORM) |
| Cache | Redis (ioredis) |
| Auth | NextAuth.js + session tokens |
| AI | OpenAI GPT-4o |
| Email | Nodemailer (Google SMTP) |
| Validation | Zod |

## Project Structure

```
├── apps/
│   ├── web/         # Next.js frontend
│   ├── api/         # Express + tRPC backend
│   └── docs/        # Scalar API docs
├── packages/
│   ├── db/          # Drizzle schema + migrations + seed
│   ├── schemas/     # Zod schemas (shared)
│   ├── trpc/        # tRPC procedures (shared)
│   ├── email/       # React Email templates
│   └── typescript-config/
```

## Quick Start

### Option 1 — Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d postgresdb redis
make migrate
make seed
pnpm dev
```

- App: http://localhost:3000
- API: http://localhost:3001
- Docs: http://localhost:3002

### Option 2 — Manual

**Prerequisites:** Node 20+, pnpm 9, PostgreSQL 15, Redis 7

```bash
pnpm install
cp .env.example .env
docker-compose up -d postgresdb redis
make migrate
make seed
pnpm dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | ✅ | PostgreSQL connection string |
| REDIS_URL | ✅ | Redis connection string |
| NEXTAUTH_SECRET | ✅ | Min 32 chars random string |
| NEXTAUTH_URL | ✅ | Frontend URL |
| OPENAI_API_KEY | ⚪ | For AI form generation |
| SMTP_HOST | ⚪ | SMTP host (e.g. smtp.gmail.com) |
| SMTP_PORT | ⚪ | SMTP port (465 for SSL, 587 for STARTTLS) |
| SMTP_SECURE | ⚪ | true/false for secure SMTP |
| SMTP_USER | ⚪ | SMTP username (Gmail address) |
| SMTP_PASS | ⚪ | SMTP password (use Gmail App Password) |
| GOOGLE_CLIENT_ID | ⚪ | For Google OAuth |
| GOOGLE_CLIENT_SECRET | ⚪ | For Google OAuth |

## Demo Forms

8 themed forms are pre-seeded:

| Form | Theme | Visibility | Responses |
|------|-------|-----------|-----------|
| The Matrix Simulation Survey | Midnight Hacker | Public | 45 |
| Anime Character Alignment Quiz | Sakura Bloom | Public | 38 |
| Startup Pitch Validator | Corporate Clean | Unlisted | 29 |
| Linux Distro Personality Test | Midnight Hacker | Public | 52 |
| Game Jam Application | Retro Arcade | Unlisted | 20 |
| Tech Company Culture Fit | Corporate Clean | Public | 61 |
| Hogwarts House Sorting | Sakura Bloom | Public | 88 |
| FormCraft Product Feedback | Forest Deep | Public | 34 |

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start Postgres + Redis, run dev servers |
| `make migrate` | Run database migrations |
| `make seed` | Seed demo data |
| `make build` | Build all packages |
| `make clean` | Stop containers and clean artifacts |

## API Documentation

Run `pnpm --filter docs dev` and open http://localhost:3002 for Scalar API docs.

Public endpoints are rate-limited via Redis. Authenticated routes use `Authorization: Bearer <token>`.

# FormCraft API — production image
# Builds one self-contained dist/index.js (all deps bundled via tsup).
# Runtime image: Node + dist only (no pnpm / node_modules).

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# --- Dependencies for build ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/trpc/package.json ./packages/trpc/
COPY packages/email/package.json ./packages/email/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN pnpm install --frozen-lockfile

# --- Build bundled server ---
FROM base AS builder
COPY --from=deps /app/ ./
COPY . .
RUN pnpm --filter api build

# --- Production runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache wget \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 -G nodejs apiuser

COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist

USER apiuser
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["node", "dist/index.js"]

# Build context: monorepo root (.)
# -----------------------------
# Dependencies stage
# -----------------------------
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/admin/package.json ./apps/admin/

RUN pnpm install --frozen-lockfile

# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY . .

RUN pnpm --filter @infrapro/admin build

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/admin/server.js"]
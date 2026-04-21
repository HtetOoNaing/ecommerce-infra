# Build context: monorepo root (.)
# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @infrapro/backend build

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/migrations ./apps/backend/migrations
COPY --from=builder /app/apps/backend/src/config/config.json ./apps/backend/src/config/config.json
COPY --from=builder /app/apps/backend/.sequelizerc ./apps/backend/.sequelizerc

RUN chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["node", "dist/server.js"]
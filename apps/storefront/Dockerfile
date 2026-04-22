# Build context: monorepo root (.)
# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Build args for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG INTERNAL_API_URL

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV INTERNAL_API_URL=${INTERNAL_API_URL}
RUN pnpm --filter @infrapro/storefront build

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

ARG INTERNAL_API_URL

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /app/apps/storefront/public ./apps/storefront/public

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

ENV HOSTNAME="0.0.0.0"
ENV PORT=3001
ENV NODE_ENV=production
ENV INTERNAL_API_URL=${INTERNAL_API_URL}

CMD ["node", "apps/storefront/server.js"]

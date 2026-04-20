# syntax=docker/dockerfile:1

# Build stage
FROM node:18-alpine AS builder
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY apps/storefront/package.json ./apps/storefront/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/storefront/ ./apps/storefront/
COPY packages/shared-types/ ./packages/shared-types/
COPY packages/ui/ ./packages/ui/
COPY packages/api-client/ ./packages/api-client/

# Build packages first
RUN pnpm --filter @infrapro/shared-types build || true
RUN pnpm --filter @infrapro/ui build || true
RUN pnpm --filter @infrapro/api-client build || true

# Build the storefront app
WORKDIR /app/apps/storefront
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
RUN npm install -g pnpm@8

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

# Copy necessary files
COPY --from=builder /app/apps/storefront/.next/standalone ./
COPY --from=builder /app/apps/storefront/.next/static ./.next/static
COPY --from=builder /app/apps/storefront/public ./public

EXPOSE 3001

CMD ["node", "server.js"]

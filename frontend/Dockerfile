# -----------------------------
# Dependencies stage
# -----------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
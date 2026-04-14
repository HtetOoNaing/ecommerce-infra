# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/src/config/config.json ./src/config/config.json
COPY --from=builder /app/.sequelizerc ./.sequelizerc

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

CMD ["node", "dist/server.js"]
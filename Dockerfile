# Dockerfile (production-ready, multi-stage)
FROM node:20-alpine AS builder
WORKDIR /app

# copy package manifests and lockfile for deterministic install
COPY package*.json ./
# if you use yarn, swap to yarn.lock + yarn install
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# copy build artifacts and node_modules so next binary exists
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
# copy package.json (and any runtime config)
COPY --from=builder /app/package.json ./package.json
# copy optional runtime files you need (next.config.js, server.js etc)
COPY --from=builder /app/next.config.js ./next.config.js
# if you have a custom server (server.js) copy it:
# COPY --from=builder /app/server.js ./server.js

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Use shell so $PORT expansions in package.json start script work
CMD ["sh", "-c", "npm start"]

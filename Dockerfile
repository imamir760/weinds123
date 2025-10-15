# Dockerfile (multi-stage, works with npm)
FROM node:20-alpine AS builder
WORKDIR /app

# copy package files (works whether you have package-lock.json or not)
COPY package*.json ./

# install all deps (includes dev deps so next is available for build)
RUN npm ci

# copy everything and build
COPY . .
RUN npm run build

# final image
FROM node:20-alpine AS runner
WORKDIR /app

# copy built output and node_modules from builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
ENV PORT 8080

# start using the local next binary and bind to 0.0.0.0
CMD ["sh","-c","node_modules/.bin/next start --hostname 0.0.0.0 -p $PORT"]

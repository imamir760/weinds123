# Dockerfile (multi-stage recommended)
FROM node:20-alpine AS builder
WORKDIR /app

# copy package manifests and install for build
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN mkdir -p public

RUN npm run build

# runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# copy build artifacts and node_modules so next binary exists
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# start using the local next binary and bind to 0.0.0.0 and $PORT
CMD ["sh","-c","node_modules/.bin/next start --hostname 0.0.0.0 -p $PORT"]

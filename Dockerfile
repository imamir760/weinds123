# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Serve the Next.js application
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# Copy build output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public # Copy public assets if any
# If you have a custom server.js, copy it here
# COPY --from=builder /app/server.js ./server.js

EXPOSE 8080 # This line documents that the container listens on port 8080

# Command to run the Next.js application in production
CMD ["yarn", "start"]

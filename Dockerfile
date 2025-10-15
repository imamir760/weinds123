# Dockerfile.temp - minimal runtime for temp server
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server.js ./
# include public if you have static files (optional)
COPY public ./public || true
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]

# Dockerfile (single-stage, simple)
FROM node:20-alpine

WORKDIR /app

# copy package files first for caching
COPY package*.json ./

# install all dependencies (including dev deps needed to build)
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# expose port Cloud Run expects
EXPOSE 8080

# start using the local next binary and bind to 0.0.0.0
CMD ["sh","-c","npx next start --hostname 0.0.0.0 -p $PORT"]

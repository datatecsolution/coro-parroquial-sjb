FROM node:20-alpine

WORKDIR /app

# Build tools for native modules (better-sqlite3 must compile from source on Alpine/musl)
RUN apk add --no-cache python3 make g++

# Install all deps (incl. devDeps) to compile native modules and build the frontend
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Drop devDeps for a smaller runtime image (compiled better-sqlite3 binary stays)
RUN npm prune --omit=dev

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server/index.js"]

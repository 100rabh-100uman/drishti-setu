# ============================================================
# DRISHTI SETU — Next.js Frontend Dockerfile
# Production-ready Node.js 20 container running Next.js 16
# ============================================================

FROM node:20-alpine AS runner

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat wget

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Pass backend API URL at build time so Next.js static pages can resolve it
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy package manifests first for optimal caching
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Copy application source code
COPY . .

# Build production Next.js bundle
RUN npm run build

# Expose Next.js server port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Launch Next.js production server on port 3000
CMD ["npm", "start", "--", "-p", "3000", "-H", "0.0.0.0"]

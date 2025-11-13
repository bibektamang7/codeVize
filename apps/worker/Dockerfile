# Use multi-stage build for production
FROM oven/bun:latest AS deps

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Build stage - copy source files
FROM oven/bun:latest AS build

WORKDIR /app

# Copy source code
COPY . .

# Install all dependencies (including dev dependencies for building/testing)
RUN bun install --frozen-lockfile

# Production stage - copy built app and production dependencies
FROM oven/bun:slim AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 app

# Copy production dependencies
COPY --from=deps --chown=app:app /app/node_modules ./node_modules

# Copy source code
COPY --chown=app:app . .

# Change to non-root user
USER app

# Set production environment
ENV NODE_ENV=production

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/bin/sh", "-c", "ps aux | grep -v grep | grep 'bun run start'"]

# Run the application
CMD ["bun", "run", "start"]
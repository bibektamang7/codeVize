FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS prepare
COPY . .
RUN bunx turbo prune --scope=server --docker

FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/package.json ./package.json
COPY --from=prepare /app/out/json/bun.lock ./bun.lock
COPY --from=prepare /app/out/full/packages ./packages
COPY --from=prepare /app/out/full/apps/server ./apps/server

RUN bun install

WORKDIR /app/apps/server

FROM oven/bun:1-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN addgroup --system appgroup && adduser --system --ingroup appgroup app

COPY --from=builder /app /app

RUN chown -R app:appgroup /app

USER app
WORKDIR /app/apps/server

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:4000/health').then(r=>r.ok?0:1).then(process.exit)" || exit 1

CMD ["sh", "-c", "cd /app/packages/db && bunx prisma migrate dev && cd /app/apps/server && bun run start"]

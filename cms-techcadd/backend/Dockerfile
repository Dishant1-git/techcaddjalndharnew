# Debian slim, not Alpine — argon2 and the TypeScript 7 compiler both ship
# native binaries, and glibc has the widest prebuild coverage for both.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build


FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev


FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV UPLOAD_DIR=uploads

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Mount a persistent volume here in Coolify, or uploaded media is lost on redeploy.
RUN mkdir -p /app/uploads

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrations are additive and safe to re-run (src/db/migrate.ts), so applying
# them on every boot keeps the schema current across deploys with no manual step.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]

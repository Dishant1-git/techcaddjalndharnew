FROM node:20.19-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps


FROM node:20.19-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Baked into the build: next.config.mjs reads this to set images.remotePatterns
# and the CSP img-src, both fixed at build time, not read again at runtime.
ARG CMS_API_URL
ENV CMS_API_URL=$CMS_API_URL

# Read by next.config.mjs while building, to allow the CMS to frame /preview.
ARG CMS_ADMIN_ORIGIN
ENV CMS_ADMIN_ORIGIN=$CMS_ADMIN_ORIGIN

RUN npm run build


FROM node:20.19-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
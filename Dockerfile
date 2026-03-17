FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# ── Dependências ────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ patches/
RUN pnpm install

# ── Build ───────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ── Produção ────────────────────────────────────────────────────
FROM base AS production

RUN apk add --no-cache tini

COPY --from=build /app/dist ./dist
COPY --from=deps  /app/node_modules ./node_modules
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

VOLUME ["/app/data"]

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

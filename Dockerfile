FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

# ── Dependências ────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY patches/ patches/
RUN pnpm install --frozen-lockfile

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

# Copiar dados JSON estáticos para que o servidor os encontre
COPY client/public/data/          dist/public/data/
COPY client/public/cra_image_mapping.json  dist/public/cra_image_mapping.json
COPY client/public/limites_preenchidos.json dist/public/limites_preenchidos.json
COPY client/public/images/        dist/public/images/
COPY client/public/logo-gci.png   dist/public/logo-gci.png

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Volume para banco SQLite (persistente entre deploys)
VOLUME ["/app/data"]

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

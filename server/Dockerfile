# Étape de construction
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les outils système + ca-certificates pour HTTPS fiable
RUN apk add --no-cache openssl ca-certificates

# Optimisations npm pour réseaux instables
RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 60000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Optionnel : utiliser un registry mirror plus stable
# RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json* ./

# Installer avec retries et ignore-scripts si problèmes de build natif
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

COPY . .
COPY prisma ./prisma

# Générer Prisma AVANT la compilation
RUN npx prisma generate

# Compiler TypeScript (sans --noEmit)
RUN rm -rf ./dist && npx tsc

# Étape de production
FROM node:20-alpine

WORKDIR /app

# Optimisations npm runtime
RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 60000

COPY package.json package-lock.json* ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev --legacy-peer-deps --prefer-offline --no-audit && \
    npm install prisma@6 --legacy-peer-deps --prefer-offline --no-audit

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
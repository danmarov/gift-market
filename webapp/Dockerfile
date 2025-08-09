FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем .env файл
COPY .env ./

# Копируем database и webapp пакеты
COPY database ./database/
COPY webapp ./webapp/

# СНАЧАЛА собираем database модуль
WORKDIR /app/database
RUN npm install
RUN npm run build

# ПОТОМ переходим в папку webapp
WORKDIR /app/webapp
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Копируем все нужные файлы из deps
COPY --from=deps /app/.env ./
COPY --from=deps /app/database ./database/
COPY --from=deps /app/webapp ./webapp/

# Переходим в webapp и собираем
WORKDIR /app/webapp
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Отключить телеметрию Next.js
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем .env файл
COPY --from=builder /app/.env ./

# Копируем database модуль (может понадобиться для runtime)
COPY --from=builder /app/database ./database/

# Копируем собранное Next.js приложение
COPY --from=builder /app/webapp/public ./webapp/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/webapp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/webapp/.next/static ./webapp/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js создается Next.js в standalone режиме
CMD ["node", "server.js"]
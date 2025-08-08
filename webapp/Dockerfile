FROM node:20-alpine AS builder
WORKDIR /app

# Копируем корневые файлы для workspaces
COPY package*.json ./
COPY ../bot/package*.json ./../bot/
COPY ../database/package*.json ./../database/

# Копируем весь монорепозиторий (для сборки)
COPY .. .

RUN npm ci
RUN npm run build --workspace=webapp

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/webapp/.next ./webapp/.next
COPY --from=builder /app/webapp/public ./webapp/public
COPY --from=builder /app/webapp/package.json ./webapp/package.json
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=webapp"]

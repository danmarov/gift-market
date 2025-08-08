
FROM node:20-alpine AS builder
WORKDIR /app


COPY ../package*.json ./

COPY ./package*.json ./bot/
COPY ../database/package*.json ./database/


COPY .. .


RUN npm ci


RUN npm run build --workspace=bot


FROM node:20-alpine AS runner
WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bot/dist ./bot/dist
COPY --from=builder /app/bot/package.json ./bot/package.json

WORKDIR /app/bot
CMD ["npm", "run", "start"]

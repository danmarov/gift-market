FROM node:20-alpine
WORKDIR /app

# Копируем .env файл
COPY .env ./

# Копируем database и bot пакеты  
COPY database ./database/
COPY bot ./bot/

# СНАЧАЛА собираем database модуль
WORKDIR /app/database
RUN npm install
RUN npm run build

# ПОТОМ переходим в папку бота
WORKDIR /app/bot

# Устанавливаем зависимости
RUN npm install

# Собираем
RUN npm run build

# Запускаем с автоматическими миграциями
CMD ["sh", "-c", "cd ../database && npx prisma migrate deploy && cd ../bot && npm start"]
FROM node:20-alpine
WORKDIR /app

# Копируем .env файл
COPY .env ./

# Копируем database пакет
COPY database ./database/

# Переходим в database
WORKDIR /app/database

# Устанавливаем зависимости
RUN npm install

# Собираем
RUN npm run build

# Открываем порт для Studio
EXPOSE 5555

# Запускаем Prisma Studio
CMD ["npx", "prisma", "studio", "--hostname", "0.0.0.0", "--port", "5555"]
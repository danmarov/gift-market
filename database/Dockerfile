FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY ../bot/package*.json ./../bot/
COPY ../webapp/package*.json ./../webapp/
COPY .. .

RUN npm ci
CMD ["npm", "run", "db:migrate", "--workspace=database"]

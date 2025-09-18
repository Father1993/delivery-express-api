# Базовый образ Node.js
FROM node:lts-alpine

# Создание рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка TypeScript
RUN npm run build

# Создание директории для логов
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
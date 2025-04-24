# Используем официальный образ Node.js
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start"]
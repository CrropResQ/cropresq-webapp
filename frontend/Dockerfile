# /frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# The --host flag is required to expose Vite outside the Docker container
CMD ["npm", "run", "dev", "--", "--host"]
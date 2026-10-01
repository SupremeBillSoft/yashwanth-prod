FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Ensure binaries in node_modules/.bin have execute permissions
RUN chmod -R +x node_modules/.bin

COPY . .
RUN npm run build

CMD ["sh", "-c", "cp -rn /app/dist/* /usr/share/nginx/html/ 2>/dev/null || true"]
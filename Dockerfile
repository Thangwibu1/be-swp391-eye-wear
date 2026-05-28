# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

# Cài đặt các công cụ build bắt buộc cho Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy file cấu hình trước để tận dụng cache
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine AS production

# Cài đặt môi trường chạy
WORKDIR /app

# Chỉ copy file quan trọng từ builder
COPY package*.json ./

# Dùng --omit=dev thay vì --only=production
RUN npm install --omit=dev

# Copy kết quả đã build từ stage trước
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "--max-old-space-size=512", "dist/server.js"]

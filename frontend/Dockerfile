# Multi-stage build para React + Nginx

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production con Nginx
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nginx-user -u 1001 -G nodejs && \
    chown -R nginx-user:nodejs /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nodejs /var/run/nginx.pid

ENV PORT=8080
EXPOSE 8080

USER nginx-user

CMD ["nginx", "-g", "daemon off;"]

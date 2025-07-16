# Etapa 1: Build con Node.js
FROM node:18 AS builder
WORKDIR /app

# Copiar package.json y lock para instalar dependencias primero (mejor caching)
COPY package.json package-lock.json* ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Construir la app con Vite
RUN npm run build

# Etapa 2: Imagen ligera para servir el frontend
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Eliminar archivos por defecto de Nginx
RUN rm -rf ./*

# Copiar archivos estáticos desde la build de Vite
COPY --from=builder /app/dist .

# Copiar configuración personalizada de nginx si lo deseas
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]

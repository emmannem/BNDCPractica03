# Usar una imagen base de Node.js para construir la aplicación
FROM node:18.18.0 as node

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/local/app

# Copiar el package.json y el package-lock.json
COPY ./ /usr/local/app

# Instalar dependencias
RUN npm install

# Construir la aplicación
RUN npm run build --prod

# Usar una imagen de servidor web ligero para servir la aplicación
FROM nginx:1.19.8-alpine
COPY --from=node /usr/local/app/dist/bdncpractica03 /usr/share/nginx/html
COPY nginx.config  /etc/nginx/conf.d/default.conf
# Exponer el puerto en el que Nginx estará escuchando
EXPOSE 80


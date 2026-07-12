# Estágio 1: Build do Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# Usamos o install padrão para garantir o ciclo de vida dos pacotes do Angular
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# Estágio 2: Servindo com Nginx
FROM nginx:stable-alpine

# IMPORTANTE: Vá no seu arquivo 'angular.json' e veja o nome do seu projeto em "defaultProject" ou dentro de "projects".
# Substitua 'nome-do-seu-projeto' abaixo pelo nome exato que está lá.
COPY --from=build /app/dist/image-process-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Etap 1: Budowanie Angulara
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etap 2: Serwowanie przez Nginx
FROM nginx:alpine
# Skopiuj konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Skopiuj pliki z folderu dist. 
# UWAGA: w Angularze 17+ ścieżka to często dist/<nazwa-projektu>/browser. 
# Zmień "invoice-system" na nazwę swojego projektu z pliku angular.json!
COPY --from=build /app/dist/invoice-system/browser /usr/share/nginx/html
EXPOSE 80
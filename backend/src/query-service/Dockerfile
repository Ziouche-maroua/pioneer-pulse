FROM node:18-alpine

WORKDIR /app

# Copie package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install --production

# Copie tout le code source
COPY . .

# Expose le port 3001
EXPOSE 3001

# Lance l'app
CMD ["node", "src/server.js"]
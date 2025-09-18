# Étape 1 : Builder le frontend
FROM node:18 AS builder
WORKDIR /app

# Copier et installer le frontend
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client
RUN cd client && npm run build

# Copier et installer le backend
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server

# Exposer le port de l'API
EXPOSE 4000

# Lancer le backend
WORKDIR /app/server
CMD ["node", "src/server.js"]

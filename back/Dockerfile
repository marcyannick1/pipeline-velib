# Utiliser l'image Node.js officielle
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 4000

# Commande de démarrage
CMD ["npm", "run", "dev"]

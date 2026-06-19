# Dockerfile pour VPS Monitoring Dashboard
# Version: 1.0
# Auteur: SHARKYBLUSTER

# Utiliser une image Node.js officielle (LTS)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration et package.json
COPY package*.json ./
COPY .env.example ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste de l'application
COPY . .

# Créer le répertoire pour les données historiques
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Changer le propriétaire du répertoire de travail
RUN chown -R nodejs:nodejs /app

# Basculer vers l'utilisateur non-root
USER nodejs

# Exposer le port de l'application (par défaut: 3000)
EXPOSE 3000

# Configurer les capabilities nécessaires pour la surveillance des processus
# Note: En production, il est préférable d'utiliser --cap-add=SYS_PTRACE
# ou de configurer les capabilities au niveau de docker-compose

# Commande par défaut pour démarrer l'application
CMD ["node", "backend/app.js"]

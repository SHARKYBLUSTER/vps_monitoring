# Dockerfile pour VPS Monitoring Dashboard
# Version: 0.4.0
# Auteur: SHARKYBLUSTER

# Utiliser une image Node.js légère (Alpine)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
# (Note: Pour le monitoring système, nous devons utiliser root ou --privileged)
# Mais nous créons quand même l'utilisateur pour les fichiers
RUN addgroup -S appuser && adduser -S -G appuser appuser

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
# Note: better-sqlite3 nécessite des outils de build
RUN apk add --no-cache python3 make g++ && \
    npm install --production && \
    apk del python3 make g++

# Copier le reste de l'application
COPY . .

# Changer les permissions des fichiers
RUN chown -R appuser:appuser /app

# Créer le répertoire data pour la base SQLite
RUN mkdir -p /app/data && \
    chown appuser:appuser /app/data

# Exposer le port par défaut (3000)
EXPOSE 3000

# Commande de démarrage
# Note: Pour le monitoring système global, le container doit être lancé avec:
# --net=host --pid=host --privileged
CMD ["node", "backend/app.js"]

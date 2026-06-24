#!/bin/bash
echo "🔄 Mise à jour du dépôt..."
git pull origin main

echo "📦 Installation des dépendances..."
npm install --production

echo "🚀 Redémarrage du service..."
pm2 restart vps_monitoring || node backend/app.js

echo "✅ Déploiement terminé !"
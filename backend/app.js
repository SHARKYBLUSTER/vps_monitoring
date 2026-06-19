/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan'); // Pour le logging des requêtes HTTP

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour le logging des requêtes (dev)
app.use(morgan('dev'));

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes API
const metricsRouter = require('./routes/metrics');
app.use('/api/metrics', metricsRouter);

// Route de base pour tester le serveur
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route de santé (health check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur VPS Monitoring en cours d\'exécution' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;

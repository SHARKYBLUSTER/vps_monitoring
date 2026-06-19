/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 * 
 * Architecture :
 * - Frontend statique (frontend/index.html)
 * - API REST pour les données JSON (/api/*)
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const metricsService = require('./services/metrics');
const historyService = require('./services/history');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Démarrer la collecte automatique de l'historique
historyService.startAutoCollect();

// Middleware pour parser le JSON et le logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Middleware CORS pour autoriser les requêtes depuis le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// ====================
// Routes API (REST)
// ====================

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/metrics :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les métriques' });
  }
});

app.get('/api/network', async (req, res) => {
  try {
    const networkMetrics = await metricsService.getNetworkMetrics();
    res.json({
      success: true,
      data: networkMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/network :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les métriques réseau' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await metricsService.getAlerts();
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/alerts :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les alertes' });
  }
});

// Endpoint pour les processus (Top consommateurs)
app.get('/api/processes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const processes = await metricsService.getTopProcesses(limit);
    res.json({
      success: true,
      data: processes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/processes :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les processus' });
  }
});

// Endpoint pour les ports ouverts
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await metricsService.getOpenPorts();
    res.json({
      success: true,
      data: ports,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/ports :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les ports ouverts' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
  });
});

// ====================
// Routes API - Historique
// ====================

app.get('/api/history', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      from: req.query.from || null,
      to: req.query.to || null,
    };
    const result = await historyService.getHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique des métriques' });
  }
});

app.get('/api/history/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const options = { limit: parseInt(req.query.limit) || 50 };
    const result = await historyService.getChartData(metric, options);
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/history/${req.params.metric} :`, error);
    res.status(500).json({ success: false, error: `Impossible de récupérer les données du graphique pour ${req.params.metric}` });
  }
});

app.get('/api/history/alerts', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      unresolvedOnly: req.query.unresolvedOnly === 'true',
    };
    const result = await historyService.getAlertsHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/alerts :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique des alertes' });
  }
});

app.post('/api/history/cleanup', async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 30;
    const result = await historyService.cleanupHistory(days);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/cleanup :', error);
    res.status(500).json({ success: false, error: 'Impossible de nettoyer l\'historique' });
  }
});

// ====================
// Route principale : Servir le frontend
// ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 API disponible :`);
  console.log(`   - GET /api/metrics       (Toutes les métriques)`);
  console.log(`   - GET /api/network       (Métriques réseau)`);
  console.log(`   - GET /api/alerts        (Alertes actives)`);
  console.log(`   - GET /api/processes     (Top 5 processus consommateurs)`);
  console.log(`   - GET /api/ports         (Ports ouverts en écoute)`);
  console.log(`   - GET /api/health        (État de santé)`);
  console.log(`   - GET /api/history       (Historique des métriques)`);
  console.log(`   - GET /api/history/:metric (Données pour graphique)`);
  console.log(`   - GET /api/history/alerts (Historique des alertes)`);
  console.log(`   - POST /api/history/cleanup (Nettoyer l'historique)`);
});

module.exports = app;

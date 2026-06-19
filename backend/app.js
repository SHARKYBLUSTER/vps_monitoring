/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 * 
 * Architecture :
 * - SSR (Server-Side Rendering) pour la page principale (/)
 * - API REST pour les données JSON (/api/*)
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan'); // Pour le logging des requêtes HTTP
const metricsService = require('./services/metrics');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour le logging des requêtes (dev)
app.use(morgan('dev'));

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// ====================
// Routes API (REST)
// ====================

/**
 * GET /api/metrics
 * Récupère toutes les métriques système (CPU, RAM, Disque, Réseau)
 */
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
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques',
    });
  }
});

/**
 * GET /api/network
 * Récupère les métriques réseau détaillées
 */
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
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques réseau',
    });
  }
});

/**
 * GET /api/alerts
 * Récupère la liste des alertes actives
 */
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
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les alertes',
    });
  }
});

/**
 * GET /api/health
 * Vérifie l'état de santé du serveur
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
  });
});

// ====================
// Routes SSR (HTML)
// ====================

/**
 * Génère le HTML avec les métriques intégrées (pour la compatibilité)
 * @param {Object} metrics - Métriques à intégrer
 * @param {Array} alerts - Alertes à afficher
 * @returns {string} - HTML généré
 */
function generateHtml(metrics, alerts) {
  // Formater les valeurs pour l'affichage
  const formatBytes = (bytes) => (bytes / (1024 ** 3)).toFixed(1); // Convertir en GB

  // Générer les cartes de métriques
  const metricsHtml = `
    <div class="metric-card">
      <h2>🧠 CPU</h2>
      <div class="metric-value">
        <span id="cpu-usage">${metrics.cpu.usage.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="cpu-progress" style="width: ${metrics.cpu.usage}%" data-tooltip="Utilisation CPU: ${metrics.cpu.usage}%"></div>
      </div>
      <p class="metric-details">
        Cœurs: <span id="cpu-cores">${metrics.cpu.cores}</span> | Modèle: <span id="cpu-model">${metrics.cpu.model}</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>💾 Mémoire (RAM)</h2>
      <div class="metric-value">
        <span id="mem-usage">${metrics.memory.usagePercent.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="mem-progress" style="width: ${metrics.memory.usagePercent}%" data-tooltip="Utilisation RAM: ${metrics.memory.usagePercent}%"></div>
      </div>
      <p class="metric-details">
        Utilisée: <span id="mem-used">${formatBytes(metrics.memory.used)} GB</span> / <span id="mem-total">${formatBytes(metrics.memory.total)} GB</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>💽 Disque</h2>
      <div class="metric-value">
        <span id="disk-usage">${metrics.disk.usagePercent.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="disk-progress" style="width: ${metrics.disk.usagePercent}%" data-tooltip="Utilisation Disque: ${metrics.disk.usagePercent}%"></div>
      </div>
      <p class="metric-details">
        Utilisé: <span id="disk-used">${formatBytes(metrics.disk.used)} GB</span> / <span id="disk-total">${formatBytes(metrics.disk.total)} GB</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>🌐 Réseau</h2>
      <div class="metric-value">
        <span id="network-status">${metrics.network.status === 'OK' ? '<span class="status-badge online">En ligne</span>' : '<span class="status-badge offline">Hors ligne</span>'}</span>
      </div>
      <p class="metric-details">
        Téléchargement: <span id="network-download">${metrics.network.download.toFixed(1)} KB/s</span> | 
        Upload: <span id="network-upload">${metrics.network.upload.toFixed(1)} KB/s</span>
      </p>
    </div>
  `;

  // Générer la liste des alertes
  let alertsHtml = '<p class="no-alerts">✅ Aucune alerte active.</p>';
  if (alerts.length > 0) {
    alertsHtml = alerts.map(alert => `
      <div class="alert ${alert.type}">
        <span>${alert.message}</span>
        <span class="time">Maintenant</span>
      </div>
    `).join('');
  }

  // HTML complet
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VPS Monitoring Dashboard</title>
      <link rel="stylesheet" href="/css/style.css">
      <!-- Seuils d'alerte pour le frontend -->
      <script>
        window.ALERT_THRESHOLDS = {
          cpu: ${config.alerts.cpuThreshold},
          memory: ${config.alerts.memoryThreshold},
          disk: ${config.alerts.diskThreshold}
        };
      </script>
    </head>
    <body>
      <header>
        <h1>🖥️ VPS Monitoring Dashboard</h1>
        <p class="subtitle">Surveillance en temps réel de votre serveur</p>
      </header>

      <main>
        <!-- Section des métriques principales -->
        <section class="metrics-container">
          ${metricsHtml}
        </section>

        <!-- Section des alertes -->
        <section class="alerts-container" id="alerts-container">
          <h2>⚠️ Alertes</h2>
          <div id="alerts-list">
            ${alertsHtml}
          </div>
        </section>

        <!-- Section des graphiques (à venir) -->
        <section class="charts-container">
          <h2>📈 Historique</h2>
          <div id="charts">
            <p class="coming-soon">Fonctionnalité à venir...</p>
          </div>
        </section>
      </main>

      <footer>
        <p>VPS Monitoring Dashboard v0.2.0 | <span id="last-update">Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</span></p>
      </footer>

      <!-- Scripts -->
      <script src="/js/components/alerts.js"></script>
      <script src="/js/components/metrics.js"></script>
      <script src="/js/app.js"></script>
    </body>
    </html>
  `;
}

// Route principale : génère le HTML avec les métriques (SSR)
app.get('/', async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    const alerts = metricsService.checkAlerts(metrics);
    const html = generateHtml(metrics, alerts);
    res.send(html);
  } catch (error) {
    console.error('❌ Erreur lors de la génération de la page :', error);
    res.status(500).send('Erreur lors de la récupération des métriques.');
  }
});

// Route de santé (compatibilité)
app.get('/health', (req, res) => {
  res.send('Serveur VPS Monitoring en cours d\'exécution');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 API disponible :`);
  console.log(`   - GET /api/metrics  (Toutes les métriques)`);
  console.log(`   - GET /api/network  (Métriques réseau)`);
  console.log(`   - GET /api/alerts   (Alertes actives)`);
  console.log(`   - GET /api/health   (État de santé)`);
});

module.exports = app;

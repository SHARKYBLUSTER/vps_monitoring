/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 * 
 * NOTE : Les métriques sont générées côté serveur et intégrées directement dans le HTML.
 * Pas d'API REST utilisée.
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan'); // Pour le logging des requêtes HTTP
const si = require('systeminformation');
const config = require('./config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour le logging des requêtes (dev)
app.use(morgan('dev'));

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

/**
 * Récupère toutes les métriques système
 * @returns {Promise<Object>} - Objet contenant toutes les métriques
 */
async function getAllMetrics() {
  try {
    const [cpuData, cpuLoad, memData, diskData, networkStats] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
    ]);

    // Trouver le disque racine
    const rootDisk = diskData.find(disk => disk.mount === '/');
    
    // Trouver une interface réseau active (exclure loopback)
    const activeInterface = networkStats.find(iface => iface.iface !== 'lo');

    return {
      cpu: {
        usage: cpuLoad.currentLoad,
        cores: cpuData.cores,
        model: cpuData.brand,
        speed: cpuData.speed,
      },
      memory: {
        used: memData.used,
        total: memData.total,
        free: memData.free,
        usagePercent: (memData.used / memData.total) * 100,
      },
      disk: rootDisk ? {
        used: rootDisk.used,
        total: rootDisk.size,
        free: rootDisk.available,
        usagePercent: (rootDisk.used / rootDisk.size) * 100,
      } : {
        used: 0,
        total: 0,
        free: 0,
        usagePercent: 0,
      },
      network: activeInterface ? {
        download: activeInterface.rx_bytes / 1024, // KB
        upload: activeInterface.tx_bytes / 1024,   // KB
        status: 'OK',
      } : {
        download: 0,
        upload: 0,
        status: 'Aucune interface active',
      },
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques :', error);
    return {
      cpu: { usage: 0, cores: 0, model: 'Inconnu', speed: 0 },
      memory: { used: 0, total: 0, free: 0, usagePercent: 0 },
      disk: { used: 0, total: 0, free: 0, usagePercent: 0 },
      network: { download: 0, upload: 0, status: 'Erreur' },
    };
  }
}

/**
 * Vérifie les alertes en fonction des seuils
 * @param {Object} metrics - Métriques à vérifier
 * @returns {Array} - Liste des alertes
 */
function checkAlerts(metrics) {
  const alerts = [];
  const thresholds = config.alerts;

  if (metrics.cpu.usage > thresholds.cpuThreshold) {
    alerts.push({
      type: 'warning',
      message: `⚠️ Utilisation CPU élevée : ${metrics.cpu.usage.toFixed(1)}%`,
    });
  }

  if (metrics.memory.usagePercent > thresholds.memoryThreshold) {
    alerts.push({
      type: 'warning',
      message: `⚠️ Utilisation mémoire élevée : ${metrics.memory.usagePercent.toFixed(1)}%`,
    });
  }

  if (metrics.disk.usagePercent > thresholds.diskThreshold) {
    alerts.push({
      type: 'danger',
      message: `🚨 Espace disque critique : ${metrics.disk.usagePercent.toFixed(1)}% utilisé`,
    });
  }

  return alerts;
}

/**
 * Génère le HTML avec les métriques intégrées
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
        <span>${metrics.cpu.usage.toFixed(1)}%</span>
      </div>
      <p class="metric-details">
        Cœurs: ${metrics.cpu.cores} | Modèle: ${metrics.cpu.model}
      </p>
    </div>

    <div class="metric-card">
      <h2>💾 Mémoire (RAM)</h2>
      <div class="metric-value">
        <span>${metrics.memory.usagePercent.toFixed(1)}%</span>
      </div>
      <p class="metric-details">
        Utilisée: ${formatBytes(metrics.memory.used)} GB / ${formatBytes(metrics.memory.total)} GB
      </p>
    </div>

    <div class="metric-card">
      <h2>💽 Disque</h2>
      <div class="metric-value">
        <span>${metrics.disk.usagePercent.toFixed(1)}%</span>
      </div>
      <p class="metric-details">
        Utilisé: ${formatBytes(metrics.disk.used)} GB / ${formatBytes(metrics.disk.total)} GB
      </p>
    </div>

    <div class="metric-card">
      <h2>🌐 Réseau</h2>
      <div class="metric-value">
        <span>${metrics.network.status}</span>
      </div>
      <p class="metric-details">
        Téléchargement: ${metrics.network.download.toFixed(1)} KB/s | Upload: ${metrics.network.upload.toFixed(1)} KB/s
      </p>
    </div>
  `;

  // Générer la liste des alertes
  let alertsHtml = '<p class="no-alerts">Aucune alerte active.</p>';
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
      <meta http-equiv="refresh" content="5"> <!-- Rafraîchissement automatique toutes les 5 secondes -->
      <title>VPS Monitoring Dashboard</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <!-- Seuils d'alerte pour le frontend -->
      <script>
        window.ALERT_THRESHOLDS = {
          cpu: ${config.alerts.cpuThreshold},
          memory: ${config.alerts.memoryThreshold},
          disk: ${config.alerts.diskThreshold}
        };
      </script>
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
        <p>VPS Monitoring Dashboard v0.1.3 | <span id="last-update">Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</span></p>
      </footer>

      <!-- Scripts -->
      <script src="/js/components/alerts.js"></script>
      <script src="/js/app.js"></script>
    </body>
    </html>
  `;
}

// Route principale : génère le HTML avec les métriques
app.get('/', async (req, res) => {
  try {
    const metrics = await getAllMetrics();
    const alerts = checkAlerts(metrics);
    const html = generateHtml(metrics, alerts);
    res.send(html);
  } catch (error) {
    console.error('❌ Erreur lors de la génération de la page :', error);
    res.status(500).send('Erreur lors de la récupération des métriques.');
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.send('Serveur VPS Monitoring en cours d\'exécution');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;

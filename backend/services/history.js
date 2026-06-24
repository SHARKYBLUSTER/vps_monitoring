/**
 * Service d'historique des métriques
 * Projet : VPS Monitoring Dashboard
 * 
 * Gère la sauvegarde et la récupération des données historiques.
 * Utilise désormais SQLite pour un stockage fiable et performant.
 */

const db = require('./db-sqlite');
const metricsService = require('./metrics');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Intervalle de sauvegarde (en ms) - par défaut 5 minutes
const SAVE_INTERVAL = process.env.HISTORY_SAVE_INTERVAL || 300000; // 5 minutes

// TTL pour les données réseau : 91 jours (3 mois + 1 jour)
const NETWORK_DATA_TTL = 91;

// Fichier pour stocker les dernières valeurs réseau (pour calculer les deltas)
const NETWORK_STATE_FILE = path.join(__dirname, '../../data/network_state.json');

// État réseau précédent (pour calculer les deltas)
let previousNetworkState = {
  rx_bytes: 0,
  tx_bytes: 0,
  timestamp: null,
};

// Démarrer le collecteur automatique
let historyInterval = null;

/**
 * Charge l'état réseau précédent depuis le fichier
 */
function loadNetworkState() {
  try {
    if (fs.existsSync(NETWORK_STATE_FILE)) {
      const data = fs.readFileSync(NETWORK_STATE_FILE, 'utf8');
      previousNetworkState = JSON.parse(data);
    }
  } catch (error) {
    console.warn('⚠️ Impossible de charger l\'état réseau précédent:', error.message);
    previousNetworkState = { rx_bytes: 0, tx_bytes: 0, timestamp: null };
  }
}

/**
 * Sauvegarde l'état réseau actuel
 * @param {Object} state - État réseau à sauvegarder
 */
function saveNetworkState(state) {
  try {
    const dir = path.dirname(NETWORK_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NETWORK_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    previousNetworkState = { ...state };
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'état réseau:', error.message);
  }
}

/**
 * Démarre la collecte automatique des métriques
 */
function startAutoCollect() {
  if (historyInterval) {
    clearInterval(historyInterval);
  }

  // Charger l'état réseau précédent au démarrage
  loadNetworkState();

  // Sauvegarder immédiatement au démarrage
  saveMetricsToHistory();

  // Sauvegarder périodiquement
  historyInterval = setInterval(saveMetricsToHistory, SAVE_INTERVAL);
  console.log(`✅ Collecte automatique des métriques démarrée (toutes les ${SAVE_INTERVAL / 1000 / 60} minutes)`);
}

/**
 * Arrête la collecte automatique des métriques
 */
function stopAutoCollect() {
  if (historyInterval) {
    clearInterval(historyInterval);
    historyInterval = null;
    console.log('✅ Collecte automatique des métriques arrêtée');
  }
}

/**
 * Sauvegarde les métriques actuelles dans l'historique
 */
async function saveMetricsToHistory() {
  try {
    const metrics = await metricsService.getAllMetrics();
    const alerts = metricsService.checkAlerts(metrics);

    // Calculer les deltas réseau si on a des données précédentes
    if (previousNetworkState.timestamp && metrics.network && metrics.network.interface) {
      // Récupérer les stats réseau brutes pour calculer les deltas
      const networkStats = await metricsService.getNetworkMetrics();
      const activeInterface = networkStats.interfaces.find(i => i.name === metrics.network.interface);
      
      if (activeInterface) {
        // Calculer les deltas (en octets)
        const deltaRx = activeInterface.rx_bytes - previousNetworkState.rx_bytes;
        const deltaTx = activeInterface.tx_bytes - previousNetworkState.tx_bytes;
        
        // Convertir en KB (et prendre la valeur absolue si négative = reset du compteur)
        const deltaDownloadKB = Math.max(0, deltaRx / 1024);
        const deltaUploadKB = Math.max(0, deltaTx / 1024);
        
        // Mettre à jour les métriques avec les deltas
        metrics.network.download = deltaDownloadKB;
        metrics.network.upload = deltaUploadKB;
      }
    }

    // Sauvegarder les métriques (avec les deltas réseau)
    await db.insertMetrics(metrics);

    // Sauvegarder les alertes
    for (const alert of alerts) {
      await db.insertAlert(alert);
    }

    // Sauvegarder l'état réseau actuel pour la prochaine collecte
    const networkStats = await metricsService.getNetworkMetrics();
    const activeInterface = networkStats.interfaces.find(i => i.name === metrics.network.interface);
    if (activeInterface) {
      saveNetworkState({
        rx_bytes: activeInterface.rx_bytes,
        tx_bytes: activeInterface.tx_bytes,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('✅ Métriques sauvegardées dans l\'historique');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des métriques:', error.message);
  }
}

/**
 * Récupère l'historique des métriques
 * @param {Object} options - Options de filtrage
 * @returns {Promise<Object>} - Historique des métriques
 */
async function getHistory(options = {}) {
  try {
    const history = await db.getMetricsHistory(options);
    return {
      success: true,
      data: history,
      count: history.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Récupère les données pour un graphique
 * @param {string} metric - Métrique (cpu, memory, disk)
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Données du graphique
 */
async function getChartData(metric, options = {}) {
  try {
    const limit = options.limit || 50;
    const chartData = await db.getMetricChartData(metric, limit);
    
    return {
      success: true,
      data: chartData,
      metric,
      count: chartData.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données du graphique:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Récupère l'historique des alertes
 * @param {Object} options - Options de filtrage
 * @returns {Promise<Object>} - Historique des alertes
 */
async function getAlertsHistory(options = {}) {
  try {
    const history = await db.getAlertsHistory(options);
    return {
      success: true,
      data: history,
      count: history.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique des alertes:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Nettoie les anciennes données
 * @param {number} days - Nombre de jours à conserver
 * @returns {Promise<Object>} - Résultat du nettoyage
 */
async function cleanupHistory(days = 30) {
  try {
    const deletedCount = await db.cleanupOldData(days);
    return {
      success: true,
      message: `${deletedCount} entrées supprimées`,
      deletedCount,
    };
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de l\'historique:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Récupère l'historique des connexions réseau avec filtre temporel
 * @param {Object} options - Options de filtrage
 * @param {string} options.period - Période (day, week, month, quarter)
 * @returns {Promise<Object>} - Historique réseau filtré et agrégé
 */
async function getNetworkHistory(options = {}) {
  try {
    const { period = 'day' } = options;
    const now = new Date();
    let startDate;

    // Calcule la date de début en fonction de la période
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    }

    // Récupère toutes les métriques depuis la base de données
    const allMetrics = await db.getMetricsHistory({ limit: 10000 });
    
    // Filtre les données réseau valides et dans la période
    const filteredData = allMetrics.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && 
             entry.network_download !== undefined && 
             entry.network_upload !== undefined;
    });

    // Les données sont déjà des deltas (calculés au moment de la collecte)
    // Agrège les données par intervalle (heure/jour selon la période)
    const aggregatedData = aggregateNetworkData(filteredData, period);

    return {
      success: true,
      data: aggregatedData,
      period,
      count: filteredData.length,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique réseau:', error.message);
    return {
      success: false,
      error: error.message,
      data: { labels: [], download: [], upload: [] },
    };
  }
}



/**
 * Agrège les données réseau par intervalle (heure/jour)
 * @param {Array} data - Données réseau brutes
 * @param {string} period - Période pour déterminer l'intervalle d'agrégation
 * @returns {Object} - Données agrégées pour Chart.js
 */
function aggregateNetworkData(data, period) {
  if (data.length === 0) return { labels: [], download: [], upload: [] };

  const grouped = {};
  data.forEach(entry => {
    const date = new Date(entry.timestamp);
    let key;

    // Groupement par heure pour 'day', par jour sinon
    if (period === 'day') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = { download: 0, upload: 0, count: 0 };
    }
    grouped[key].download += entry.network_download || 0;
    grouped[key].upload += entry.network_upload || 0;
    grouped[key].count += 1;
  });

  // Convertit en tableaux pour Chart.js
  const labels = Object.keys(grouped).sort();
  const download = labels.map(key => grouped[key].download / grouped[key].count); // Moyenne
  const upload = labels.map(key => grouped[key].upload / grouped[key].count); // Moyenne

  return { labels, download, upload };
}

/**
 * Nettoie spécifiquement l'historique réseau (appelé automatiquement)
 * @param {number} days - Nombre de jours à conserver (par défaut 91)
 * @returns {Promise<Object>} - Résultat du nettoyage
 */
async function cleanupNetworkHistory(days = NETWORK_DATA_TTL) {
  try {
    const deletedCount = await db.cleanupOldData(days);
    return {
      success: true,
      message: `${deletedCount} entrées réseau supprimées`,
      deletedCount,
    };
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de l\'historique réseau:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  startAutoCollect,
  stopAutoCollect,
  saveMetricsToHistory,
  getHistory,
  getChartData,
  getAlertsHistory,
  cleanupHistory,
  getNetworkHistory,
  cleanupNetworkHistory,
};

/**
 * Service d'historique des métriques
 * Projet : VPS Monitoring Dashboard
 * 
 * Gère la sauvegarde et la récupération des données historiques.
 * Utilise SQLite pour un stockage fiable et performant.
 * Fallback vers JSON si SQLite n'est pas disponible.
 */

const fs = require('fs');
const path = require('path');

let db;
try {
  db = require('./db-sqlite');
  console.log('✅ Base de données SQLite utilisée');
} catch (error) {
  console.warn('⚠️ SQLite non disponible, utilisation du fallback JSON:', error.message);
  db = require('./db');
}

const metricsService = require('./metrics');
const config = require('../config/config');

// Intervalle de sauvegarde (en ms) - utilise la configuration ou 5 minutes par défaut
let SAVE_INTERVAL = process.env.HISTORY_SAVE_INTERVAL || config.metricsInterval || 300000; // 5 minutes

// Fonction pour mettre à jour l'intervalle de sauvegarde
function setSaveInterval(newInterval) {
  SAVE_INTERVAL = newInterval;
  // Redémarrer la collecte avec le nouvel intervalle
  stopAutoCollect();
  startAutoCollect();
}

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
    const networkStats = await metricsService.getNetworkMetrics();
    const alerts = metricsService.checkAlerts(metrics);

    // Toujours calculer les deltas réseau à partir des stats brutes
    // Trouver l'interface active correspondante
    let activeInterface = null;
    if (metrics.network && metrics.network.interface) {
      activeInterface = networkStats.interfaces.find(i => i.name === metrics.network.interface);
    }
    
    // Si pas d'interface active trouvée, prendre la première non-loopback
    if (!activeInterface) {
      activeInterface = networkStats.interfaces.find(i => i.name !== 'lo');
    }

    let deltaDownloadKB = 0;
    let deltaUploadKB = 0;

    if (activeInterface) {
      // Si c'est la première collecte (previousNetworkState.timestamp est null),
      // initialiser avec les valeurs actuelles et ne pas calculer de delta
      if (!previousNetworkState.timestamp) {
        deltaDownloadKB = 0;
        deltaUploadKB = 0;
      } else {
        // Calculer les deltas (en octets)
        const deltaRx = activeInterface.rx_bytes - previousNetworkState.rx_bytes;
        const deltaTx = activeInterface.tx_bytes - previousNetworkState.tx_bytes;
        
        // Convertir en KB (et prendre la valeur absolue si négative = reset du compteur)
        deltaDownloadKB = Math.max(0, deltaRx / 1024);
        deltaUploadKB = Math.max(0, deltaTx / 1024);
      }
      
      // Mettre à jour les métriques avec les deltas
      metrics.network.download = deltaDownloadKB;
      metrics.network.upload = deltaUploadKB;
      metrics.network.interface = activeInterface.name;
      metrics.network.status = activeInterface.status || 'OK';
    } else {
      // Aucune interface trouvée, mettre à 0
      metrics.network.download = 0;
      metrics.network.upload = 0;
      metrics.network.interface = null;
      metrics.network.status = 'Aucune interface active';
    }

    // Sauvegarder les métriques (avec les deltas réseau)
    await db.insertMetrics(metrics);

    // Sauvegarder les alertes
    for (const alert of alerts) {
      await db.insertAlert(alert);
    }

    // Sauvegarder l'état réseau actuel pour la prochaine collecte
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
 * @param {string} options.period - Période (day, week, month, quarter)
 * @param {number} options.limit - Limite de résultats
 * @returns {Promise<Object>} - Données du graphique
 */
async function getChartData(metric, options = {}) {
  try {
    const chartData = await db.getMetricChartData(metric, options);
    
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
    
    // Utiliser la fonction dédiée de db-sqlite.js si disponible
    if (db.getNetworkHistory) {
      const result = await db.getNetworkHistory({ period });
      return {
        success: true,
        data: result,
        period,
        count: result.labels ? result.labels.length : 0,
      };
    } else {
      // Fallback pour db.js (JSON) - implémentation manuelle
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

      // Récupère toutes les métriques depuis la base de données JSON
      const allMetrics = await db.getMetricsHistory({ limit: 10000 });
      
      // Filtre les données réseau valides et dans la période
      const filteredData = allMetrics.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && 
               entry.network_download !== undefined && 
               entry.network_upload !== undefined;
      });

      // Agrège les données par jour (simplifié pour le fallback)
      const grouped = {};
      filteredData.forEach(entry => {
        const date = new Date(entry.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!grouped[key]) {
          grouped[key] = { download: 0, upload: 0, count: 0 };
        }
        grouped[key].download += entry.network_download || 0;
        grouped[key].upload += entry.network_upload || 0;
        grouped[key].count += 1;
      });

      const labels = Object.keys(grouped).sort();
      const download = labels.map(key => grouped[key].download / grouped[key].count);
      const upload = labels.map(key => grouped[key].upload / grouped[key].count);

      return {
        success: true,
        data: { labels, download, upload },
        period,
        count: filteredData.length,
      };
    }
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
  setSaveInterval,
};

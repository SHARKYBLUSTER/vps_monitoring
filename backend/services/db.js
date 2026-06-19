/**
 * Service de stockage des données (JSON temporaire)
 * Projet : VPS Monitoring Dashboard
 * 
 * NOTE: Ce service utilise un fichier JSON pour stocker les données temporairement.
 * À remplacer par SQLite ou une autre base de données en production.
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de stockage
const DATA_DIR = path.join(__dirname, '../../data');
const METRICS_FILE = path.join(DATA_DIR, 'metrics_history.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts_history.json');

// Assurez-vous que le dossier data/ existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialiser les fichiers s'ils n'existent pas
function initializeFiles() {
  if (!fs.existsSync(METRICS_FILE)) {
    fs.writeFileSync(METRICS_FILE, JSON.stringify({ metrics: [] }, null, 2));
  }
  if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify({ alerts: [] }, null, 2));
  }
}

initializeFiles();

/**
 * Lit les données depuis un fichier JSON
 * @param {string} filePath - Chemin vers le fichier
 * @returns {Object} - Données lues
 */
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message);
    return null;
  }
}

/**
 * Écrit des données dans un fichier JSON
 * @param {string} filePath - Chemin vers le fichier
 * @param {Object} data - Données à écrire
 */
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier:', error.message);
  }
}

/**
 * Insère une entrée dans l'historique des métriques
 * @param {Object} metrics - Métriques à sauvegarder
 * @returns {Promise<number>} - ID de l'entrée insérée
 */
function insertMetrics(metrics) {
  return new Promise((resolve) => {
    try {
      const data = readJsonFile(METRICS_FILE) || { metrics: [] };
      
      const newEntry = {
        id: data.metrics.length + 1,
        timestamp: new Date().toISOString(),
        cpu_usage: metrics.cpu.usage,
        cpu_cores: metrics.cpu.cores,
        cpu_model: metrics.cpu.model,
        memory_used: metrics.memory.used,
        memory_total: metrics.memory.total,
        memory_usage_percent: metrics.memory.usagePercent,
        disk_used: metrics.disk.used,
        disk_total: metrics.disk.total,
        disk_usage_percent: metrics.disk.usagePercent,
        network_download: metrics.network.download,
        network_upload: metrics.network.upload,
        network_status: metrics.network.status,
      };

      data.metrics.push(newEntry);
      writeJsonFile(METRICS_FILE, data);
      
      // Limiter à 1000 entrées pour éviter que le fichier ne devienne trop gros
      if (data.metrics.length > 1000) {
        data.metrics = data.metrics.slice(-1000);
        writeJsonFile(METRICS_FILE, data);
      }

      resolve(newEntry.id);
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion des métriques:', error.message);
      resolve(0);
    }
  });
}

/**
 * Récupère l'historique des métriques
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {string} options.from - Date de début (ISO string)
 * @param {string} options.to - Date de fin (ISO string)
 * @returns {Promise<Array>} - Liste des entrées d'historique
 */
function getMetricsHistory({ limit = 100, from = null, to = null } = {}) {
  return new Promise((resolve) => {
    try {
      const data = readJsonFile(METRICS_FILE) || { metrics: [] };
      let history = data.metrics;

      // Filtrer par date si nécessaire
      if (from || to) {
        history = history.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          if (from && entryDate < new Date(from)) return false;
          if (to && entryDate > new Date(to)) return false;
          return true;
        });
      }

      // Limiter les résultats
      history = history.slice(-limit);

      resolve(history);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error.message);
      resolve([]);
    }
  });
}

/**
 * Récupère les dernières valeurs pour un graphique
 * @param {string} metric - Métrique à récupérer (cpu, memory, disk)
 * @param {number} limit - Nombre de points à retourner
 * @returns {Promise<Array>} - Liste des valeurs avec timestamps
 */
function getMetricChartData(metric, limit = 50) {
  return new Promise((resolve) => {
    try {
      const validMetrics = ['cpu', 'memory', 'disk'];
      if (!validMetrics.includes(metric)) {
        resolve([]);
        return;
      }

      const columnMap = {
        cpu: 'cpu_usage',
        memory: 'memory_usage_percent',
        disk: 'disk_usage_percent',
      };

      const column = columnMap[metric];

      const data = readJsonFile(METRICS_FILE) || { metrics: [] };
      const history = data.metrics;

      const chartData = history
        .map(entry => ({
          timestamp: entry.timestamp,
          value: entry[column],
        }))
        .filter(entry => entry.value !== undefined)
        .slice(-limit)
        .reverse(); // Du plus ancien au plus récent

      resolve(chartData);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données du graphique:', error.message);
      resolve([]);
    }
  });
}

/**
 * Insère une alerte dans l'historique
 * @param {Object} alert - Alerte à sauvegarder
 * @returns {Promise<number>} - ID de l'entrée insérée
 */
function insertAlert(alert) {
  return new Promise((resolve) => {
    try {
      const data = readJsonFile(ALERTS_FILE) || { alerts: [] };
      
      const newEntry = {
        id: data.alerts.length + 1,
        timestamp: new Date().toISOString(),
        type: alert.type,
        metric: alert.metric,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
        resolved: false,
        resolved_at: null,
      };

      data.alerts.push(newEntry);
      writeJsonFile(ALERTS_FILE, data);
      
      // Limiter à 100 entrées
      if (data.alerts.length > 100) {
        data.alerts = data.alerts.slice(-100);
        writeJsonFile(ALERTS_FILE, data);
      }

      resolve(newEntry.id);
    } catch (error) {
      console.error('❌ Erreur lors de l\'insertion de l\'alerte:', error.message);
      resolve(0);
    }
  });
}

/**
 * Récupère l'historique des alertes
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {boolean} options.unresolvedOnly - Ne retourner que les alertes non résolues
 * @returns {Promise<Array>} - Liste des alertes historiques
 */
function getAlertsHistory({ limit = 100, unresolvedOnly = false } = {}) {
  return new Promise((resolve) => {
    try {
      const data = readJsonFile(ALERTS_FILE) || { alerts: [] };
      let history = data.alerts;

      if (unresolvedOnly) {
        history = history.filter(alert => !alert.resolved);
      }

      history = history.slice(-limit);
      resolve(history);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique des alertes:', error.message);
      resolve([]);
    }
  });
}

/**
 * Nettoie les anciennes données de l'historique
 * @param {number} days - Nombre de jours à conserver
 * @returns {Promise<number>} - Nombre de lignes supprimées
 */
function cleanupOldData(days = 30) {
  return new Promise((resolve) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Métriques
      const metricsData = readJsonFile(METRICS_FILE) || { metrics: [] };
      const oldMetricsCount = metricsData.metrics.length;
      metricsData.metrics = metricsData.metrics.filter(
        entry => new Date(entry.timestamp) >= cutoffDate
      );
      const deletedMetrics = oldMetricsCount - metricsData.metrics.length;
      writeJsonFile(METRICS_FILE, metricsData);

      // Alertes
      const alertsData = readJsonFile(ALERTS_FILE) || { alerts: [] };
      const oldAlertsCount = alertsData.alerts.length;
      alertsData.alerts = alertsData.alerts.filter(
        entry => new Date(entry.timestamp) >= cutoffDate
      );
      const deletedAlerts = oldAlertsCount - alertsData.alerts.length;
      writeJsonFile(ALERTS_FILE, alertsData);

      resolve(deletedMetrics + deletedAlerts);
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des données:', error.message);
      resolve(0);
    }
  });
}

// Simuler un objet db pour la compatibilité
const db = {
  insertMetrics,
  getMetricsHistory,
  getMetricChartData,
  insertAlert,
  getAlertsHistory,
  cleanupOldData,
};

module.exports = db;

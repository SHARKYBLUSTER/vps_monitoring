/**
 * Service d'historique des métriques
 * Projet : VPS Monitoring Dashboard
 * 
 * Gère la sauvegarde et la récupération des données historiques.
 * Utilise un stockage JSON temporaire (à remplacer par SQLite en production).
 */

const db = require('./db');
const metricsService = require('./metrics');
const config = require('../config/config');

// Intervalle de sauvegarde (en ms) - par défaut 5 minutes
const SAVE_INTERVAL = process.env.HISTORY_SAVE_INTERVAL || 300000; // 5 minutes

// Démarrer le collecteur automatique
let historyInterval = null;

/**
 * Démarre la collecte automatique des métriques
 */
function startAutoCollect() {
  if (historyInterval) {
    clearInterval(historyInterval);
  }

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

    // Sauvegarder les métriques
    await db.insertMetrics(metrics);

    // Sauvegarder les alertes
    for (const alert of alerts) {
      await db.insertAlert(alert);
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

module.exports = {
  startAutoCollect,
  stopAutoCollect,
  saveMetricsToHistory,
  getHistory,
  getChartData,
  getAlertsHistory,
  cleanupHistory,
};

/**
 * Contrôleur pour les métriques
 * Gère les requêtes liées aux métriques système.
 * Projet : VPS Monitoring Dashboard
 */

const metricCollector = require('../services/metricCollector');

/**
 * Récupère toutes les métriques
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getMetrics(req, res) {
  try {
    const metrics = await metricCollector.getAllMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getMetrics :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les métriques',
      details: error.message,
    });
  }
}

/**
 * Récupère les métriques CPU
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getCpuMetrics(req, res) {
  try {
    const cpuMetrics = await metricCollector.getCpuMetrics();
    res.json(cpuMetrics);
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getCpuMetrics :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les métriques CPU',
      details: error.message,
    });
  }
}

/**
 * Récupère les métriques mémoire
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getMemoryMetrics(req, res) {
  try {
    const memoryMetrics = await metricCollector.getMemoryMetrics();
    res.json(memoryMetrics);
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getMemoryMetrics :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les métriques mémoire',
      details: error.message,
    });
  }
}

/**
 * Récupère les métriques disque
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getDiskMetrics(req, res) {
  try {
    const diskMetrics = await metricCollector.getDiskMetrics();
    res.json(diskMetrics);
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getDiskMetrics :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les métriques disque',
      details: error.message,
    });
  }
}

/**
 * Récupère les métriques réseau
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getNetworkMetrics(req, res) {
  try {
    const networkMetrics = await metricCollector.getNetworkMetrics();
    res.json(networkMetrics);
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getNetworkMetrics :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les métriques réseau',
      details: error.message,
    });
  }
}

/**
 * Récupère les alertes actives
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
async function getAlerts(req, res) {
  try {
    const metrics = await metricCollector.getAllMetrics();
    const alerts = metricCollector.checkAlerts(metrics);
    res.json({ alerts, metrics });
  } catch (error) {
    console.error('❌ Erreur dans le contrôleur getAlerts :', error);
    res.status(500).json({
      error: 'Impossible de récupérer les alertes',
      details: error.message,
    });
  }
}

module.exports = {
  getMetrics,
  getCpuMetrics,
  getMemoryMetrics,
  getDiskMetrics,
  getNetworkMetrics,
  getAlerts,
};

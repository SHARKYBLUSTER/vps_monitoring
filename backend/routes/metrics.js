/**
 * Routes pour les métriques
 * Définit les endpoints API pour récupérer les métriques système.
 * Projet : VPS Monitoring Dashboard
 */

const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics');

// Récupère toutes les métriques
router.get('/', metricsController.getMetrics);

// Récupère les métriques CPU
router.get('/cpu', metricsController.getCpuMetrics);

// Récupère les métriques mémoire
router.get('/memory', metricsController.getMemoryMetrics);

// Récupère les métriques disque
router.get('/disk', metricsController.getDiskMetrics);

// Récupère les métriques réseau
router.get('/network', metricsController.getNetworkMetrics);

// Récupère les alertes actives
router.get('/alerts', metricsController.getAlerts);

module.exports = router;

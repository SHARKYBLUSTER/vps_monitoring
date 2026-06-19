/**
 * Service de collecte des métriques système
 * Utilise la bibliothèque `systeminformation` pour récupérer les données du VPS.
 * Projet : VPS Monitoring Dashboard
 */

const si = require('systeminformation');
const config = require('../config/config');

/**
 * Récupère les métriques CPU
 * @returns {Promise<Object>} - Données CPU (usage, cores, model)
 */
async function getCpuMetrics() {
  try {
    const cpuData = await si.cpu();
    const cpuLoad = await si.currentLoad();
    
    return {
      usage: cpuLoad.currentLoad, // Pourcentage d'utilisation
      cores: cpuData.cores,
      model: cpuData.brand,
      speed: cpuData.speed,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques CPU :', error);
    return {
      usage: 0,
      cores: 0,
      model: 'Inconnu',
      speed: 0,
    };
  }
}

/**
 * Récupère les métriques mémoire (RAM)
 * @returns {Promise<Object>} - Données mémoire (used, total, free)
 */
async function getMemoryMetrics() {
  try {
    const memData = await si.mem();
    
    return {
      used: memData.used,
      total: memData.total,
      free: memData.free,
      usagePercent: (memData.used / memData.total) * 100,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques mémoire :', error);
    return {
      used: 0,
      total: 0,
      free: 0,
      usagePercent: 0,
    };
  }
}

/**
 * Récupère les métriques disque
 * @returns {Promise<Object>} - Données disque (used, total, free)
 */
async function getDiskMetrics() {
  try {
    const diskData = await si.fsSize();
    const rootDisk = diskData.find(disk => disk.mount === '/'); // Disque racine
    
    if (!rootDisk) {
      throw new Error('Disque racine non trouvé');
    }
    
    return {
      used: rootDisk.used,
      total: rootDisk.size,
      free: rootDisk.available,
      usagePercent: (rootDisk.used / rootDisk.size) * 100,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques disque :', error);
    return {
      used: 0,
      total: 0,
      free: 0,
      usagePercent: 0,
    };
  }
}

/**
 * Récupère les métriques réseau
 * @returns {Promise<Object>} - Données réseau (download, upload)
 */
async function getNetworkMetrics() {
  try {
    const networkStats = await si.networkStats();
    const activeInterface = networkStats.find(iface => iface.iface !== 'lo'); // Exclure loopback
    
    if (!activeInterface) {
      return {
        download: 0,
        upload: 0,
        status: 'Aucune interface active',
      };
    }
    
    return {
      download: activeInterface.rx_bytes / 1024, // Convertir en KB
      upload: activeInterface.tx_bytes / 1024,   // Convertir en KB
      status: 'OK',
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques réseau :', error);
    return {
      download: 0,
      upload: 0,
      status: 'Erreur',
    };
  }
}

/**
 * Récupère toutes les métriques
 * @returns {Promise<Object>} - Toutes les métriques (CPU, RAM, Disque, Réseau)
 */
async function getAllMetrics() {
  try {
    const [cpu, memory, disk, network] = await Promise.all([
      getCpuMetrics(),
      getMemoryMetrics(),
      getDiskMetrics(),
      getNetworkMetrics(),
    ]);
    
    return {
      cpu,
      memory,
      disk,
      network,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques :', error);
    return {
      cpu: { usage: 0, cores: 0, model: 'Inconnu' },
      memory: { used: 0, total: 0, usagePercent: 0 },
      disk: { used: 0, total: 0, usagePercent: 0 },
      network: { download: 0, upload: 0, status: 'Erreur' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Vérifie les alertes en fonction des seuils définis dans config.js
 * @param {Object} metrics - Métriques à vérifier
 * @returns {Object} - Alertes actives
 */
function checkAlerts(metrics) {
  const alerts = [];
  const thresholds = config.alerts;
  
  // Vérifier le CPU
  if (metrics.cpu.usage > thresholds.cpuThreshold) {
    alerts.push({
      type: 'warning',
      message: `Utilisation CPU élevée : ${metrics.cpu.usage.toFixed(1)}%`,
      metric: 'cpu',
      value: metrics.cpu.usage,
      threshold: thresholds.cpuThreshold,
    });
  }
  
  // Vérifier la mémoire
  if (metrics.memory.usagePercent > thresholds.memoryThreshold) {
    alerts.push({
      type: 'warning',
      message: `Utilisation mémoire élevée : ${metrics.memory.usagePercent.toFixed(1)}%`,
      metric: 'memory',
      value: metrics.memory.usagePercent,
      threshold: thresholds.memoryThreshold,
    });
  }
  
  // Vérifier le disque
  if (metrics.disk.usagePercent > thresholds.diskThreshold) {
    alerts.push({
      type: 'danger',
      message: `Espace disque critique : ${metrics.disk.usagePercent.toFixed(1)}% utilisé`,
      metric: 'disk',
      value: metrics.disk.usagePercent,
      threshold: thresholds.diskThreshold,
    });
  }
  
  return alerts;
}

module.exports = {
  getCpuMetrics,
  getMemoryMetrics,
  getDiskMetrics,
  getNetworkMetrics,
  getAllMetrics,
  checkAlerts,
};

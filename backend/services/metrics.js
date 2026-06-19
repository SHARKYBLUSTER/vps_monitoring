/**
 * Service de collecte des métriques système
 * Projet : VPS Monitoring Dashboard
 */

const si = require('systeminformation');
const config = require('../config/config');

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
        interface: activeInterface.iface,
      } : {
        download: 0,
        upload: 0,
        status: 'Aucune interface active',
        interface: null,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques :', error);
    return {
      cpu: { usage: 0, cores: 0, model: 'Inconnu', speed: 0 },
      memory: { used: 0, total: 0, free: 0, usagePercent: 0 },
      disk: { used: 0, total: 0, free: 0, usagePercent: 0 },
      network: { download: 0, upload: 0, status: 'Erreur', interface: null },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Récupère les métriques réseau détaillées
 * @returns {Promise<Object>} - Objet contenant les métriques réseau
 */
async function getNetworkMetrics() {
  try {
    const networkStats = await si.networkStats();
    const networkInterfaces = await si.networkInterfaces();
    
    // Filtrer les interfaces actives (exclure loopback)
    const activeInterfaces = networkStats.filter(iface => iface.iface !== 'lo');
    
    // Récupérer les statistiques détaillées pour chaque interface
    const interfacesDetails = activeInterfaces.map(iface => {
      const interfaceInfo = networkInterfaces.find(int => int.iface === iface.iface);
      return {
        name: iface.iface,
        rx_bytes: iface.rx_bytes,
        tx_bytes: iface.tx_bytes,
        rx_packets: iface.rx_packets,
        tx_packets: iface.tx_packets,
        ip: interfaceInfo ? interfaceInfo.ip4 : null,
        mac: interfaceInfo ? interfaceInfo.mac : null,
        status: interfaceInfo ? interfaceInfo.operstate : 'unknown',
      };
    });

    return {
      interfaces: interfacesDetails,
      total: {
        download: activeInterfaces.reduce((sum, iface) => sum + iface.rx_bytes, 0) / 1024,
        upload: activeInterfaces.reduce((sum, iface) => sum + iface.tx_bytes, 0) / 1024,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques réseau :', error);
    return {
      interfaces: [],
      total: { download: 0, upload: 0 },
      timestamp: new Date().toISOString(),
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
      metric: 'cpu',
      message: `⚠️ Utilisation CPU élevée : ${metrics.cpu.usage.toFixed(1)}%`,
      value: metrics.cpu.usage,
      threshold: thresholds.cpuThreshold,
    });
  }

  if (metrics.memory.usagePercent > thresholds.memoryThreshold) {
    alerts.push({
      type: 'warning',
      metric: 'memory',
      message: `⚠️ Utilisation mémoire élevée : ${metrics.memory.usagePercent.toFixed(1)}%`,
      value: metrics.memory.usagePercent,
      threshold: thresholds.memoryThreshold,
    });
  }

  if (metrics.disk.usagePercent > thresholds.diskThreshold) {
    alerts.push({
      type: 'danger',
      metric: 'disk',
      message: `🚨 Espace disque critique : ${metrics.disk.usagePercent.toFixed(1)}% utilisé`,
      value: metrics.disk.usagePercent,
      threshold: thresholds.diskThreshold,
    });
  }

  return alerts;
}

/**
 * Récupère les alertes actuelles
 * @returns {Promise<Array>} - Liste des alertes
 */
async function getAlerts() {
  const metrics = await getAllMetrics();
  return checkAlerts(metrics);
}

/**
 * Récupère les processus les plus consommateurs
 * @param {number} limit - Nombre de processus à retourner (par défaut 5)
 * @returns {Promise<Array>} - Liste des processus triés par consommation CPU
 */
async function getTopProcesses(limit = 5) {
  try {
    const processes = await si.processes();
    return processes
      .filter(p => p.pid && p.name) // Filtrer les processus valides
      .sort((a, b) => b.cpu - a.cpu) // Tri par CPU (décroissant)
      .slice(0, limit)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.cpu,
        mem: p.mem, // en %
        user: p.user || 'unknown',
      }));
  } catch (error) {
    console.error('❌ Erreur processus :', error);
    return [];
  }
}

module.exports = {
  getAllMetrics,
  getNetworkMetrics,
  checkAlerts,
  getAlerts,
  getTopProcesses,
};

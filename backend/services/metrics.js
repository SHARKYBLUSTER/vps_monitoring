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
 * Récupère les ports ouverts en écoute
 * @returns {Promise<Array>} - Liste des ports TCP en écoute
 */
async function getOpenPorts() {
  try {
    const connections = await si.networkConnections('tcp');
    
    if (!connections || connections.length === 0) {
      return [];
    }
    
    return connections
      .filter(p => p.state === 'LISTEN' || p.state === 'listen')
      .map(p => ({
        port: p.localPort,
        address: p.localAddress || '0.0.0.0',
        pid: p.pid || null,
        process: p.processName || 'Unknown',
        protocol: p.protocol || 'TCP',
        state: p.state
      }));
  } catch (error) {
    console.error('❌ Erreur ports ouverts :', error.message);
    return [];
  }
}

/**
 * Récupère les processus les plus consommateurs
 * @param {number} limit - Nombre de processus à retourner (par défaut 5)
 * @returns {Promise<Array>} - Liste des processus triés par consommation CPU
 */
async function getTopProcesses(limit = 5) {
  try {
    // si.processes() retourne un objet avec une propriété 'list'
    const result = await si.processes();
    
    // Vérifier si on a bien un objet avec la propriété list
    const processes = result.list || result || [];
    
    if (!Array.isArray(processes) || processes.length === 0) {
      console.warn('⚠️ Aucun processus retourné. Vérifiez les permissions (root ou cap_sys_ptrace).');
      console.warn('   Result:', result);
      return [];
    }
    
    return processes
      .filter(p => p && p.pid && p.name && p.cpu !== undefined) // Filtrer les processus valides
      .sort((a, b) => (b.cpu || 0) - (a.cpu || 0)) // Tri par CPU (décroissant)
      .slice(0, limit)
      .map(p => ({
        pid: p.pid,
        name: p.name || 'unknown',
        cpu: p.cpu ? parseFloat(p.cpu.toFixed(1)) : 0,
        mem: p.mem ? parseFloat(p.mem.toFixed(1)) : 0, // en %
        user: p.user || 'unknown',
      }));
  } catch (error) {
    console.error('❌ Erreur processus :', error.message);
    console.warn('💡 Pour activer la surveillance des processus :');
    console.warn('   - Exécutez avec sudo : sudo node backend/app.js');
    console.warn('   - Ou donnez les permissions : sudo setcap cap_sys_ptrace,cap_dac_read_search+ep /usr/bin/node');
    return [];
  }
}

module.exports = {
  getAllMetrics,
  getNetworkMetrics,
  checkAlerts,
  getAlerts,
  getTopProcesses,
  getOpenPorts,
};

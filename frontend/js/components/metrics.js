/**
 * Module pour la gestion des métriques
 * Projet : VPS Monitoring Dashboard
 * 
 * Ce module gère la collecte, le traitement et l'affichage des métriques.
 */

// Fonction pour formater les valeurs numériques
function formatNumber(value, decimals = 2) {
  return parseFloat(value).toFixed(decimals);
}

// Fonction pour formater les pourcentages
function formatPercentage(value) {
  return `${formatNumber(value, 1)}%`;
}

// Fonction pour formater la taille en octets (ex: GB, MB)
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 GB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${formatNumber(bytes / Math.pow(k, i), decimals)} ${sizes[i]}`;
}

// Fonction pour mettre à jour les métriques dans le DOM
function updateMetricsInDOM(metrics) {
  if (!metrics) return;

  // Mettre à jour le CPU
  if (metrics.cpu) {
    const cpuUsageEl = document.getElementById('cpu-usage');
    const cpuCoresEl = document.getElementById('cpu-cores');
    const cpuModelEl = document.getElementById('cpu-model');
    
    if (cpuUsageEl) cpuUsageEl.textContent = `${formatPercentage(metrics.cpu.usage)}`;
    if (cpuCoresEl) cpuCoresEl.textContent = metrics.cpu.cores || '--';
    if (cpuModelEl) cpuModelEl.textContent = metrics.cpu.model || '--';
  }

  // Mettre à jour la RAM
  if (metrics.memory) {
    const memUsageEl = document.getElementById('mem-usage');
    const memUsedEl = document.getElementById('mem-used');
    const memTotalEl = document.getElementById('mem-total');
    
    if (memUsageEl) memUsageEl.textContent = `${formatPercentage(metrics.memory.usagePercent)}`;
    if (memUsedEl) memUsedEl.textContent = `${formatBytes(metrics.memory.used)}`;
    if (memTotalEl) memTotalEl.textContent = `${formatBytes(metrics.memory.total)}`;
  }

  // Mettre à jour le Disque
  if (metrics.disk) {
    const diskUsageEl = document.getElementById('disk-usage');
    const diskUsedEl = document.getElementById('disk-used');
    const diskTotalEl = document.getElementById('disk-total');
    
    if (diskUsageEl) diskUsageEl.textContent = `${formatPercentage(metrics.disk.usagePercent)}`;
    if (diskUsedEl) diskUsedEl.textContent = `${formatBytes(metrics.disk.used)}`;
    if (diskTotalEl) diskTotalEl.textContent = `${formatBytes(metrics.disk.total)}`;
  }

  // Mettre à jour le Réseau
  if (metrics.network) {
    const networkStatusEl = document.getElementById('network-status');
    const networkDownloadEl = document.getElementById('network-download');
    const networkUploadEl = document.getElementById('network-upload');
    
    if (networkStatusEl) {
      networkStatusEl.innerHTML = metrics.network.online 
        ? '<span class="status-badge online">En ligne</span>'
        : '<span class="status-badge offline">Hors ligne</span>';
    }
    if (networkDownloadEl) networkDownloadEl.textContent = `${formatBytes(metrics.network.download)}/s`;
    if (networkUploadEl) networkUploadEl.textContent = `${formatBytes(metrics.network.upload)}/s`;
  }

  // Mettre à jour les barres de progression
  if (window.vpsMonitoring && window.vpsMonitoring.updateProgressBars) {
    window.vpsMonitoring.updateProgressBars(metrics);
  }

  // Mettre à jour l'horodatage
  if (window.vpsMonitoring && window.vpsMonitoring.updateTimestamp) {
    window.vpsMonitoring.updateTimestamp();
  }
}

// Fonction pour récupérer les métriques depuis le backend (à utiliser quand l'API sera prête)
async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const metrics = await response.json();
    return metrics;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    if (window.vpsMonitoring && window.vpsMonitoring.showError) {
      window.vpsMonitoring.showError('Impossible de récupérer les métriques');
    }
    return null;
  }
}

// Exporter les fonctions pour les utiliser dans d'autres modules
window.vpsMonitoringMetrics = {
  formatNumber,
  formatPercentage,
  formatBytes,
  updateMetricsInDOM,
  fetchMetrics,
};

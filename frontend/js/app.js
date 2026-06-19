/**
 * Point d'entrée principal du frontend (Vanilla JS)
 * Projet : VPS Monitoring Dashboard
 * 
 * Architecture :
 * - Récupération des métriques via l'API REST (/api/metrics)
 * - Rafraîchissement automatique toutes les 5 secondes
 * - Mise à jour dynamique du DOM
 */

// Configuration
const REFRESH_INTERVAL = 5000; // 5 secondes

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ VPS Monitoring Dashboard initialisé');
  
  // Initialiser les seuils d'alerte (définis dans le HTML ou par défaut)
  window.ALERT_THRESHOLDS = window.ALERT_THRESHOLDS || {
    cpu: 80,
    memory: 85,
    disk: 90,
  };
  
  // Charger les métriques initialement
  fetchMetrics();
  
  // Rafraîchir les métriques périodiquement
  setInterval(fetchMetrics, REFRESH_INTERVAL);
  
  // Mettre à jour l'horodatage
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

/**
 * Récupère les métriques depuis l'API
 */
async function fetchMetrics() {
  try {
    console.log('🔄 Appel API /api/metrics...');
    const response = await fetch('/api/metrics');
    
    // Rediriger vers /login si 401 (non autorisé)
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📥 Données reçues de /api/metrics:', data);
    
    if (data.success && data.data) {
      const metrics = data.data;
      console.log('📊 Métriques extraites:', metrics);
      
      // Mettre à jour les métriques dans le DOM
      updateMetricsInDOM(metrics);
      
      // Mettre à jour les barres de progression
      updateProgressBars(metrics);
      
      // Vérifier les alertes
      checkAlerts(metrics);
    } else {
      console.error('❌ Réponse API invalide:', data);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques:', error);
    showError('Impossible de récupérer les métriques. Vérifiez la connexion au serveur.');
  }
}

/**
 * Met à jour les métriques dans le DOM
 * @param {Object} metrics - Données des métriques
 */
function updateMetricsInDOM(metrics) {
  console.log('🔧 updateMetricsInDOM appelé avec:', metrics);
  if (!metrics) {
    console.error('❌ metrics est undefined ou null');
    return;
  }

  // Mettre à jour le CPU
  if (metrics.cpu) {
    console.log('🔧 Mise à jour CPU:', metrics.cpu);
    const cpuUsageEl = document.getElementById('cpu-usage');
    const cpuCoresEl = document.getElementById('cpu-cores');
    const cpuModelEl = document.getElementById('cpu-model');
    
    if (cpuUsageEl) {
      cpuUsageEl.textContent = `${metrics.cpu.usage.toFixed(1)}%`;
      console.log('✅ CPU usage mis à jour:', cpuUsageEl.textContent);
    } else {
      console.error('❌ Éléments CPU introuvables');
    }
    if (cpuCoresEl) cpuCoresEl.textContent = metrics.cpu.cores || '--';
    if (cpuModelEl) cpuModelEl.textContent = metrics.cpu.model || '--';
  } else {
    console.error('❌ metrics.cpu est undefined');
  }

  // Mettre à jour la RAM
  if (metrics.memory) {
    console.log('🔧 Mise à jour RAM:', metrics.memory);
    const memUsageEl = document.getElementById('mem-usage');
    const memUsedEl = document.getElementById('mem-used');
    const memTotalEl = document.getElementById('mem-total');
    
    if (memUsageEl) {
      memUsageEl.textContent = `${metrics.memory.usagePercent.toFixed(1)}%`;
      console.log('✅ RAM usage mis à jour:', memUsageEl.textContent);
    } else {
      console.error('❌ Éléments RAM introuvables');
    }
    if (memUsedEl) memUsedEl.textContent = `${formatBytes(metrics.memory.used)} GB`;
    if (memTotalEl) memTotalEl.textContent = `${formatBytes(metrics.memory.total)} GB`;
  } else {
    console.error('❌ metrics.memory est undefined');
  }

  // Mettre à jour le Disque
  if (metrics.disk) {
    console.log('🔧 Mise à jour Disque:', metrics.disk);
    const diskUsageEl = document.getElementById('disk-usage');
    const diskUsedEl = document.getElementById('disk-used');
    const diskTotalEl = document.getElementById('disk-total');
    
    if (diskUsageEl) {
      diskUsageEl.textContent = `${metrics.disk.usagePercent.toFixed(1)}%`;
      console.log('✅ Disk usage mis à jour:', diskUsageEl.textContent);
    } else {
      console.error('❌ Éléments Disque introuvables');
    }
    if (diskUsedEl) diskUsedEl.textContent = `${formatBytes(metrics.disk.used)} GB`;
    if (diskTotalEl) diskTotalEl.textContent = `${formatBytes(metrics.disk.total)} GB`;
  } else {
    console.error('❌ metrics.disk est undefined');
  }

  // Mettre à jour le Réseau
  if (metrics.network) {
    console.log('🔧 Mise à jour Réseau:', metrics.network);
    const networkStatusEl = document.getElementById('network-status');
    const networkDownloadEl = document.getElementById('network-download');
    const networkUploadEl = document.getElementById('network-upload');
    
    if (networkStatusEl) {
      networkStatusEl.innerHTML = metrics.network.status === 'OK' 
        ? '<span class="status-badge online">En ligne</span>' 
        : '<span class="status-badge offline">Hors ligne</span>';
      console.log('✅ Network status mis à jour');
    } else {
      console.error('❌ Éléments Réseau introuvables');
    }
    if (networkDownloadEl) networkDownloadEl.textContent = `${(metrics.network.download).toFixed(1)} KB/s`;
    if (networkUploadEl) networkUploadEl.textContent = `${(metrics.network.upload).toFixed(1)} KB/s`;
  } else {
    console.error('❌ metrics.network est undefined');
  }
}

/**
 * Met à jour les barres de progression pour CPU, RAM et Disque
 * @param {Object} metrics - Données des métriques
 */
function updateProgressBars(metrics) {
  // Barre de progression CPU
  const cpuProgress = document.getElementById('cpu-progress');
  if (cpuProgress && metrics.cpu) {
    cpuProgress.style.width = `${metrics.cpu.usage}%`;
    cpuProgress.setAttribute('data-tooltip', `Utilisation CPU: ${metrics.cpu.usage.toFixed(1)}%`);
  }
  
  // Barre de progression RAM
  const memProgress = document.getElementById('mem-progress');
  if (memProgress && metrics.memory) {
    memProgress.style.width = `${metrics.memory.usagePercent}%`;
    memProgress.setAttribute('data-tooltip', `Utilisation RAM: ${metrics.memory.usagePercent.toFixed(1)}%`);
  }
  
  // Barre de progression Disque
  const diskProgress = document.getElementById('disk-progress');
  if (diskProgress && metrics.disk) {
    diskProgress.style.width = `${metrics.disk.usagePercent}%`;
    diskProgress.setAttribute('data-tooltip', `Utilisation Disque: ${metrics.disk.usagePercent.toFixed(1)}%`);
  }
}

/**
 * Vérifie les alertes en fonction des seuils
 * @param {Object} metrics - Données des métriques
 */
function checkAlerts(metrics) {
  // Utilise le module d'alertes du frontend
  if (window.vpsMonitoringAlerts && window.vpsMonitoringAlerts.checkAlerts) {
    window.vpsMonitoringAlerts.checkAlerts(metrics);
  }
}

/**
 * Affiche une erreur dans l'interface
 * @param {string} message - Message d'erreur
 */
function showError(message) {
  const alertsContainer = document.getElementById('alerts-list');
  if (alertsContainer) {
    alertsContainer.innerHTML = `
      <div class="alert danger">
        <span>❌ ${message}</span>
        <span class="time">Maintenant</span>
      </div>
    `;
  }
}

/**
 * Met à jour l'horodatage dans le footer
 */
function updateTimestamp() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('fr-FR');
  const dateString = now.toLocaleDateString('fr-FR');
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Dernière mise à jour : ${dateString} ${timeString}`;
  }
}

/**
 * Formate les octets en GB, MB, KB, etc.
 * @param {number} bytes - Valeur en octets
 * @returns {string} - Valeur formatée
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1);
}

// Exporter les fonctions pour les utiliser dans d'autres modules
window.vpsMonitoring = {
  fetchMetrics,
  updateMetricsInDOM,
  updateProgressBars,
  checkAlerts,
  showError,
  updateTimestamp,
  formatBytes,
};

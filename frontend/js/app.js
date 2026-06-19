/**
 * Point d'entrée principal du frontend (Vanilla JS)
 * Projet : VPS Monitoring Dashboard
 */

// Variables globales
const API_BASE_URL = '/api';
let metricsInterval;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ VPS Monitoring Dashboard initialisé');
  
  // Démarrer la collecte des métriques
  startMetricsCollection();
  
  // Mettre à jour l'horodatage
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

/**
 * Démarre la collecte périodique des métriques
 */
function startMetricsCollection() {
  fetchMetrics(); // Appel initial
  metricsInterval = setInterval(fetchMetrics, 5000); // Rafraîchit toutes les 5 secondes
}

/**
 * Arrête la collecte des métriques
 */
function stopMetricsCollection() {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
}

/**
 * Récupère les métriques depuis l'API
 */
async function fetchMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    
    const data = await response.json();
    updateMetricsUI(data);
    checkAlerts(data);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des métriques :', error);
    showError('Impossible de récupérer les métriques. Vérifiez que le serveur est en cours d\'exécution.');
  }
}

/**
 * Met à jour l'interface utilisateur avec les métriques
 * @param {Object} metrics - Données des métriques
 */
function updateMetricsUI(metrics) {
  // CPU
  if (metrics.cpu) {
    document.getElementById('cpu-usage').textContent = `${metrics.cpu.usage.toFixed(1)}%`;
    document.getElementById('cpu-cores').textContent = metrics.cpu.cores || '--';
    document.getElementById('cpu-model').textContent = metrics.cpu.model || '--';
  }

  // Mémoire
  if (metrics.memory) {
    const memUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
    document.getElementById('mem-usage').textContent = `${memUsagePercent.toFixed(1)}%`;
    document.getElementById('mem-used').textContent = `${(metrics.memory.used / (1024 ** 3)).toFixed(1)} GB`;
    document.getElementById('mem-total').textContent = `${(metrics.memory.total / (1024 ** 3)).toFixed(1)} GB`;
  }

  // Disque
  if (metrics.disk) {
    const diskUsagePercent = (metrics.disk.used / metrics.disk.total) * 100;
    document.getElementById('disk-usage').textContent = `${diskUsagePercent.toFixed(1)}%`;
    document.getElementById('disk-used').textContent = `${(metrics.disk.used / (1024 ** 3)).toFixed(1)} GB`;
    document.getElementById('disk-total').textContent = `${(metrics.disk.total / (1024 ** 3)).toFixed(1)} GB`;
  }

  // Réseau (si disponible)
  if (metrics.network) {
    document.getElementById('network-status').textContent = metrics.network.status || 'OK';
    document.getElementById('network-download').textContent = metrics.network.download ? `${metrics.network.download} KB/s` : '-- KB/s';
    document.getElementById('network-upload').textContent = metrics.network.upload ? `${metrics.network.upload} KB/s` : '-- KB/s';
  }
}

/**
 * Vérifie les alertes en fonction des seuils
 * @param {Object} metrics - Données des métriques
 */
function checkAlerts(metrics) {
  // À implémenter dans le fichier alerts.js
  // Cette fonction sera appelée après la mise à jour des métriques
}

/**
 * Affiche une erreur dans l'interface
 * @param {string} message - Message d'erreur
 */
function showError(message) {
  const alertsContainer = document.getElementById('alerts-list');
  alertsContainer.innerHTML = `
    <div class="alert danger">
      <span>${message}</span>
      <span class="time">Maintenant</span>
    </div>
  `;
}

/**
 * Met à jour l'horodatage dans le footer
 */
function updateTimestamp() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('fr-FR');
  const dateString = now.toLocaleDateString('fr-FR');
  document.getElementById('last-update').textContent = `Dernière mise à jour : ${dateString} ${timeString}`;
}

// Exporter les fonctions pour les utiliser dans d'autres modules
window.vpsMonitoring = {
  fetchMetrics,
  updateMetricsUI,
  startMetricsCollection,
  stopMetricsCollection,
  showError,
};

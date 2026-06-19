/**
 * Module pour la gestion des alertes
 * Projet : VPS Monitoring Dashboard
 */

// Seuils d'alerte (peuvent être récupérés depuis le backend plus tard)
const ALERT_THRESHOLDS = {
  cpu: 80,    // %
  memory: 85, // %
  disk: 90,   // %
};

/**
 * Vérifie si une métrique dépasse un seuil d'alerte
 * @param {string} metricType - Type de métrique (cpu, memory, disk)
 * @param {number} value - Valeur actuelle de la métrique
 * @returns {boolean} - True si alerte nécessaire
 */
function isAboveThreshold(metricType, value) {
  return value > ALERT_THRESHOLDS[metricType];
}

/**
 * Affiche une alerte dans l'interface
 * @param {string} type - Type d'alerte (warning, danger)
 * @param {string} message - Message de l'alerte
 */
function displayAlert(type, message) {
  const alertsList = document.getElementById('alerts-list');
  const now = new Date();
  const timeString = now.toLocaleTimeString('fr-FR');

  const alertElement = document.createElement('div');
  alertElement.className = `alert ${type}`;
  alertElement.innerHTML = `
    <span>${message}</span>
    <span class="time">${timeString}</span>
  `;

  // Supprime le message "Aucune alerte active" s'il existe
  const noAlerts = alertsList.querySelector('.no-alerts');
  if (noAlerts) {
    noAlerts.remove();
  }

  alertsList.appendChild(alertElement);
}

/**
 * Vérifie toutes les métriques et affiche les alertes si nécessaire
 * @param {Object} metrics - Données des métriques
 */
function checkAlerts(metrics) {
  // Réinitialise les alertes à chaque vérification
  const alertsList = document.getElementById('alerts-list');
  alertsList.innerHTML = '';

  let hasAlerts = false;

  // Vérifie le CPU
  if (metrics.cpu && isAboveThreshold('cpu', metrics.cpu.usage)) {
    displayAlert('warning', `⚠️ Utilisation CPU élevée : ${metrics.cpu.usage.toFixed(1)}%`);
    hasAlerts = true;
  }

  // Vérifie la mémoire
  if (metrics.memory) {
    const memUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
    if (isAboveThreshold('memory', memUsagePercent)) {
      displayAlert('warning', `⚠️ Utilisation mémoire élevée : ${memUsagePercent.toFixed(1)}%`);
      hasAlerts = true;
    }
  }

  // Vérifie le disque
  if (metrics.disk) {
    const diskUsagePercent = (metrics.disk.used / metrics.disk.total) * 100;
    if (isAboveThreshold('disk', diskUsagePercent)) {
      displayAlert('danger', `🚨 Espace disque critique : ${diskUsagePercent.toFixed(1)}% utilisé`);
      hasAlerts = true;
    }
  }

  // Si aucune alerte, affiche le message par défaut
  if (!hasAlerts) {
    alertsList.innerHTML = '<p class="no-alerts">Aucune alerte active.</p>';
  }
}

// Exporter les fonctions pour les utiliser dans d'autres modules
window.vpsMonitoringAlerts = {
  checkAlerts,
  displayAlert,
  isAboveThreshold,
};

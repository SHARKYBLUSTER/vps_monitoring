/**
 * Module pour la gestion des alertes
 * Projet : VPS Monitoring Dashboard
 * 
 * NOTE : Les seuils d'alerte sont définis côté serveur et passés via window.ALERT_THRESHOLDS.
 * Par défaut : CPU > 80%, RAM > 85%, Disque > 90%
 */

// Seuils d'alerte par défaut (peuvent être écrasés par le backend)
const DEFAULT_THRESHOLDS = {
  cpu: 80,
  memory: 85,
  disk: 90,
};

/**
 * Vérifie si une métrique dépasse un seuil d'alerte
 * @param {string} metricType - Type de métrique (cpu, memory, disk)
 * @param {number} value - Valeur actuelle de la métrique
 * @returns {boolean} - True si alerte nécessaire
 */
function isAboveThreshold(metricType, value) {
  // Utiliser les seuils centralisés depuis le backend ou les valeurs par défaut
  const thresholds = window.ALERT_THRESHOLDS || DEFAULT_THRESHOLDS;
  return value > thresholds[metricType];
}

/**
 * Vérifie si une métrique est critique (seuil très élevé)
 * @param {string} metricType - Type de métrique (cpu, memory, disk)
 * @param {number} value - Valeur actuelle de la métrique
 * @returns {boolean} - True si critique
 */
function isCritical(metricType, value) {
  const criticalThresholds = {
    cpu: 95,
    memory: 95,
    disk: 98,
  };
  return value > criticalThresholds[metricType];
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
  if (metrics.cpu) {
    const cpuUsage = metrics.cpu.usage;
    if (isAboveThreshold('cpu', cpuUsage)) {
      const alertType = isCritical('cpu', cpuUsage) ? 'danger' : 'warning';
      const alertIcon = isCritical('cpu', cpuUsage) ? '🚨' : '⚠️';
      const alertMessage = isCritical('cpu', cpuUsage) 
        ? `CPU critique : ${cpuUsage.toFixed(1)}%` 
        : `Utilisation CPU élevée : ${cpuUsage.toFixed(1)}%`;
      displayAlert(alertType, `${alertIcon} ${alertMessage}`);
      hasAlerts = true;
    }
  }

  // Vérifie la mémoire
  if (metrics.memory) {
    const memUsagePercent = metrics.memory.usagePercent || (metrics.memory.used / metrics.memory.total) * 100;
    if (isAboveThreshold('memory', memUsagePercent)) {
      const alertType = isCritical('memory', memUsagePercent) ? 'danger' : 'warning';
      const alertIcon = isCritical('memory', memUsagePercent) ? '🚨' : '⚠️';
      const alertMessage = isCritical('memory', memUsagePercent) 
        ? `Mémoire critique : ${memUsagePercent.toFixed(1)}%` 
        : `Utilisation mémoire élevée : ${memUsagePercent.toFixed(1)}%`;
      displayAlert(alertType, `${alertIcon} ${alertMessage}`);
      hasAlerts = true;
    }
  }

  // Vérifie le disque
  if (metrics.disk) {
    const diskUsagePercent = metrics.disk.usagePercent || (metrics.disk.used / metrics.disk.total) * 100;
    if (isAboveThreshold('disk', diskUsagePercent)) {
      const alertType = isCritical('disk', diskUsagePercent) ? 'danger' : 'warning';
      const alertIcon = isCritical('disk', diskUsagePercent) ? '🚨' : '⚠️';
      const alertMessage = isCritical('disk', diskUsagePercent) 
        ? `Espace disque critique : ${diskUsagePercent.toFixed(1)}% utilisé` 
        : `Espace disque élevé : ${diskUsagePercent.toFixed(1)}% utilisé`;
      displayAlert(alertType, `${alertIcon} ${alertMessage}`);
      hasAlerts = true;
    }
  }

  // Si aucune alerte, affiche le message par défaut
  if (!hasAlerts) {
    alertsList.innerHTML = '<p class="no-alerts">✅ Aucune alerte active.</p>';
  }
}

/**
 * Récupère les alertes depuis l'API
 * @returns {Promise<Array>} - Liste des alertes
 */
async function fetchAlerts() {
  try {
    const response = await fetch('/api/alerts');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    return [];
  }
}

// Exporter les fonctions pour les utiliser dans d'autres modules
window.vpsMonitoringAlerts = {
  checkAlerts,
  displayAlert,
  isAboveThreshold,
  isCritical,
  DEFAULT_THRESHOLDS,
  fetchAlerts,
};

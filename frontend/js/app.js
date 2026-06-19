/**
 * Point d'entrée principal du frontend (Vanilla JS)
 * Projet : VPS Monitoring Dashboard
 * 
 * NOTE : Les métriques sont maintenant générées côté serveur et intégrées directement dans le HTML.
 * Ce fichier gère uniquement l'affichage dynamique et les interactions utilisateur.
 */

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ VPS Monitoring Dashboard initialisé');
  
  // Mettre à jour l'horodatage
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
  
  // Vérifier les alertes initiales (les données sont déjà dans le HTML)
  const metrics = {
    cpu: {
      usage: parseFloat(document.getElementById('cpu-usage').textContent.replace('%', '')) || 0,
    },
    memory: {
      usagePercent: parseFloat(document.getElementById('mem-usage').textContent.replace('%', '')) || 0,
    },
    disk: {
      usagePercent: parseFloat(document.getElementById('disk-usage').textContent.replace('%', '')) || 0,
    },
  };
  
  // Mettre à jour les barres de progression
  updateProgressBars(metrics);
  
  // Vérifier les alertes
  checkAlerts(metrics);
});

/**
 * Met à jour les barres de progression pour CPU, RAM et Disque
 * @param {Object} metrics - Données des métriques
 */
function updateProgressBars(metrics) {
  // Barre de progression CPU
  const cpuProgress = document.getElementById('cpu-progress');
  if (cpuProgress && metrics.cpu) {
    cpuProgress.style.width = `${metrics.cpu.usage}%`;
    cpuProgress.setAttribute('data-tooltip', `Utilisation CPU: ${metrics.cpu.usage}%`);
  }
  
  // Barre de progression RAM
  const memProgress = document.getElementById('mem-progress');
  if (memProgress && metrics.memory) {
    memProgress.style.width = `${metrics.memory.usagePercent}%`;
    memProgress.setAttribute('data-tooltip', `Utilisation RAM: ${metrics.memory.usagePercent}%`);
  }
  
  // Barre de progression Disque
  const diskProgress = document.getElementById('disk-progress');
  if (diskProgress && metrics.disk) {
    diskProgress.style.width = `${metrics.disk.usagePercent}%`;
    diskProgress.setAttribute('data-tooltip', `Utilisation Disque: ${metrics.disk.usagePercent}%`);
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
  checkAlerts,
  showError,
  updateTimestamp,
  updateProgressBars,
};

/**
 * Module pour la gestion des métriques
 * Projet : VPS Monitoring Dashboard
 * 
 * Ce module fournit des utilitaires pour le traitement des métriques.
 * Les métriques sont récupérées via l'API REST (/api/metrics).
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

// Fonction pour récupérer les métriques depuis l'API
async function fetchMetrics() {
  try {
    const response = await fetch('/api/metrics');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return null;
  }
}

// Fonction pour récupérer les métriques réseau depuis l'API
async function fetchNetworkMetrics() {
  try {
    const response = await fetch('/api/network');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques réseau:', error);
    return null;
  }
}

// Fonction pour récupérer les alertes depuis l'API
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
window.vpsMonitoringMetrics = {
  formatNumber,
  formatPercentage,
  formatBytes,
  fetchMetrics,
  fetchNetworkMetrics,
  fetchAlerts,
};

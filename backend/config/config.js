/**
 * Configuration du projet VPS Monitoring
 */

module.exports = {
  // Port du serveur
  port: process.env.PORT || 3000,

  // Configuration de la base de données (à venir)
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vps_monitoring',
  },

  // Seuils pour les alertes (en %)
  alerts: {
    cpuThreshold: 80,    // Alerte si CPU > 80%
    memoryThreshold: 85, // Alerte si RAM > 85%
    diskThreshold: 90,   // Alerte si disque > 90%
  },

  // Intervalle de collecte des métriques (en ms)
  metricsInterval: 5000, // 5 secondes

  // Rétention des données (en mois)
  dataRetentionMonths: 3, // 3 mois par défaut

  // Décalage horaire local (en heures par rapport à UTC, peut être négatif)
  timezoneOffset: 0, // 0 = UTC, +2 = UTC+2, -5 = UTC-5, etc.

  // Affichage de la section Docker Engine
  showDockerSection: true, // true = afficher, false = masquer

  // Logs
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * Service de stockage SQLite pour VPS Monitoring
 * Remplace le stockage JSON temporaire.
 *
 * Utilise better-sqlite3 pour des performances optimales.
 */
const Database = require('better-sqlite3');
const path = require('path');

// Chemin vers la base de données
const DB_PATH = path.join(__dirname, '../../data/vps_monitoring.db');
const db = new Database(DB_PATH);

// Initialiser les tables si elles n'existent pas
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      cpu_usage REAL NOT NULL,
      cpu_cores INTEGER NOT NULL,
      cpu_model TEXT,
      memory_used INTEGER NOT NULL,
      memory_total INTEGER NOT NULL,
      memory_usage_percent REAL NOT NULL,
      disk_used INTEGER NOT NULL,
      disk_total INTEGER NOT NULL,
      disk_usage_percent REAL NOT NULL,
      network_download REAL NOT NULL,
      network_upload REAL NOT NULL,
      network_status TEXT,
      network_interface TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      metric TEXT NOT NULL,
      message TEXT NOT NULL,
      value REAL NOT NULL,
      threshold REAL NOT NULL,
      resolved BOOLEAN DEFAULT 0,
      resolved_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Index pour les requêtes fréquentes
    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  console.log('✅ Base de données SQLite initialisée');
}

// ====================
// Fonctions de Métriques
// ====================

/**
 * Insère des métriques dans la base de données
 * @param {Object} metrics - Objet contenant toutes les métriques
 * @returns {number} - ID de l'entrée insérée
 */
function insertMetrics(metrics) {
  const stmt = db.prepare(`
    INSERT INTO metrics (
      cpu_usage, cpu_cores, cpu_model,
      memory_used, memory_total, memory_usage_percent,
      disk_used, disk_total, disk_usage_percent,
      network_download, network_upload, network_status, network_interface
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    metrics.cpu.usage,
    metrics.cpu.cores,
    metrics.cpu.model,
    metrics.memory.used,
    metrics.memory.total,
    metrics.memory.usagePercent,
    metrics.disk.used,
    metrics.disk.total,
    metrics.disk.usagePercent,
    metrics.network.download,
    metrics.network.upload,
    metrics.network.status,
    metrics.network.interface
  );

  return info.lastInsertRowid;
}

/**
 * Récupère l'historique des métriques
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {string} options.from - Date de début (ISO string)
 * @param {string} options.to - Date de fin (ISO string)
 * @returns {Array} - Liste des entrées d'historique
 */
function getMetricsHistory({ limit = 100, from = null, to = null } = {}) {
  let query = 'SELECT * FROM metrics';
  const params = [];

  if (from || to) {
    query += ' WHERE';
    if (from) {
      query += ' timestamp >= ?';
      params.push(from);
    }
    if (from && to) {
      query += ' AND';
    }
    if (to) {
      query += ' timestamp <= ?';
      params.push(to);
    }
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
  } else {
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);
  }

  return db.prepare(query).all(...params);
}

/**
 * Récupère les données pour un graphique
 * @param {string} metric - Métrique (cpu, memory, disk)
 * @param {number} limit - Nombre de points à retourner
 * @returns {Array} - Liste des valeurs avec timestamps
 */
function getMetricChartData(metric, limit = 50) {
  const columnMap = {
    cpu: 'cpu_usage',
    memory: 'memory_usage_percent',
    disk: 'disk_usage_percent',
  };

  if (!columnMap[metric]) {
    return [];
  }

  const query = `
    SELECT timestamp, ${columnMap[metric]} as value
    FROM metrics
    ORDER BY timestamp DESC
    LIMIT ?
  `;

  return db.prepare(query).all([limit]).reverse();
}

// ====================
// Fonctions d'Alerte
// ====================

/**
 * Insère une alerte dans l'historique
 * @param {Object} alert - Alerte à sauvegarder
 * @returns {number} - ID de l'entrée insérée
 */
function insertAlert(alert) {
  const stmt = db.prepare(`
    INSERT INTO alerts
    (type, metric, message, value, threshold)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    alert.type,
    alert.metric,
    alert.message,
    alert.value,
    alert.threshold
  );

  return info.lastInsertRowid;
}

/**
 * Récupère l'historique des alertes
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {boolean} options.unresolvedOnly - Ne retourner que les alertes non résolues
 * @returns {Array} - Liste des alertes historiques
 */
function getAlertsHistory({ limit = 100, unresolvedOnly = false } = {}) {
  let query = 'SELECT * FROM alerts';
  const params = [];

  if (unresolvedOnly) {
    query += ' WHERE resolved = 0';
  }
  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

/**
 * Marque une alerte comme résolue
 * @param {number} alertId - ID de l'alerte
 * @returns {boolean} - True si l'alerte a été mise à jour
 */
function resolveAlert(alertId) {
  const stmt = db.prepare(`
    UPDATE alerts
    SET resolved = 1, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  return stmt.run(alertId).changes > 0;
}

/**
 * Nettoie les anciennes données
 * @param {number} days - Nombre de jours à conserver
 * @returns {number} - Nombre de lignes supprimées
 */
function cleanupOldData(days = 30) {
  const deleteMetrics = db.prepare(`
    DELETE FROM metrics
    WHERE timestamp < datetime('now', ?)
  `);

  const deleteAlerts = db.prepare(`
    DELETE FROM alerts
    WHERE timestamp < datetime('now', ?)
  `);

  const changes = deleteMetrics.run(`-${days} days`).changes;
  changes += deleteAlerts.run(`-${days} days`).changes;

  return changes;
}

// ====================
// Fonctions Utilitaires
// ====================

/**
 * Nettoie spécifiquement l'historique réseau
 * @param {number} days - Nombre de jours à conserver (par défaut 91)
 * @returns {number} - Nombre de lignes supprimées
 */
function cleanupNetworkHistory(days = 91) {
  const stmt = db.prepare(`
    DELETE FROM metrics
    WHERE timestamp < datetime('now', ?)
  `);
  return stmt.run(`-${days} days`).changes;
}

/**
 * Récupère l'historique réseau avec agrégation par période
 * @param {Object} options - Options de filtrage
 * @param {string} options.period - Période (day, week, month, quarter)
 * @returns {Object} - Données agrégées pour Chart.js
 */
function getNetworkHistory(options = {}) {
  const { period = 'day' } = options;
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  }

  const query = `
    SELECT 
      strftime('%Y-%m-%d', timestamp) as date,
      AVG(network_download) as download,
      AVG(network_upload) as upload,
      COUNT(*) as count
    FROM metrics
    WHERE timestamp >= ?
    GROUP BY date
    ORDER BY date
  `;

  const rows = db.prepare(query).all(startDate.toISOString());

  const labels = rows.map(row => row.date);
  const download = rows.map(row => row.download);
  const upload = rows.map(row => row.upload);

  return { labels, download, upload };
}

/**
 * Fermer la base de données
 */
function closeDatabase() {
  db.close();
  console.log('✅ Base de données SQLite fermée');
}

// Initialiser la base de données au démarrage
initializeDatabase();

module.exports = {
  // Métriques
  insertMetrics,
  getMetricsHistory,
  getMetricChartData,
  // Alertes
  insertAlert,
  getAlertsHistory,
  resolveAlert,
  // Nettoyage
  cleanupOldData,
  cleanupNetworkHistory,
  getNetworkHistory,
  // Utilitaire
  closeDatabase,
};

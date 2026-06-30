/**
 * Service de stockage SQLite pour VPS Monitoring
 * Remplace le stockage JSON temporaire.
 *
 * Utilise better-sqlite3 pour des performances optimales.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const DB_PATH = path.join(__dirname, '../../data/vps_monitoring.db');

// Créer le dossier data/ s'il n'existe pas
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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

    -- Tables Docker
    CREATE TABLE IF NOT EXISTS docker_containers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      container_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      image TEXT,
      state TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      cpu_percent REAL,
      memory_used INTEGER,
      memory_limit INTEGER,
      memory_percent REAL,
      network_rx INTEGER,
      network_tx INTEGER,
      disk_read INTEGER,
      disk_write INTEGER,
      is_running BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS docker_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT NOT NULL,
      container_id TEXT NOT NULL,
      container_name TEXT NOT NULL,
      message TEXT NOT NULL,
      value REAL,
      threshold REAL,
      severity TEXT DEFAULT 'warning',
      resolved BOOLEAN DEFAULT 0,
      resolved_at DATETIME
    );

    -- Index pour les requêtes fréquentes
    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_docker_containers_id ON docker_containers(container_id);
    CREATE INDEX IF NOT EXISTS idx_docker_containers_timestamp ON docker_containers(timestamp);
    CREATE INDEX IF NOT EXISTS idx_docker_alerts_timestamp ON docker_alerts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_docker_alerts_resolved ON docker_alerts(resolved);
    CREATE INDEX IF NOT EXISTS idx_docker_alerts_container ON docker_alerts(container_id);
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
 * Récupère les données pour un graphique avec agrégation par période
 * @param {string} metric - Métrique (cpu, memory, disk)
 * @param {Object} options - Options
 * @param {number} options.limit - Nombre de points à retourner
 * @param {string} options.period - Période (day, week, month, quarter)
 * @returns {Array} - Liste des valeurs avec timestamps ou agrégées
 */
function getMetricChartData(metric, options = {}) {
  const { limit = 500, period = 'day' } = options;
  const columnMap = {
    cpu: 'cpu_usage',
    memory: 'memory_usage_percent',
    disk: 'disk_usage_percent',
  };

  if (!columnMap[metric]) {
    return [];
  }

  const now = new Date();
  let startDate;

  // Calcule la date de début en UTC pour éviter les décalages horaires
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  switch (period) {
    case 'day':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 7, 0, 0, 0));
      break;
    case 'month':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDate, 0, 0, 0));
      break;
    case 'quarter':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 3, utcDate, 0, 0, 0));
      break;
    default:
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1, 0, 0, 0));
  }

  // Formater la date au format SQLite DATETIME (YYYY-MM-DD HH:MM:SS) en UTC
  const formatDateForSQLite = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };

  const startDateStr = formatDateForSQLite(startDate);

  // Pour le filtre "jour", on agrège par tranches de 30 minutes avec MAX (48 points = 24h)
  // Pour semaine/mois, on agrège par jour avec la valeur MAX
  if (period === 'day') {
    const query = `
      SELECT 
        datetime(CAST(strftime('%s', timestamp) / 1800 AS INTEGER) * 1800, 'unixepoch') as timestamp,
        MAX(${columnMap[metric]}) as value
      FROM metrics
      WHERE timestamp >= datetime(?, 'utc')
      GROUP BY CAST(strftime('%s', timestamp) / 1800 AS INTEGER)
      ORDER BY timestamp
      LIMIT ?
    `;
    return db.prepare(query).all(startDateStr, 48);
  } else {
    // Pour semaine/mois : regrouper par jour et prendre le MAX
    const groupFormat = "strftime('%Y-%m-%d', timestamp)";
    const query = `
      SELECT 
        ${groupFormat} as label,
        MAX(${columnMap[metric]}) as value
      FROM metrics
      WHERE timestamp >= datetime(?, 'utc')
      GROUP BY ${groupFormat}
      ORDER BY label
      LIMIT ?
    `;
    return db.prepare(query).all(startDateStr, limit);
  }
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
  let changes = 0;
  
  console.log(`🔄 cleanupOldData appelé avec days=${days}`);
  
  // Si days est négatif et très grand, on interprète ça comme "tout supprimer"
  const deleteAll = days < 0 && Math.abs(days) > 3650;
  console.log(`🔄 deleteAll=${deleteAll} (days < 0: ${days < 0}, Math.abs(days) > 3650: ${Math.abs(days) > 3650})`);
  
  try {
    if (deleteAll) {
      const deleteMetrics = db.prepare(`DELETE FROM metrics`);
      changes += deleteMetrics.run().changes;
    } else {
      const deleteMetrics = db.prepare(`DELETE FROM metrics WHERE timestamp < datetime('now', ?)`);
      changes += deleteMetrics.run(`-${days} days`).changes;
    }
  } catch (error) {
    console.warn('Table metrics non trouvée:', error.message);
  }

  try {
    if (deleteAll) {
      const deleteAlerts = db.prepare(`DELETE FROM alerts`);
      changes += deleteAlerts.run().changes;
    } else {
      const deleteAlerts = db.prepare(`DELETE FROM alerts WHERE timestamp < datetime('now', ?)`);
      changes += deleteAlerts.run(`-${days} days`).changes;
    }
  } catch (error) {
    console.warn('Table alerts non trouvée:', error.message);
  }

  try {
    if (deleteAll) {
      const deleteDockerContainers = db.prepare(`DELETE FROM docker_containers`);
      changes += deleteDockerContainers.run().changes;
    } else {
      const deleteDockerContainers = db.prepare(`DELETE FROM docker_containers WHERE timestamp < datetime('now', ?)`);
      changes += deleteDockerContainers.run(`-${days} days`).changes;
    }
  } catch (error) {
    console.warn('Table docker_containers non trouvée:', error.message);
  }

  try {
    if (deleteAll) {
      const deleteDockerAlerts = db.prepare(`DELETE FROM docker_alerts`);
      changes += deleteDockerAlerts.run().changes;
    } else {
      const deleteDockerAlerts = db.prepare(`DELETE FROM docker_alerts WHERE timestamp < datetime('now', ?)`);
      changes += deleteDockerAlerts.run(`-${days} days`).changes;
    }
  } catch (error) {
    console.warn('Table docker_alerts non trouvée:', error.message);
  }

  // Si on supprime tout, exécuter VACUUM pour réduire la taille du fichier
  if (deleteAll) {
    try {
      db.exec('VACUUM;');
      console.log('✅ VACUUM exécuté - base SQLite nettoyée');
    } catch (error) {
      console.warn('⚠️ Impossible d\'exécuter VACUUM:', error.message);
    }
  }

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

  // Calcule la date de début en UTC pour éviter les décalages horaires
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  switch (period) {
    case 'day':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 7, 0, 0, 0));
      break;
    case 'month':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDate, 0, 0, 0));
      break;
    case 'quarter':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 3, utcDate, 0, 0, 0));
      break;
    default:
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1, 0, 0, 0));
  }

  // Formater la date au format SQLite DATETIME (YYYY-MM-DD HH:MM:SS) en UTC
  const formatDateForSQLite = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };

  const startDateStr = formatDateForSQLite(startDate);

  let query, groupBy;
  
  // Pour la période 'day', on regroupe par tranches de 30 minutes
  if (period === 'day') {
    query = `
      SELECT 
        datetime(CAST(strftime('%s', timestamp) / 1800 AS INTEGER) * 1800, 'unixepoch') as date,
        AVG(network_download) as download,
        AVG(network_upload) as upload,
        COUNT(*) as count
      FROM metrics
      WHERE timestamp >= datetime(?, 'utc')
      GROUP BY CAST(strftime('%s', timestamp) / 1800 AS INTEGER)
      ORDER BY date
      LIMIT 48
    `;
  } else {
    // Pour les autres périodes, on regroupe par jour
    groupBy = "strftime('%Y-%m-%d', timestamp)";
    query = `
      SELECT 
        ${groupBy} as date,
        AVG(network_download) as download,
        AVG(network_upload) as upload,
        COUNT(*) as count
      FROM metrics
      WHERE timestamp >= datetime(?, 'utc')
      GROUP BY ${groupBy}
      ORDER BY date
    `;
  }

  const rows = db.prepare(query).all(startDateStr);

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

// ====================
// Fonctions Docker
// ====================

/**
 * Insère un conteneur Docker dans l'historique
 * @param {Object} containerData - Données du conteneur
 * @returns {number} - ID de l'entrée insérée
 */
function insertDockerContainer(containerData) {
  const stmt = db.prepare(`
    INSERT INTO docker_containers (
      container_id, name, image, state, cpu_percent, 
      memory_used, memory_limit, memory_percent, 
      network_rx, network_tx, disk_read, disk_write, is_running
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    containerData.container_id,
    containerData.name,
    containerData.image,
    containerData.state,
    containerData.cpu_percent,
    containerData.memory_used,
    containerData.memory_limit,
    containerData.memory_percent,
    containerData.network_rx,
    containerData.network_tx,
    containerData.disk_read,
    containerData.disk_write,
    containerData.is_running
  );

  return info.lastInsertRowid;
}

/**
 * Récupère un conteneur Docker par son ID
 * @param {string} containerId - ID du conteneur
 * @returns {Object|null} - Données du conteneur
 */
function getDockerContainer(containerId) {
  const stmt = db.prepare(`
    SELECT * FROM docker_containers WHERE container_id = ?
  `);
  return stmt.get(containerId) || null;
}

/**
 * Met à jour les stats d'un conteneur Docker
 * @param {string} containerId - ID du conteneur
 * @param {Object} stats - Nouvelles stats
 * @returns {number} - Nombre de lignes mises à jour
 */
function updateDockerStats(containerId, stats) {
  const stmt = db.prepare(`
    UPDATE docker_containers SET
      name = ?,
      state = ?,
      timestamp = CURRENT_TIMESTAMP,
      cpu_percent = ?,
      memory_used = ?,
      memory_limit = ?,
      memory_percent = ?,
      network_rx = ?,
      network_tx = ?,
      disk_read = ?,
      disk_write = ?,
      is_running = ?
    WHERE container_id = ?
  `);

  const info = stmt.run(
    stats.name,
    stats.state,
    stats.cpu_percent,
    stats.memory_used,
    stats.memory_limit,
    stats.memory_percent,
    stats.network_rx,
    stats.network_tx,
    stats.disk_read,
    stats.disk_write,
    stats.is_running,
    containerId
  );

  return info.changes;
}

/**
 * Récupère l'historique des conteneurs Docker
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {string} options.containerId - Filtrer par ID de conteneur
 * @param {string} options.from - Date de début (ISO string)
 * @param {string} options.to - Date de fin (ISO string)
 * @returns {Array} - Liste des entrées d'historique
 */
function getDockerHistory({ limit = 100, containerId = null, from = null, to = null } = {}) {
  let query = 'SELECT * FROM docker_containers';
  const params = [];

  if (containerId || from || to) {
    query += ' WHERE';
    let conditions = [];
    
    if (containerId) {
      conditions.push(' container_id = ?');
      params.push(containerId);
    }
    
    if (from) {
      conditions.push(' timestamp >= ?');
      params.push(from);
    }
    
    if (to) {
      conditions.push(' timestamp <= ?');
      params.push(to);
    }
    
    query += conditions.join(' AND');
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

/**
 * Récupère l'historique des stats pour un conteneur (pour graphiques)
 * @param {string} containerId - ID du conteneur
 * @param {Object} options - Options
 * @param {number} options.limit - Nombre de points à retourner
 * @param {string} options.period - Période (day, week, month, quarter)
 * @returns {Array} - Liste des valeurs avec timestamps
 */
function getDockerContainerChartData(containerId, options = {}) {
  const { limit = 500, period = 'day' } = options;
  
  const now = new Date();
  let startDate;

  // Calcule la date de début en UTC pour éviter les décalages horaires
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();

  switch (period) {
    case 'day':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 7, 0, 0, 0));
      break;
    case 'month':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDate, 0, 0, 0));
      break;
    case 'quarter':
      startDate = new Date(Date.UTC(utcYear, utcMonth - 3, utcDate, 0, 0, 0));
      break;
    default:
      startDate = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1, 0, 0, 0));
  }

  // Formater la date au format SQLite DATETIME (YYYY-MM-DD HH:MM:SS) en UTC
  const formatDateForSQLite = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };

  const startDateStr = formatDateForSQLite(startDate);

  if (period === 'day') {
    const query = `
      SELECT timestamp, cpu_percent as cpu, memory_percent as memory
      FROM docker_containers
      WHERE container_id = ? AND timestamp >= datetime(?, 'utc')
      ORDER BY timestamp
      LIMIT ?
    `;
    return db.prepare(query).all(containerId, startDateStr, limit);
  } else {
    const groupFormat = "strftime('%Y-%m-%d', timestamp)";
    const query = `
      SELECT 
        ${groupFormat} as label,
        AVG(cpu_percent) as cpu,
        AVG(memory_percent) as memory
      FROM docker_containers
      WHERE container_id = ? AND timestamp >= datetime(?, 'utc')
      GROUP BY ${groupFormat}
      ORDER BY label
      LIMIT ?
    `;
    return db.prepare(query).all(containerId, startDateStr, limit);
  }
}

/**
 * Insère une alerte Docker
 * @param {Object} alert - Alerte à sauvegarder
 * @returns {number} - ID de l'entrée insérée
 */
function insertDockerAlert(alert) {
  const stmt = db.prepare(`
    INSERT INTO docker_alerts
    (type, container_id, container_name, message, value, threshold, severity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    alert.type,
    alert.container_id,
    alert.container_name,
    alert.message,
    alert.value,
    alert.threshold,
    alert.severity
  );

  return info.lastInsertRowid;
}

/**
 * Récupère l'historique des alertes Docker
 * @param {Object} options - Options de filtrage
 * @param {number} options.limit - Nombre maximum de résultats
 * @param {boolean} options.unresolvedOnly - Ne retourner que les alertes non résolues
 * @param {string} options.containerId - Filtrer par ID de conteneur
 * @returns {Array} - Liste des alertes historiques
 */
function getDockerAlertsHistory({ limit = 100, unresolvedOnly = false, containerId = null } = {}) {
  let query = 'SELECT * FROM docker_alerts';
  const params = [];

  if (unresolvedOnly || containerId) {
    query += ' WHERE';
    let conditions = [];
    
    if (unresolvedOnly) {
      conditions.push(' resolved = 0');
    }
    
    if (containerId) {
      conditions.push(' container_id = ?');
      params.push(containerId);
    }
    
    query += conditions.join(' AND');
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params);
}

/**
 * Marque une alerte Docker comme résolue
 * @param {number} alertId - ID de l'alerte
 * @returns {boolean} - True si l'alerte a été mise à jour
 */
function resolveDockerAlert(alertId) {
  const stmt = db.prepare(`
    UPDATE docker_alerts
    SET resolved = 1, resolved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  return stmt.run(alertId).changes > 0;
}

/**
 * Nettoie les anciennes données Docker
 * @param {number} days - Nombre de jours à conserver
 * @returns {number} - Nombre de lignes supprimées
 */
function cleanupOldDockerData(days = 91) {
  const deleteContainers = db.prepare(`
    DELETE FROM docker_containers
    WHERE timestamp < datetime('now', ?)
  `);

  const deleteAlerts = db.prepare(`
    DELETE FROM docker_alerts
    WHERE timestamp < datetime('now', ?)
  `);

  const changes = deleteContainers.run(`-${days} days`).changes;
  changes += deleteAlerts.run(`-${days} days`).changes;

  return changes;
}

// Initialiser la base de données au démarrage
initializeDatabase();

module.exports = {
  // Métriques
  insertMetrics,
  getMetricsHistory,
  getMetricChartData,
  // Alertes (système)
  insertAlert,
  getAlertsHistory,
  resolveAlert,
  // Nettoyage
  cleanupOldData,
  cleanupNetworkHistory,
  getNetworkHistory,
  // Docker
  insertDockerContainer,
  getDockerContainer,
  updateDockerStats,
  getDockerHistory,
  getDockerContainerChartData,
  insertDockerAlert,
  getDockerAlertsHistory,
  resolveDockerAlert,
  cleanupOldDockerData,
  // Utilitaire
  closeDatabase,
};

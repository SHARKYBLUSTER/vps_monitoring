/**
 * Service de surveillance Docker
 * Projet : VPS Monitoring Dashboard
 * 
 * Utilise dockerode pour les actions (start/stop/restart) et
 * l'API Docker CLI pour les stats (plus fiable).
 * Gère la récupération des conteneurs, leurs stats, et les actions de contrôle.
 */

const Docker = require('dockerode');
const { exec } = require('child_process');
const db = require('./db-sqlite');
const config = require('../config/config');

// Initialiser le client Docker
let docker;

/**
 * Initialise le client Docker
 */
function initializeDockerClient() {
  try {
    docker = new Docker();
    console.log('✅ Client Docker initialisé');
    return true;
  } catch (error) {
    console.error('❌ Impossible d\'initialiser le client Docker:', error.message);
    docker = null;
    return false;
  }
}

/**
 * Vérifie si Docker est disponible
 * @returns {Promise<Object>} - Statut de Docker
 */
async function checkDockerStatus() {
  if (!docker) {
    initializeDockerClient();
  }

  if (!docker) {
    return { available: false, error: 'Client Docker non initialisé' };
  }

  try {
    const info = await docker.info();
    return {
      available: true,
      version: info.ServerVersion,
      containers: info.Containers,
      containersRunning: info.ContainersRunning,
      containersPaused: info.ContainersPaused,
      containersStopped: info.ContainersStopped,
      images: info.Images,
      os: info.OperatingSystem,
      architecture: info.Architecture,
      cpus: info.NCPU,
      memory: info.MemTotal,
      dockerRootDir: info.DockerRootDir,
      uptime: info.Uptime
    };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut Docker:', error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Récupère la liste de tous les conteneurs
 * @param {boolean} all - Inclure les conteneurs arrêtés (default: true)
 * @returns {Promise<Array>} - Liste des conteneurs
 */
async function getContainers(all = true) {
  if (!docker) {
    if (!initializeDockerClient()) {
      return [];
    }
  }

  try {
    const containers = await docker.listContainers({ all: all });
    
    return containers.map(container => {
      const name = container.Names[0] || '';
      return {
        id: container.Id,
        shortId: container.Id.substring(0, 12),
        name: name.startsWith('/') ? name.substring(1) : name,
        image: container.Image,
        imageTag: container.Image ? container.Image.split(':')[1] || 'latest' : '',
        state: container.State,
        status: container.Status,
        created: container.Created,
        ports: container.Ports || [],
        command: container.Command,
        isRunning: container.State === 'running'
      };
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conteneurs:', error.message);
    return [];
  }
}

/**
 * Récupère les stats en temps réel d'un conteneur
 * @param {string} containerId - ID du conteneur
 * @returns {Promise<Object|null>} - Stats du conteneur
 */
async function getContainerStats(containerId) {
  if (!docker) {
    if (!initializeDockerClient()) {
      return null;
    }
  }

  try {
    const container = docker.getContainer(containerId);
    
    // Essayer d'abord avec stream: false pour obtenir les dernières stats directement
    try {
      const statsData = await container.stats({ stream: false });
      const stat = parseDockerStats(statsData);
      if (stat) return stat;
    } catch (e) {
      console.warn('⚠️ Impossible de récupérer les stats sans stream, essai avec stream...');
    }
    
    // Si ça ne fonctionne pas, essayer avec stream: true
    const statsStream = await container.stats({ stream: true });
    
    // Collecter les stats pendant 2 secondes max
    const stats = [];
    const timeout = setTimeout(() => {
      statsStream.destroy();
    }, 2500);

    return new Promise((resolve) => {
      statsStream.on('data', (chunk) => {
        try {
          const data = JSON.parse(chunk.toString());
          stats.push(data);
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      });

      statsStream.on('end', () => {
        clearTimeout(timeout);
        if (stats.length === 0) {
          resolve(null);
          return;
        }
        
        // Prendre la dernière mesure
        const lastStat = stats[stats.length - 1];
        const stat = parseDockerStats(lastStat);
        resolve(stat);
      });

      statsStream.on('error', (error) => {
        clearTimeout(timeout);
        console.error('❌ Erreur lors de la récupération des stats (stream):', error.message);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats du conteneur:', error.message);
    return null;
  }
}

/**
 * Parse les stats brutes Docker
 * @param {Object} rawStat - Stat brute de Docker
 * @returns {Object} - Stats parsées
 */
function parseDockerStats(rawStat) {
  if (!rawStat || !rawStat.read) return null;
  
  const stat = rawStat.read || rawStat;
  const cpuStats = stat.cpu_stats;
  const precpuStats = stat.precpu_stats;
  const memoryStats = stat.memory_stats;
  const blkioStats = stat.blkio_stats;
  const networkStats = stat.networks || {};
  
  // Calcul CPU %
  let cpuPercent = 0;
  if (cpuStats && cpuStats.cpu_usage && cpuStats.system_cpu_usage) {
    const cpuDelta = cpuStats.cpu_usage.total_usage - (precpuStats ? precpuStats.cpu_usage.total_usage : 0);
    const systemDelta = cpuStats.system_cpu_usage - (precpuStats ? precpuStats.system_cpu_usage : 0);
    const cpuShares = cpuStats.online_cpus || 1;
    
    if (systemDelta > 0 && cpuDelta > 0) {
      cpuPercent = (cpuDelta / systemDelta) * 100 * cpuShares;
    }
  }
  
  // Mémoire
  const memoryUsed = memoryStats ? (memoryStats.usage || 0) : 0;
  const memoryLimit = memoryStats ? (memoryStats.limit || 0) : 0;
  const memoryPercent = memoryLimit > 0 ? (memoryUsed / memoryLimit) * 100 : 0;
  
  // Réseau
  let networkRx = 0;
  let networkTx = 0;
  for (const [iface, stats] of Object.entries(networkStats)) {
    if (stats) {
      networkRx += stats.rx_bytes || 0;
      networkTx += stats.tx_bytes || 0;
    }
  }
  
  // Disque
  let diskRead = 0;
  let diskWrite = 0;
  if (blkioStats) {
    for (const io of blkioStats.io_service_bytes_recursive || []) {
      if (io.op === 'Read') diskRead += io.value || 0;
      if (io.op === 'Write') diskWrite += io.value || 0;
    }
  }
  
  return {
    timestamp: stat.read ? new Date(stat.read).toISOString() : new Date().toISOString(),
    cpu: {
      percent: parseFloat(cpuPercent.toFixed(2)),
      usage: cpuDelta || 0,
      cores: cpuStats ? cpuStats.online_cpus : 1
    },
    memory: {
      used: memoryUsed,
      limit: memoryLimit,
      percent: parseFloat(memoryPercent.toFixed(2)),
      usedMB: Math.round(memoryUsed / (1024 * 1024)),
      limitMB: memoryLimit > 0 ? Math.round(memoryLimit / (1024 * 1024)) : 0
    },
    network: {
      rx_bytes: networkRx,
      tx_bytes: networkTx,
      rx_kb: Math.round(networkRx / 1024),
      tx_kb: Math.round(networkTx / 1024)
    },
    disk: {
      read: diskRead,
      write: diskWrite
    }
  };
}

/**
 * Récupère les stats de tous les conteneurs actifs via CLI Docker
 * @returns {Promise<Array>} - Stats de tous les conteneurs
 */
async function getAllContainersStats() {
  // Essayer d'abord avec la commande CLI Docker (plus fiable)
  try {
    const stats = await getAllContainersStatsCli();
    if (stats.length > 0) {
      return stats;
    }
  } catch (error) {
    console.warn('⚠️ Impossible de récupérer les stats via CLI Docker, essai avec dockerode...');
  }
  
  // Fallback avec dockerode
  const containers = await getContainers(true);
  const runningContainers = containers.filter(c => c.isRunning);
  
  const statsPromises = runningContainers.map(async container => {
    const containerStats = await getContainerStats(container.id);
    return {
      ...container,
      stats: containerStats
    };
  });
  
  return Promise.all(statsPromises);
}

/**
 * Récupère les stats de tous les conteneurs via la commande CLI Docker
 * @returns {Promise<Array>} - Stats de tous les conteneurs
 */
async function getAllContainersStatsCli() {
  // D'abord récupérer la liste des conteneurs avec leurs images
  let containersInfo = [];
  try {
    containersInfo = await getContainers(true);
  } catch (error) {
    console.warn('⚠️ Impossible de récupérer la liste des conteneurs:', error.message);
  }
  
  return new Promise((resolve, reject) => {
    // Utiliser docker stats avec format JSON
    exec('docker stats --no-stream --format "{{json .}}"', { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur docker stats CLI:', error.message);
        return reject(error);
      }
      
      if (stderr) {
        console.error('❌ Erreur stderr docker stats CLI:', stderr);
        return reject(new Error(stderr));
      }
      
      if (!stdout || stdout.trim() === '') {
        console.error('❌ Aucune sortie docker stats CLI');
        return resolve([]);
      }
      
      try {
        // Chaque ligne est un JSON séparé
        const lines = stdout.trim().split('\n');
        const stats = [];
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const statData = JSON.parse(line);
            const containerId = statData.Container;
            
            // Trouver les infos du conteneur dans containersInfo
            const containerInfo = containersInfo.find(c => c.id === containerId || c.shortId === containerId.substring(0, 12));
            
            stats.push({
              id: containerId,
              shortId: containerId.substring(0, 12),
              name: statData.Name.replace('/', ''),
              image: containerInfo ? containerInfo.image : '',
              state: 'running',
              isRunning: true,
              stats: {
                timestamp: new Date().toISOString(),
                cpu: {
                  percent: parseFloat(statData.CPUPerc.replace('%', '')),
                  usage: 0,
                  cores: 1
                },
                memory: {
                  used: parseMemoryValue(statData.MemUsage),
                  limit: parseMemoryValue(statData.MemLimit),
                  percent: parseFloat(statData.MemPerc.replace('%', '')),
                  usedMB: Math.round(parseMemoryValue(statData.MemUsage) / (1024 * 1024)),
                  limitMB: statData.MemLimit !== '0B' ? Math.round(parseMemoryValue(statData.MemLimit) / (1024 * 1024)) : 0
                },
                network: {
                  rx_bytes: 0,
                  tx_bytes: 0,
                  rx_kb: 0,
                  tx_kb: 0
                },
                disk: {
                  read: 0,
                  write: 0
                }
              }
            });
          } catch (e) {
            console.error('❌ Erreur parsing ligne docker stats:', e.message);
          }
        }
        
        resolve(stats);
      } catch (parseError) {
        console.error('❌ Erreur parsing global docker stats CLI:', parseError.message);
        reject(parseError);
      }
    });
  });
}

/**
 * Parse une valeur mémoire Docker (ex: "349.6MiB", "1.5GiB", "0B")
 * @param {string} value - Valeur à parser
 * @returns {number} - Valeur en octets (toujours un nombre valide)
 */
function parseMemoryValue(value) {
  // Gérer les valeurs nulles, vides ou 0B
  if (!value || value === '0B' || value === '' || typeof value !== 'string') {
    return 0;
  }
  
  // Nettoyer la valeur (enlever espaces, etc.)
  const cleanValue = value.trim();
  
  // Gérer les formats Docker : "349.6MiB", "1.5GiB", "123kB", "0B"
  const match = cleanValue.match(/^([\d.]+)\s*([KMGT]?)i?B$/i);
  if (!match) {
    console.warn(`⚠️ Format mémoire Docker non reconnu: "${cleanValue}"`);
    return 0;
  }
  
  const num = parseFloat(match[1]);
  if (isNaN(num) || !isFinite(num)) {
    console.warn(`⚠️ Valeur numérique invalide: "${match[1]}"`);
    return 0;
  }
  
  const unit = (match[2] || '').toUpperCase();
  const multipliers = {
    '': 1,
    'K': 1024,
    'M': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024
  };
  
  const multiplier = multipliers[unit] || 1;
  const result = Math.round(num * multiplier);
  
  // Vérifier que le résultat est un nombre valide
  if (isNaN(result) || !isFinite(result)) {
    return 0;
  }
  
  return result;
}

/**
 * Démarre un conteneur
 * @param {string} containerId - ID du conteneur
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function startContainer(containerId) {
  if (!docker) {
    if (!initializeDockerClient()) {
      return { success: false, error: 'Client Docker non initialisé' };
    }
  }

  try {
    const container = docker.getContainer(containerId);
    await container.start();
    return { success: true, message: 'Conteneur démarré avec succès' };
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du conteneur:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Arrête un conteneur
 * @param {string} containerId - ID du conteneur
 * @param {number} timeout - Timeout en secondes (default: 10)
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function stopContainer(containerId, timeout = 10) {
  if (!docker) {
    if (!initializeDockerClient()) {
      return { success: false, error: 'Client Docker non initialisé' };
    }
  }

  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: timeout });
    return { success: true, message: 'Conteneur arrêté avec succès' };
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt du conteneur:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Redémarre un conteneur
 * @param {string} containerId - ID du conteneur
 * @param {number} timeout - Timeout en secondes (default: 10)
 * @returns {Promise<Object>} - Résultat de l'opération
 */
async function restartContainer(containerId, timeout = 10) {
  if (!docker) {
    if (!initializeDockerClient()) {
      return { success: false, error: 'Client Docker non initialisé' };
    }
  }

  try {
    const container = docker.getContainer(containerId);
    await container.restart({ t: timeout });
    return { success: true, message: 'Conteneur redémarré avec succès' };
  } catch (error) {
    console.error('❌ Erreur lors du redémarrage du conteneur:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Sauvegarde les stats Docker dans la base de données
 * @returns {Promise<number>} - Nombre d'entrées sauvegardées
 */
/**
 * Valide et nettoie les stats Docker avant sauvegarde
 * @param {Object} stats - Stats à valider
 * @returns {Object} - Stats validées
 */
function validateDockerStats(stats) {
  if (!stats) return null;
  
  // Valider et nettoyer chaque valeur
  const validated = {
    cpu_percent: Math.max(0, Math.min(100, isFinite(stats.cpu?.percent) ? parseFloat(stats.cpu.percent) : 0)),
    memory_used: Math.max(0, isFinite(stats.memory?.used) ? parseInt(stats.memory.used) : 0),
    memory_limit: Math.max(0, isFinite(stats.memory?.limit) ? parseInt(stats.memory.limit) : 0),
    memory_percent: Math.max(0, Math.min(100, isFinite(stats.memory?.percent) ? parseFloat(stats.memory.percent) : 0)),
    network_rx: Math.max(0, isFinite(stats.network?.rx_bytes) ? parseInt(stats.network.rx_bytes) : 0),
    network_tx: Math.max(0, isFinite(stats.network?.tx_bytes) ? parseInt(stats.network.tx_bytes) : 0),
    disk_read: Math.max(0, isFinite(stats.disk?.read) ? parseInt(stats.disk.read) : 0),
    disk_write: Math.max(0, isFinite(stats.disk?.write) ? parseInt(stats.disk.write) : 0)
  };
  
  return validated;
}

async function saveDockerStatsToHistory() {
  try {
    const containersStats = await getAllContainersStats();
    
    for (const container of containersStats) {
      if (container.stats && container.isRunning) {
        const stats = container.stats;
        
        // Valider les stats avant sauvegarde
        const validatedStats = validateDockerStats(stats);
        if (!validatedStats) {
          console.error('⚠️ Stats Docker invalides pour conteneur:', container.id);
          continue;
        }
        
        // Vérifier si le conteneur existe déjà
        const existing = await db.getDockerContainer(container.id);
        
        if (existing) {
          // Mettre à jour
          await db.updateDockerStats(container.id, {
            name: container.name || '',
            state: container.state || 'unknown',
            cpu_percent: validatedStats.cpu_percent,
            memory_used: validatedStats.memory_used,
            memory_limit: validatedStats.memory_limit,
            memory_percent: validatedStats.memory_percent,
            network_rx: validatedStats.network_rx,
            network_tx: validatedStats.network_tx,
            disk_read: validatedStats.disk_read,
            disk_write: validatedStats.disk_write,
            is_running: container.isRunning ? 1 : 0
          });
        } else {
          // Insérer nouveau
          await db.insertDockerContainer({
            container_id: container.id,
            name: container.name || '',
            image: container.image || '',
            state: container.state || 'unknown',
            cpu_percent: validatedStats.cpu_percent,
            memory_used: validatedStats.memory_used,
            memory_limit: validatedStats.memory_limit,
            memory_percent: validatedStats.memory_percent,
            network_rx: validatedStats.network_rx,
            network_tx: validatedStats.network_tx,
            disk_read: validatedStats.disk_read,
            disk_write: validatedStats.disk_write,
            is_running: container.isRunning ? 1 : 0
          });
        }
      }
    }
    
    return containersStats.length;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des stats Docker:', error.message);
    return 0;
  }
}

/**
 * Vérifie les alertes Docker
 * @returns {Promise<Array>} - Liste des alertes
 */
async function checkDockerAlerts() {
  const alerts = [];
  const containersStats = await getAllContainersStats();
  
  // Seuil par défaut
  const thresholds = {
    cpu: 90,      // 90%
    memory: 85,   // 85%
    down: true    // Alerter si conteneur down
  };
  
  for (const container of containersStats) {
    if (!container.isRunning && thresholds.down) {
      alerts.push({
        type: 'container_down',
        container_id: container.id,
        container_name: container.name,
        message: `Conteneur ${container.name} est arrêté`,
        severity: 'critical'
      });
    } else if (container.stats && container.isRunning) {
      const stats = container.stats;
      
      if (stats.cpu.percent > thresholds.cpu) {
        alerts.push({
          type: 'high_cpu',
          container_id: container.id,
          container_name: container.name,
          message: `Conteneur ${container.name} utilise ${stats.cpu.percent.toFixed(1)}% CPU`,
          value: stats.cpu.percent,
          threshold: thresholds.cpu,
          severity: 'warning'
        });
      }
      
      if (stats.memory.percent > thresholds.memory) {
        alerts.push({
          type: 'high_memory',
          container_id: container.id,
          container_name: container.name,
          message: `Conteneur ${container.name} utilise ${stats.memory.percent.toFixed(1)}% de la mémoire`,
          value: stats.memory.percent,
          threshold: thresholds.memory,
          severity: 'warning'
        });
      }
    }
  }
  
  return alerts;
}

/**
 * Récupère l'historique Docker
 * @param {Object} options - Options de filtrage
 * @returns {Promise<Object>} - Historique Docker
 */
async function getDockerHistory(options = {}) {
  try {
    const history = await db.getDockerHistory(options);
    return {
      success: true,
      data: history,
      count: history.length
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique Docker:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Démarre la collecte automatique des stats Docker
 */
function startAutoDockerCollect() {
  // Sauvegarder immédiatement au démarrage
  saveDockerStatsToHistory();
  
  // Sauvegarder périodiquement (toutes les 5 minutes)
  const interval = setInterval(saveDockerStatsToHistory, 300000); // 5 minutes
  console.log('✅ Collecte automatique des stats Docker démarrée (toutes les 5 minutes)');
  
  return interval;
}

/**
 * Arrête la collecte automatique
 * @param {NodeJS.Timeout} interval - L'intervalle à arrêter
 */
function stopAutoDockerCollect(interval) {
  if (interval) {
    clearInterval(interval);
    console.log('✅ Collecte automatique des stats Docker arrêtée');
  }
}

// Initialiser au démarrage
initializeDockerClient();

module.exports = {
  checkDockerStatus,
  getContainers,
  getContainerStats,
  getAllContainersStats,
  startContainer,
  stopContainer,
  restartContainer,
  saveDockerStatsToHistory,
  checkDockerAlerts,
  getDockerHistory,
  startAutoDockerCollect,
  stopAutoDockerCollect,
  parseDockerStats
};

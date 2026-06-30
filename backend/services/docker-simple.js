/**
 * Service Docker simplifié
 * Retourne uniquement les infos de base sur les conteneurs
 */

const Docker = require('dockerode');

// Créer une instance Dockerode
// En mode host ou avec /var/run/docker.sock monté, le socket est accessible
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * Vérifie si Docker est disponible et récupère les infos de base
 * @returns {Promise<Object>} - Statut Docker et conteneurs
 */
async function getSimpleDockerInfo() {
  try {
    // Tester la connexion Docker
    await docker.info();
    
    // Récupérer tous les conteneurs (y compris arrêtés)
    const containers = await docker.listContainers({ all: true });
    
    // Compter les conteneurs en cours d'exécution et arrêtés
    const runningContainers = containers.filter(c => c.State === 'running');
    const stoppedContainers = containers.filter(c => c.State !== 'running');
    
    return {
      available: true,
      running: runningContainers.length,
      stopped: stoppedContainers.length,
      total: containers.length,
      error: null
    };
  } catch (error) {
    return {
      available: false,
      running: 0,
      stopped: 0,
      total: 0,
      error: 'Docker non disponible'
    };
  }
}

module.exports = { getSimpleDockerInfo };

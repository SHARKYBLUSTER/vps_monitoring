/**
 * Service Docker simplifié
 * Retourne uniquement les infos de base sur les conteneurs
 */

const { exec } = require('child_process');

/**
 * Vérifie si Docker est disponible et récupère les infos de base
 * @returns {Promise<Object>} - Statut Docker et conteneurs
 */
async function getSimpleDockerInfo() {
  try {
    const { stdout: psOutput } = await execPromise('docker ps --format "{{.ID}}"');
    const runningContainers = psOutput.trim().split('\n').filter(line => line.trim());
    
    const { stdout: allOutput } = await execPromise('docker ps -a --format "{{.ID}}"');
    const allContainers = allOutput.trim().split('\n').filter(line => line.trim());
    
    return {
      available: true,
      running: runningContainers.length,
      stopped: allContainers.length - runningContainers.length,
      total: allContainers.length,
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

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) reject(error);
      else if (stderr) reject(new Error(stderr));
      else resolve({ stdout, stderr });
    });
  });
}

module.exports = { getSimpleDockerInfo };

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

/**
 * Récupère les informations détaillées sur les conteneurs et images Docker
 * @returns {Promise<Object>} - Statistiques détaillées Docker
 */
async function getDockerDetailedInfo() {
  try {
    // Tester la connexion Docker
    const dockerInfo = await docker.info();
    
    // Récupérer tous les conteneurs (y compris arrêtés)
    const containers = await docker.listContainers({ all: true });
    
    // Récupérer toutes les images
    const images = await docker.listImages({ all: true });
    
    // Statistiques conteneurs
    const running = containers.filter(c => c.State === 'running');
    const stopped = containers.filter(c => c.State !== 'running');
    const paused = containers.filter(c => c.State === 'paused');
    
    // Statistiques images
    const totalImagesSize = images.reduce((sum, img) => {
      // VirtualSize est en octets, peut être undefined
      return sum + (img.VirtualSize ? parseInt(img.VirtualSize) : 0);
    }, 0);
    
    const danglingImages = images.filter(img => img.Dangling === true);
    
    // Détails des conteneurs (avec inspection pour plus d'infos)
    const containerDetails = await Promise.all(
      containers.slice(0, 50).map(async (container) => {
        try {
          const containerObj = docker.getContainer(container.Id);
          const details = await containerObj.inspect();
          
          // Extraire les noms (format: "/nom-conteneur")
          const names = container.Names || [];
          const name = names.length > 0 ? names[0].replace('/', '') : container.Id.substring(0, 12);
          
          // Extraire les ports exposés
          const ports = details.NetworkSettings?.Ports || {};
          const portBindings = [];
          for (const [containerPort, bindings] of Object.entries(ports)) {
            if (bindings && bindings.length > 0) {
              bindings.forEach(binding => {
                if (binding.HostIp && binding.HostPort) {
                  portBindings.push(`${binding.HostIp}:${binding.HostPort}->${containerPort}`);
                } else if (binding.HostPort) {
                  portBindings.push(`${binding.HostPort}->${containerPort}`);
                }
              });
            }
          }
          
          // Formater la date de création
          const createdDate = details.Created ? new Date(details.Created).toISOString() : '';
          
          // Extraire la commande
          const cmd = details.Config?.Cmd || [];
          const entrypoint = details.Config?.Entrypoint || [];
          const command = [...entrypoint, ...cmd].join(' ').substring(0, 100) || 'N/A';
          
          return {
            id: container.Id.substring(0, 12),
            name: name,
            image: container.Image || 'N/A',
            state: container.State,
            status: container.Status,
            ports: portBindings.length > 0 ? portBindings.join(', ') : '-',
            created: createdDate,
            command: command
          };
        } catch (err) {
          // Si on ne peut pas inspecter un conteneur, retourner les infos de base
          return {
            id: container.Id.substring(0, 12),
            name: container.Names?.[0]?.replace('/', '') || container.Id.substring(0, 12),
            image: container.Image || 'N/A',
            state: container.State,
            status: container.Status,
            ports: '-',
            created: '',
            command: 'N/A'
          };
        }
      })
    );
    
    // Détails des images
    const imageDetails = images.slice(0, 50).map(img => {
      const repoTags = img.RepoTags || ['<none>:<none>'];
      const size = img.VirtualSize ? parseInt(img.VirtualSize) : 0;
      const createdDate = img.Created ? new Date(img.Created).toISOString() : '';
      
      return {
        id: img.Id.substring(0, 12),
        repoTags: repoTags,
        size: size,
        created: createdDate,
        dangling: img.Dangling === true
      };
    });
    
    return {
      available: true,
      // Stats conteneurs
      containers: {
        running: running.length,
        stopped: stopped.length,
        paused: paused.length,
        total: containers.length,
        details: containerDetails
      },
      // Stats images
      images: {
        total: images.length,
        totalSize: totalImagesSize,
        dangling: danglingImages.length,
        details: imageDetails
      },
      // Infos Docker Engine
      dockerInfo: {
        serverVersion: dockerInfo.ServerVersion || 'Unknown',
        os: dockerInfo.OS || 'Unknown',
        architecture: dockerInfo.Architecture || 'Unknown',
        cpus: dockerInfo.NCPU || 0,
        memory: dockerInfo.MemTotal || 0
      },
      error: null
    };
  } catch (error) {
    return {
      available: false,
      containers: { running: 0, stopped: 0, paused: 0, total: 0, details: [] },
      images: { total: 0, totalSize: 0, dangling: 0, details: [] },
      dockerInfo: {},
      error: 'Docker non disponible: ' + error.message
    };
  }
}

module.exports = { getSimpleDockerInfo, getDockerDetailedInfo };

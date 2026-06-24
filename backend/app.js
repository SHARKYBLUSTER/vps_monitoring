/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 * 
 * Architecture :
 * - Frontend statique (frontend/index.html)
 * - API REST pour les données JSON (/api/*)
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const metricsService = require('./services/metrics');
const historyService = require('./services/history');
const dockerService = require('./services/docker');
const db = require('./services/db-sqlite');
const { requireApiAuth, requireAuth, initializeAdminUser } = require('./middleware/auth');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser l'utilisateur admin (doit être fait avant les requêtes)
initializeAdminUser();

// Démarrer la collecte automatique de l'historique
historyService.startAutoCollect();

// Démarrer la collecte automatique des stats Docker
dockerService.startAutoDockerCollect();

// Middleware pour parser le JSON et le logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Middleware de session (requis pour l'authentification)
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_cle_secrete_par_defaut_changez_la',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Middleware CORS pour autoriser les requêtes depuis le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Appliquer l'authentification sur TOUTES les routes API
app.use('/api/*', requireApiAuth);

// ====================
// Routes d'authentification
// ====================

// Page de login (formulaire HTML)
app.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Traitement du login (POST)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { validateCredentials } = require('./middleware/auth');
    
    const isValid = await validateCredentials(username, password);
    
    if (isValid) {
      req.session.authenticated = true;
      req.session.username = username;
      req.session.save();
      
      // Rediriger vers la page précédente ou vers l'accueil
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(returnTo);
    } else {
      return res.status(401).redirect('/login?error=1');
    }
  } catch (error) {
    console.error('❌ Erreur lors du login:', error);
    return res.status(500).redirect('/login?error=1');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Erreur lors du logout:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// ====================
// Routes API (REST)
// ====================

// Endpoint pour récupérer l'utilisateur connecté
app.get('/api/user', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({
      success: true,
      authenticated: true,
      username: req.session.username || 'admin'
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/metrics :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les métriques' });
  }
});

app.get('/api/network', async (req, res) => {
  try {
    const networkMetrics = await metricsService.getNetworkMetrics();
    res.json({
      success: true,
      data: networkMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/network :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les métriques réseau' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await metricsService.getAlerts();
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/alerts :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les alertes' });
  }
});

// Endpoint pour les processus (Top consommateurs)
app.get('/api/processes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const processes = await metricsService.getTopProcesses(limit);
    res.json({
      success: true,
      data: processes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/processes :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les processus' });
  }
});

// Endpoint pour les ports ouverts
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await metricsService.getOpenPorts();
    res.json({
      success: true,
      data: ports,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/ports :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les ports ouverts' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
  });
});

// ====================
// Routes API - Historique
// ====================

app.get('/api/history', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      from: req.query.from || null,
      to: req.query.to || null,
    };
    const result = await historyService.getHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique des métriques' });
  }
});

app.get('/api/history/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || 50,
      period: req.query.period || 'day'
    };
    const result = await historyService.getChartData(metric, options);
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/history/${req.params.metric} :`, error);
    res.status(500).json({ success: false, error: `Impossible de récupérer les données du graphique pour ${req.params.metric}` });
  }
});

app.get('/api/history/alerts', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      unresolvedOnly: req.query.unresolvedOnly === 'true',
    };
    const result = await historyService.getAlertsHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/alerts :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique des alertes' });
  }
});

app.post('/api/history/cleanup', async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 30;
    const result = await historyService.cleanupHistory(days);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/cleanup :', error);
    res.status(500).json({ success: false, error: 'Impossible de nettoyer l\'historique' });
  }
});

// Endpoint pour l'historique réseau avec filtres temporels
app.get('/api/network-history', async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    const result = await historyService.getNetworkHistory({ period });
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/network-history :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique réseau' });
  }
});

// ====================
// Routes API - Docker
// ====================

// Statut de Docker
app.get('/api/docker', async (req, res) => {
  try {
    const status = await dockerService.checkDockerStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker :', error);
    res.status(500).json({ success: false, error: 'Impossible de vérifier le statut Docker' });
  }
});

// Liste des conteneurs
app.get('/api/docker/containers', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const containers = await dockerService.getContainers(all);
    res.json({
      success: true,
      data: containers,
      count: containers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker/containers :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les conteneurs' });
  }
});

// Stats d'un conteneur spécifique
app.get('/api/docker/containers/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await dockerService.getContainerStats(id);
    
    if (!stats) {
      return res.status(404).json({ success: false, error: 'Conteneur non trouvé' });
    }
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Erreur API /api/docker/containers/${req.params.id}/stats :`, error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les stats du conteneur' });
  }
});

// Stats de tous les conteneurs
app.get('/api/docker/stats', async (req, res) => {
  try {
    const stats = await dockerService.getAllContainersStats();
    res.json({
      success: true,
      data: stats,
      count: stats.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker/stats :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les stats Docker' });
  }
});

// Historique Docker
app.get('/api/docker/history', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      containerId: req.query.containerId || null,
      from: req.query.from || null,
      to: req.query.to || null
    };
    const result = await dockerService.getDockerHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/docker/history :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer l\'historique Docker' });
  }
});

// Historique des stats d'un conteneur pour graphique
app.get('/api/docker/containers/:id/chart', async (req, res) => {
  try {
    const { id } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || 50,
      period: req.query.period || 'day'
    };
    const chartData = await db.getDockerContainerChartData(id, options);
    res.json({
      success: true,
      data: chartData,
      containerId: id,
      count: chartData.length
    });
  } catch (error) {
    console.error(`❌ Erreur API /api/docker/containers/${req.params.id}/chart :`, error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les données du graphique' });
  }
});

// Alertes Docker
app.get('/api/docker/alerts', async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      unresolvedOnly: req.query.unresolvedOnly === 'true',
      containerId: req.query.containerId || null
    };
    const alerts = await db.getDockerAlertsHistory(options);
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker/alerts :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les alertes Docker' });
  }
});

// Vérifier les alertes Docker (à appeler manuellement ou via scheduler)
app.get('/api/docker/alerts/check', async (req, res) => {
  try {
    const alerts = await dockerService.checkDockerAlerts();
    
    // Sauvegarder les nouvelles alertes
    for (const alert of alerts) {
      await db.insertDockerAlert(alert);
    }
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker/alerts/check :', error);
    res.status(500).json({ success: false, error: 'Impossible de vérifier les alertes Docker' });
  }
});

// Actions Docker
app.post('/api/docker/containers/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dockerService.startContainer(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/docker/containers/${req.params.id}/start :`, error);
    res.status(500).json({ success: false, error: 'Impossible de démarrer le conteneur' });
  }
});

app.post('/api/docker/containers/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const timeout = parseInt(req.body.timeout) || 10;
    const result = await dockerService.stopContainer(id, timeout);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/docker/containers/${req.params.id}/stop :`, error);
    res.status(500).json({ success: false, error: 'Impossible d\'arrêter le conteneur' });
  }
});

app.post('/api/docker/containers/:id/restart', async (req, res) => {
  try {
    const { id } = req.params;
    const timeout = parseInt(req.body.timeout) || 10;
    const result = await dockerService.restartContainer(id, timeout);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/docker/containers/${req.params.id}/restart :`, error);
    res.status(500).json({ success: false, error: 'Impossible de redémarrer le conteneur' });
  }
});

// Nettoyage Docker
app.post('/api/docker/cleanup', async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 91;
    const deletedCount = await db.cleanupOldDockerData(days);
    res.json({
      success: true,
      message: `${deletedCount} entrées Docker supprimées`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker/cleanup :', error);
    res.status(500).json({ success: false, error: 'Impossible de nettoyer l\'historique Docker' });
  }
});

// ====================
// Route principale : Servir le frontend (protégée par auth)
// ====================

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Planifie le nettoyage automatique de TOUTES les données (91 jours = 3 mois + 1 jour)
const scheduleCleanup = () => {
  // Nettoyage tous les jours à minuit
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const delay = midnight - now;

  setTimeout(() => {
    // Nettoyer metrics ET alerts après 91 jours (3 mois + 1 jour)
    db.cleanupOldData(91);
    // Nettoyer aussi les données Docker
    db.cleanupOldDockerData(91);
    // Relance le nettoyage tous les jours
    setInterval(() => {
      db.cleanupOldData(91);
      db.cleanupOldDockerData(91);
    }, 24 * 60 * 60 * 1000);
  }, delay);
};

// Planifie la vérification des alertes Docker (toutes les 5 minutes)
const scheduleDockerAlertsCheck = () => {
  // Vérifier immédiatement
  dockerService.checkDockerAlerts().then(async alerts => {
    for (const alert of alerts) {
      await db.insertDockerAlert(alert);
    }
  });

  // Puis toutes les 5 minutes
  setInterval(async () => {
    const alerts = await dockerService.checkDockerAlerts();
    for (const alert of alerts) {
      await db.insertDockerAlert(alert);
    }
  }, 5 * 60 * 1000);
};

// Démarrer le nettoyage automatique
scheduleCleanup();

// Démarrer la vérification des alertes Docker
scheduleDockerAlertsCheck();

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  db.closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur (SIGTERM)...');
  db.closeDatabase();
  process.exit(0);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 API disponible :`);
  console.log(`   - GET /api/metrics       (Toutes les métriques)`);
  console.log(`   - GET /api/network       (Métriques réseau)`);
  console.log(`   - GET /api/alerts        (Alertes actives)`);
  console.log(`   - GET /api/processes     (Top 5 processus consommateurs)`);
  console.log(`   - GET /api/ports         (Ports ouverts en écoute)`);
  console.log(`   - GET /api/health        (État de santé)`);
  console.log(`   - GET /api/history       (Historique des métriques)`);
  console.log(`   - GET /api/history/:metric (Données pour graphique)`);
  console.log(`   - GET /api/history/alerts (Historique des alertes)`);
  console.log(`   - POST /api/history/cleanup (Nettoyer l'historique)`);
  console.log(`   - GET /api/network-history?period=day|week|month|quarter (Historique réseau)`);
  console.log(`   `);
  console.log(`   🐳 API Docker:`);
  console.log(`   - GET /api/docker                        (Statut Docker)`);
  console.log(`   - GET /api/docker/containers            (Liste des conteneurs)`);
  console.log(`   - GET /api/docker/containers/:id/stats  (Stats d'un conteneur)`);
  console.log(`   - GET /api/docker/stats                  (Stats de tous les conteneurs)`);
  console.log(`   - GET /api/docker/history                (Historique Docker)`);
  console.log(`   - GET /api/docker/containers/:id/chart (Graphique d'un conteneur)`);
  console.log(`   - GET /api/docker/alerts                (Alertes Docker)`);
  console.log(`   - GET /api/docker/alerts/check           (Vérifier les alertes)`);
  console.log(`   - POST /api/docker/containers/:id/start  (Démarrer un conteneur)`);
  console.log(`   - POST /api/docker/containers/:id/stop   (Arrêter un conteneur)`);
  console.log(`   - POST /api/docker/containers/:id/restart (Redémarrer un conteneur)`);
  console.log(`   - POST /api/docker/cleanup               (Nettoyer l'historique Docker)`);
});

module.exports = app;

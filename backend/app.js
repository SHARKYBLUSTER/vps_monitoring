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
const dockerSimple = require('./services/docker-simple');
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



// Middleware pour parser le JSON et le logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Middleware de session (requis pour l'authentification)
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_cle_secrete_par_defaut_changez_la',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000, // 24h
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    domain: false
  }
}));
// Middleware CORS pour autoriser les requêtes depuis le frontend
app.use((req, res, next) => {
  // Autoriser les credentials (cookies, headers d'authentification)
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Déterminer l'origine
  // Avec credentials, on NE PEUT PAS utiliser '*' - il faut une origine spécifique
  const origin = req.headers.origin || req.headers.referer;
  
  // Nettoyer le host (enlever les / à la fin)
  const host = req.get('host').replace(/\/$/, '');
  
  // Détecter le protocole (en tenant compte des proxys comme Nginx)
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto : (req.secure ? 'https' : 'http');
  
  // Construire l'URL complète de l'origine
  let allowedOrigin;
  if (origin) {
    // Si origin est présent, l'utiliser directement
    allowedOrigin = origin.replace(/\/$/, ''); // Nettoyer les / finaux
    // Pour localhost, forcer le port 3000
    if (allowedOrigin.includes('localhost') || allowedOrigin.includes('127.0.0.1')) {
      allowedOrigin = 'http://localhost:3000';
    }
  } else {
    // Pour les requêtes same-origin, construire à partir de l'host et protocole
    allowedOrigin = `${protocol}://${host}`;
    
    // Ajouter le port si nécessaire (pour le développement local)
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      allowedOrigin = 'http://localhost:3000';
    }
  }
  
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Vary', 'Origin');
  
  // Gérer les requêtes OPTIONS pour le préflight CORS
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24h
    return res.status(204).end();
  }
  
  next();
});

// Middleware pour servir les fichiers statiques (frontend) - sans index.html par défaut
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

// Bloquer l'accès direct à /index.html - rediriger vers / qui nécessite authentification
app.get('/index.html', (req, res) => {
  res.redirect('/');
});

// Routes API qui ne nécessitent pas d'authentification (GET uniquement)
// Route pour récupérer la configuration (lecture seule, pas de données sensibles)
app.get('/api/config', (req, res) => {
  try {
    const config = require('./config/config');
    res.json({
      success: true,
      data: {
        metricsInterval: config.metricsInterval,
        dataRetentionMonths: config.dataRetentionMonths,
        alerts: config.alerts
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/config :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer la configuration' });
  }
});

// Endpoint pour vérifier l'authentification de l'utilisateur (public, pour permettre la vérification côté client)
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

// Appliquer l'authentification sur TOUTES les autres routes API
app.use('/api/*', requireApiAuth);

// ====================
// Routes d'authentification
// ====================

// Route racine - nécessite authentification
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

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
      // Régénérer l'ID de session pour éviter les fixations de session
      req.session.regenerate(err => {
        if (err) {
          console.error('❌ Erreur regeneration session:', err);
          return res.status(500).redirect('/login?error=1');
        }
        
        req.session.authenticated = true;
        req.session.username = username;
        req.session.save();
        
        // Rediriger vers la page précédente ou vers l'accueil
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        return res.redirect(returnTo);
      });
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

// Endpoint pour mettre à jour la configuration
app.post('/api/config', (req, res) => {
  try {
    const { metricsInterval, dataRetentionMonths } = req.body;
    
    // Validation des paramètres
    if (metricsInterval !== undefined) {
      const newInterval = parseInt(metricsInterval);
      if (isNaN(newInterval) || newInterval < 1000) {
        return res.status(400).json({ 
          success: false, 
          error: 'metricsInterval doit être un nombre valide >= 1000ms' 
        });
      }
      
      // Mettre à jour la configuration en mémoire
      const config = require('./config/config');
      config.metricsInterval = newInterval;
      
      // Mettre à jour l'intervalle dans le service d'historique
      const historyService = require('./services/history');
      historyService.setSaveInterval(newInterval);
    }
    
    if (dataRetentionMonths !== undefined) {
      const newRetention = parseInt(dataRetentionMonths);
      if (isNaN(newRetention) || newRetention < 1 || newRetention > 24) {
        return res.status(400).json({ 
          success: false, 
          error: 'dataRetentionMonths doit être entre 1 et 24 mois' 
        });
      }
      
      // Mettre à jour la rétention dans la configuration
      const config = require('./config/config');
      config.dataRetentionMonths = newRetention;
      
      // Mettre à jour le TTL dans le service d'historique
      const historyService = require('./services/history');
      // Note: Le nettoyage automatique utilisera la nouvelle valeur au prochain cycle
    }
    
    // Retourner la configuration complète
    const config = require('./config/config');
    res.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: {
        metricsInterval: config.metricsInterval,
        dataRetentionMonths: config.dataRetentionMonths
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/config :', error);
    res.status(500).json({ success: false, error: 'Impossible de mettre à jour la configuration' });
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

// Endpoint pour effacer TOUTES les données
app.post('/api/history/clear-all', async (req, res) => {
  try {
    const db = require('./services/db-sqlite');
    // Appeler cleanupOldData avec un grand nombre négatif pour tout supprimer
    // -36500 jours = environ 100 ans dans le passé, donc tout sera supprimé
    const deletedCount = await db.cleanupOldData(-36500);
    res.json({
      success: true,
      message: `✅ Toutes les données ont été supprimées (${deletedCount} entrées)`,
      deletedCount,
    });
  } catch (error) {
    console.error('❌ Erreur API /api/history/clear-all :', error);
    res.status(500).json({ success: false, error: 'Impossible de supprimer toutes les données' });
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
// Route API - Docker simplifié
// ====================

// Infos Docker de base (nombre de conteneurs)
app.get('/api/docker-simple', async (req, res) => {
  try {
    const info = await dockerSimple.getSimpleDockerInfo();
    res.json({
      success: true,
      data: info,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur API /api/docker-simple :', error);
    res.status(500).json({ success: false, error: 'Impossible de récupérer les infos Docker' });
  }
});

// ====================
// Route principale : Servir le frontend (protégée par auth)
// ====================

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Planifie le nettoyage automatique de TOUTES les données
const scheduleCleanup = () => {
  const config = require('./config/config');
  // Calculer le nombre de jours à partir des mois de rétention (avec 1 jour de marge)
  const retentionDays = (config.dataRetentionMonths || 3) * 30 + 1;
  
  // Nettoyage tous les jours à minuit
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const delay = midnight - now;

  setTimeout(() => {
    // Nettoyer metrics ET alerts après la période de rétention
    db.cleanupOldData(retentionDays);
    // Relance le nettoyage tous les jours
    setInterval(() => {
      db.cleanupOldData(retentionDays);
    }, 24 * 60 * 60 * 1000);
  }, delay);
};

// Démarrer le nettoyage automatique
scheduleCleanup();

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
  console.log(`   - POST /api/history/clear-all (EFFACER TOUTES les données)`);
  console.log(`   - GET /api/network-history?period=day|week|month|quarter (Historique réseau)`);
  console.log(`   - GET /api/docker-simple       (Infos Docker de base)`);
  console.log(`   - GET /api/config        (Configuration actuelle)`);
  console.log(`   - POST /api/config       (Mettre à jour la configuration)`);
});

module.exports = app;

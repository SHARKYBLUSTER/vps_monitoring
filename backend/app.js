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
const { requireApiAuth, initializeAdminUser } = require('./middleware/auth');

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
    const options = { limit: parseInt(req.query.limit) || 50 };
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
// Route principale : Servir le frontend (protégée par auth)
// ====================

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Planifie le nettoyage automatique des données réseau (91 jours = 3 mois + 1 jour)
const scheduleNetworkCleanup = () => {
  // Nettoyage tous les jours à minuit
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const delay = midnight - now;

  setTimeout(() => {
    historyService.cleanupNetworkHistory(91); // 91 jours = 3 mois + 1 jour
    // Relance le nettoyage tous les jours
    setInterval(() => historyService.cleanupNetworkHistory(91), 24 * 60 * 60 * 1000);
  }, delay);
};

// Démarrer le nettoyage automatique
scheduleNetworkCleanup();

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
});

module.exports = app;

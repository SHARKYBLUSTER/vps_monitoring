/**
 * Point d'entrée principal du backend (Node.js + Express)
 * Projet : VPS Monitoring Dashboard
 * 
 * Architecture :
 * - SSR (Server-Side Rendering) pour la page principale (/)
 * - API REST pour les données JSON (/api/*)
 */

const express = require('express');
const path = require('path');
const morgan = require('morgan'); // Routes API (REST)
// ====================

/**
 * GET /api/metrics
 * Récupère toutes les métriques système (CPU, RAM, Disque, Réseau)
 */
app.get('/api/metrics', async (req, res) => {
=======
// ====================
// Routes Authentification
// ====================

/**
 * GET /login
 * Affiche le formulaire de login
 */
app.get('/login', (req, res) => {
  // Vérifier si l'utilisateur est déjà connecté
  if (req.session && req.session.authenticated) {
    return res.redirect('/');
  }
  
  // Générer le HTML du formulaire de login
  const loginHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion - VPS Monitoring Dashboard</title>
      <link rel="stylesheet" href="/css/style.css">
      <style>
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
        }
        .login-container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .login-container h1 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-weight: 600;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #3498db;
        }
        .login-button {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 10px;
        }
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .error-message {
          color: #e74c3c;
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .footer-link {
          margin-top: 20px;
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        .footer-link a {
          color: #3498db;
          text-decoration: none;
        }
        .footer-link a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>🔒 Connexion</h1>
        <p style="color: #7f8c8d; margin-bottom: 20px;">VPS Monitoring Dashboard</p>
        
        ${req.query.error ? '<p class="error-message">❌ Identifiants incorrects</p>' : ''}
        
        <form class="login-form" method="POST" action="/login">
          <div class="form-group">
            <label for="username">Utilisateur</label>
            <input type="text" id="username" name="username" required autofocus>
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="login-button">Se connecter</button>
        </form>
        
        <p class="footer-link">
          <a href="/">Retour à l'accueil</a>
        </p>
      </div>
    </body>
    </html>
  `;
  
  res.send(loginHtml);
});

/**
 * POST /login
 * Traite la soumission du formulaire de login
 */
app.post('/login', express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.redirect('/login?error=1');
  }
  
  try {
    const isValid = await authMiddleware.validateCredentials(username, password);
    
    if (isValid) {
      req.session.authenticated = true;
      req.session.username = username;
      
      // Rediriger vers la page demandée ou vers l'accueil
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      
      return res.redirect(returnTo);
    } else {
      return res.redirect('/login?error=1');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification:', error);
    return res.redirect('/login?error=1');
  }
});

/**
 * GET /logout
 * Déconnecte l'utilisateur
 */
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Erreur lors de la déconnexion:', err);
    }
    res.redirect('/login');
  });
});

// ====================
// Routes API (REST)
// ====================

/**
 * GET /api/metrics
 * Récupère toutes les métriques système (CPU, RAM, Disque, Réseau)
 */
app.get('/api/metrics', authMiddleware.requireApiAuth, async (req, res) => {Pour le logging des requêtes HTTP
const session = require('express-session');
const dotenv = require('dotenv');
const authMiddleware = require('./middleware/auth');
const metricsService = require('./services/metrics');
const historyService = require('./services/history');
const config = require('./config/config');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser l'utilisateur admin
authMiddleware.initializeAdminUser();

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'vps_monitoring_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  },
}));

// Démarrer la collecte automatique de l'historique
historyService.startAutoCollect();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour le logging des requêtes (dev)
app.use(morgan('dev'));

// Middleware pour servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// ====================
// Routes API (REST)
// ====================

/**
 * GET /api/metrics
 * Récupère toutes les métriques système (CPU, RAM, Disque, Réseau)
 */
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
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques',
    });
  }
});

/**
 * GET /api/network
 * Récupère les métriques réseau détaillées
 */
app.get('/api/network', authMiddleware.requireApiAuth, async (req, res) => {
  try {
    const networkMetrics = await metricsService.getNetworkMetrics();
    res.json({
      success: true,
      data: networkMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/network :', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les métriques réseau',
    });
  }
});

/**
 * GET /api/alerts
 * Récupère la liste des alertes actives
 */
app.get('/api/alerts', authMiddleware.requireApiAuth, async (req, res) => {
  try {
    const alerts = await metricsService.getAlerts();
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur API /api/alerts :', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer les alertes',
    });
  }
});

/**
 * GET /api/health
 * Vérifie l'état de santé du serveur
 */
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

/**
 * GET /api/history
 * Récupère l'historique des métriques
 * Query params:
 * - limit: Nombre maximum de résultats (défaut: 100)
 * - from: Date de début (ISO string)
 * - to: Date de fin (ISO string)
 */
app.get('/api/history', authMiddleware.requireApiAuth, async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer l\'historique des métriques',
    });
  }
});

/**
 * GET /api/history/:metric
 * Récupère les données pour un graphique spécifique (cpu, memory, disk)
 * Query params:
 * - limit: Nombre maximum de points (défaut: 50)
 */
app.get('/api/history/:metric', authMiddleware.requireApiAuth, async (req, res) => {
  try {
    const { metric } = req.params;
    const options = {
      limit: parseInt(req.query.limit) || 50,
    };
    
    const result = await historyService.getChartData(metric, options);
    res.json(result);
  } catch (error) {
    console.error(`❌ Erreur API /api/history/${req.params.metric} :`, error);
    res.status(500).json({
      success: false,
      error: `Impossible de récupérer les données du graphique pour ${req.params.metric}`,
    });
  }
});

/**
 * GET /api/history/alerts
 * Récupère l'historique des alertes
 * Query params:
 * - limit: Nombre maximum de résultats (défaut: 100)
 * - unresolvedOnly: Ne retourner que les alertes non résolues (true/false)
 */
app.get('/api/history/alerts', authMiddleware.requireApiAuth, async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 100,
      unresolvedOnly: req.query.unresolvedOnly === 'true',
    };
    
    const result = await historyService.getAlertsHistory(options);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/alerts :', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de récupérer l\'historique des alertes',
    });
  }
});

/**
 * POST /api/history/cleanup
 * Nettoie les anciennes données de l'historique
 * Body: { days: number } (défaut: 30)
 */
app.post('/api/history/cleanup', authMiddleware.requireApiAuth, async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 30;
    const result = await historyService.cleanupHistory(days);
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur API /api/history/cleanup :', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de nettoyer l\'historique',
    });
  }
});

// ====================
// Routes SSR (HTML)
// ====================

/**
 * Génère le HTML avec les métriques intégrées (pour la compatibilité)
 * @param {Object} metrics - Métriques à intégrer
 * @param {Array} alerts - Alertes à afficher
 * @param {string} username - Nom de l'utilisateur connecté
 * @returns {string} - HTML généré
 */
function generateHtml(metrics, alerts, username = null) {
  // Formater les valeurs pour l'affichage
  const formatBytes = (bytes) => (bytes / (1024 ** 3)).toFixed(1); // Convertir en GB

  // Générer les cartes de métriques
  const metricsHtml = `
    <div class="metric-card">
      <h2>🧠 CPU</h2>
      <div class="metric-value">
        <span id="cpu-usage">${metrics.cpu.usage.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="cpu-progress" style="width: ${metrics.cpu.usage}%" data-tooltip="Utilisation CPU: ${metrics.cpu.usage}%"></div>
      </div>
      <p class="metric-details">
        Cœurs: <span id="cpu-cores">${metrics.cpu.cores}</span> | Modèle: <span id="cpu-model">${metrics.cpu.model}</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>💾 Mémoire (RAM)</h2>
      <div class="metric-value">
        <span id="mem-usage">${metrics.memory.usagePercent.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="mem-progress" style="width: ${metrics.memory.usagePercent}%" data-tooltip="Utilisation RAM: ${metrics.memory.usagePercent}%"></div>
      </div>
      <p class="metric-details">
        Utilisée: <span id="mem-used">${formatBytes(metrics.memory.used)} GB</span> / <span id="mem-total">${formatBytes(metrics.memory.total)} GB</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>💽 Disque</h2>
      <div class="metric-value">
        <span id="disk-usage">${metrics.disk.usagePercent.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" id="disk-progress" style="width: ${metrics.disk.usagePercent}%" data-tooltip="Utilisation Disque: ${metrics.disk.usagePercent}%"></div>
      </div>
      <p class="metric-details">
        Utilisé: <span id="disk-used">${formatBytes(metrics.disk.used)} GB</span> / <span id="disk-total">${formatBytes(metrics.disk.total)} GB</span>
      </p>
    </div>

    <div class="metric-card">
      <h2>🌐 Réseau</h2>
      <div class="metric-value">
        <span id="network-status">${metrics.network.status === 'OK' ? '<span class="status-badge online">En ligne</span>' : '<span class="status-badge offline">Hors ligne</span>'}</span>
      </div>
      <p class="metric-details">
        Téléchargement: <span id="network-download">${metrics.network.download.toFixed(1)} KB/s</span> | 
        Upload: <span id="network-upload">${metrics.network.upload.toFixed(1)} KB/s</span>
      </p>
    </div>
  `;

  // Générer la liste des alertes
  let alertsHtml = '<p class="no-alerts">✅ Aucune alerte active.</p>';
  if (alerts.length > 0) {
    alertsHtml = alerts.map(alert => `
      <div class="alert ${alert.type}">
        <span>${alert.message}</span>
        <span class="time">Maintenant</span>
      </div>
    `).join('');
  }

  // HTML complet
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VPS Monitoring Dashboard</title>
      <link rel="stylesheet" href="/css/style.css">
      <!-- Seuils d'alerte pour le frontend -->
      <script>
        window.ALERT_THRESHOLDS = {
          cpu: ${config.alerts.cpuThreshold},
          memory: ${config.alerts.memoryThreshold},
          disk: ${config.alerts.diskThreshold}
        };
      </script>
    </head>
    <body>
      <header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>🖥️ VPS Monitoring Dashboard</h1>
            <p class="subtitle">Surveillance en temps réel de votre serveur</p>
          </div>
          <div style="text-align: right;">
            ${username ? `<p style="color: #2c3e50; font-weight: 600;">Connecté: ${username}</p>` : ''}
            <a href="/logout" style="color: #e74c3c; text-decoration: none; font-weight: 600;">🔒 Déconnexion</a>
          </div>
        </div>
      </header>

      <main>
        <!-- Section des métriques principales -->
        <section class="metrics-container">
          ${metricsHtml}
        </section>

        <!-- Section des alertes -->
        <section class="alerts-container" id="alerts-container">
          <h2>⚠️ Alertes</h2>
          <div id="alerts-list">
            ${alertsHtml}
          </div>
        </section>

        <!-- Section des graphiques (à venir) -->
        <section class="charts-container">
          <h2>📈 Historique</h2>
          <div id="charts">
            <p class="coming-soon">Fonctionnalité à venir...</p>
          </div>
        </section>
      </main>

      <footer>
        <p>VPS Monitoring Dashboard v0.2.0 | <span id="last-update">Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</span></p>
      </footer>

      <!-- Scripts -->
      <script src="/js/components/alerts.js"></script>
      <script src="/js/components/metrics.js"></script>
      <script src="/js/app.js"></script>
    </body>
    </html>
  `;
}

// Route principale : génère le HTML avec les métriques (SSR)
app.get('/', authMiddleware.requireAuth, async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    const alerts = metricsService.checkAlerts(metrics);
    const html = generateHtml(metrics, alerts, req.session.username);
    res.send(html);
  } catch (error) {
    console.error('❌ Erreur lors de la génération de la page :', error);
    res.status(500).send('Erreur lors de la récupération des métriques.');
  }
});

// Route de santé (compatibilité)
app.get('/health', (req, res) => {
  res.send('Serveur VPS Monitoring en cours d\'exécution');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 API disponible :`);
  console.log(`   - GET /api/metrics       (Toutes les métriques)`);
  console.log(`   - GET /api/network       (Métriques réseau)`);
  console.log(`   - GET /api/alerts        (Alertes actives)`);
  console.log(`   - GET /api/health        (État de santé)`);
  console.log(`   - GET /api/history       (Historique des métriques)`);
  console.log(`   - GET /api/history/:metric (Données pour graphique)`);
  console.log(`   - GET /api/history/alerts (Historique des alertes)`);
  console.log(`   - POST /api/history/cleanup (Nettoyer l'historique)`);
});

module.exports = app;

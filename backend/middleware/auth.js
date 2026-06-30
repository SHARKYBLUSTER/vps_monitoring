/**
 * Middleware d'authentification
 * Projet : VPS Monitoring Dashboard
 * 
 * Gère l'authentification des utilisateurs via des sessions.
 */

const bcrypt = require('bcryptjs');

// Utilisateur admin (chargé depuis .env)
let adminUser = null;

/**
 * Initialise l'utilisateur admin depuis les variables d'environnement
 */
function initializeAdminUser() {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  
  if (!user || !password) {
    throw new Error('❌ ADMIN_USER et ADMIN_PASSWORD doivent être définis dans les variables d\'environnement');
  }
  
  // Hacher le mot de passe si ce n'est pas déjà fait
  adminUser = {
    username: user,
    passwordHash: bcrypt.hashSync(password, 10),
  };
  
  console.log('✅ Authentification initialisée');
}

/**
 * Vérifie les identifiants de l'utilisateur
 * @param {string} username - Nom d'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<boolean>} - True si les identifiants sont valides
 */
async function validateCredentials(username, password) {
  if (!adminUser) {
    initializeAdminUser();
  }
  
  if (username !== adminUser.username) {
    return false;
  }
  
  return await bcrypt.compare(password, adminUser.passwordHash);
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  
  // Stocker l'URL de redirection
  req.session.returnTo = req.originalUrl;
  
  // Rediriger vers la page de login
  res.redirect('/login');
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié (API)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function requireApiAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    error: 'Non autorisé - Authentification requise',
  });
}

module.exports = {
  initializeAdminUser,
  validateCredentials,
  requireAuth,
  requireApiAuth,
};

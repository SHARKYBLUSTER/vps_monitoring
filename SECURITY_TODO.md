# 🔒 VPS Monitoring - Liste des Tâches de Sécurité

**Version:** 0.5.0  
**Date:** 30/06/2026  
**Priorité:** CRITIQUE - À traiter avant tout déploiement en production

---

## 📌 Table des Matières

1. [🔴 Vulnérabilités Critiques](#-vulnérabilités-critiques)
2. [🟡 Vulnérabilités Moyennes](#-vulnérabilités-moyennes)
3. [🟠 Fuites Mémoire et Performance](#-fuites-mémoire-et-performance)
4. [🟢 Bonnes Pratiques à Implémenter](#-bonnes-pratiques-à-implémenter)
5. [✅ Tâches Complétées](#✅-tâches-complétées)

---

## 🔴 Vulnérabilités Critiques

### 🔹 Authentification

- [ ] **Changer le mot de passe admin par défaut**
  - [ ] Générer un mot de passe fort: `node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"`
  - [ ] Mettre à jour `.env` ligne 24: `ADMIN_PASSWORD=VotreMotDePasseComplexeEtLongIci`
  - [ ] Supprimer le mot de passe par défaut dans `backend/middleware/auth.js` ligne 18
  - **Fichier:** `.env`, `backend/middleware/auth.js`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 5 min

- [ ] **Supprimer la clé de session par défaut**
  - [ ] Supprimer la valeur par défaut dans `backend/app.js` ligne 64
  - [ ] Garder seulement: `secret: process.env.SESSION_SECRET`
  - **Fichier:** `backend/app.js:64`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 2 min

- [ ] **Sécuriser l'endpoint `/api/history/clear-all`**
  - [ ] Ajouter une confirmation explicite côté serveur
  - [ ] Exiger un paramètre `confirm=DELETE_ALL_DATA`
  - [ ] Limiter aux administrateurs (déjà authentifié, mais ajouter vérification supplémentaire)
  - **Fichier:** `backend/app.js:617-668`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 10 min

### 🔹 CORS

- [ ] **Remplacer le middleware CORS permissif**
  - [ ] Créer une liste blanche des origines autorisées
  - [ ] Utiliser `ALLOWED_ORIGINS` dans `.env`
  - [ ] Supprimer la logique basée sur `req.headers.origin`
  - **Fichier:** `backend/app.js:77-123`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 20 min
  - **Exemple:**
    ```javascript
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    ```

### 🔹 Injection de Commande

- [ ] **Corriger `getPortsFromSS`**
  - [ ] Remplacer `exec` par `execFile`
  - [ ] Valider les paramètres
  - **Fichier:** `backend/services/metrics.js:290-341`
  - **Priorité:** HAUT ⭐⭐⭐⭐
  - **Effort:** 15 min

- [ ] **Corriger `getTopProcessesFromPS`**
  - [ ] Valider strictement le paramètre `limit`
  - [ ] Utiliser `execFile` au lieu de `exec`
  - **Fichier:** `backend/services/metrics.js:363-402`
  - **Priorité:** HAUT ⭐⭐⭐⭐
  - **Effort:** 15 min

---

## 🟡 Vulnérabilités Moyennes

### 🔹 Protection contre les attaques

- [ ] **Ajouter rate limiting sur `/login`**
  - [ ] Installer `express-rate-limit`: `npm install express-rate-limit`
  - [ ] Configurer: 5 tentatives par 15 minutes
  - [ ] Appliquer au POST `/login`
  - **Fichier:** `backend/app.js:199-230`
  - **Priorité:** HAUT ⭐⭐⭐⭐
  - **Effort:** 15 min

- [ ] **Ajouter protection CSRF**
  - [ ] Installer `csurf`: `npm install csurf`
  - [ ] Appliquer aux formulaires POST
  - [ ] Ajouter token CSRF dans `login.html`
  - **Fichiers:** `backend/app.js`, `frontend/login.html`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 20 min

### 🔹 Exposition d'informations

- [ ] **Masquer les tokens Telegram dans `/api/config`**
  - [ ] Remplacer `botToken` et `chatId` par `'***REDACTED***'` dans la réponse
  - **Fichier:** `backend/app.js:148-149, 413-414`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

- [ ] **Protéger `/api/config` avec authentification**
  - [ ] Ajouter `requireApiAuth` middleware
  - **Fichier:** `backend/app.js:135`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 2 min

### 🔹 Frontend

- [ ] **Supprimer l'affichage des identifiants par défaut dans `login.html`**
  - [ ] Remplacer par un message générique
  - **Fichier:** `frontend/login.html:212-218`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

- [ ] **Échapper les données dynamiques dans le frontend**
  - [ ] Créer une fonction `escapeHtml()`
  - [ ] L'utiliser pour toutes les données affichées
  - **Fichiers:** `frontend/index.html`, `frontend/login.html`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 30 min

---

## 🟠 Fuites Mémoire et Performance

### 🔹 Variables Globales

- [ ] **Limiter `previousAlerts` dans `metrics.js`**
  - [ ] Ajouter une limite maximale (ex: 100 entrées)
  - [ ] Nettoyer les anciennes entrées
  - **Fichier:** `backend/services/metrics.js:11`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

- [ ] **Limiter `lastSentAlerts` dans `telegram.js`**
  - [ ] Ajouter une limite maximale (ex: 100 entrées)
  - [ ] Nettoyer les entrées anciennes
  - **Fichier:** `backend/services/telegram.js:9`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

### 🔹 Intervalles et Timeouts

- [ ] **Nettoyer les intervalles à l'arrêt du serveur**
  - [ ] Déclarer `alertInterval` et `cleanupInterval` comme variables globales
  - [ ] Ajouter `clearInterval` dans les handlers SIGINT/SIGTERM
  - [ ] Appeler `historyService.stopAutoCollect()`
  - **Fichier:** `backend/app.js:36, 735-742, 748-759`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 20 min

- [ ] **Exporter `stopAutoCollect` depuis `history.js`**
  - [ ] Modifier pour retourner/exporter la fonction
  - **Fichier:** `backend/services/history.js`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

### 🔹 Optimisation du Code

- [ ] **Éviter les `require` répétées**
  - [ ] Charger `config` une fois au début de `app.js`
  - [ ] Utiliser la variable `config` partout
  - **Fichier:** `backend/app.js` (lignes 137, 164, 263, 281, 300, 312, 358, 397)
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 15 min

- [ ] **Fermer la connexion Docker à l'arrêt**
  - [ ] Ajouter une fonction `closeDocker()` dans `docker-simple.js`
  - [ ] Appeler dans le handler SIGINT
  - **Fichier:** `backend/services/docker-simple.js`
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 10 min

---

## 🟢 Bonnes Pratiques à Implémenter

### 🔹 Sécurité HTTP

- [ ] **Installer et configurer `helmet`**
  - [ ] Installer: `npm install helmet`
  - [ ] Ajouter: `app.use(helmet())`
  - **Fichier:** `backend/app.js` (après ligne 60)
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

- [ ] **Désactiver X-Powered-By**
  - [ ] Ajouter: `app.disable('x-powered-by')`
  - **Fichier:** `backend/app.js`
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 1 min

- [ ] **Configurer les cookies en mode secure pour la production**
  - [ ] Détecter l'environnement (dev vs prod)
  - [ ] Activer `secure: true` en production
  - **Fichier:** `backend/app.js:63-75`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 10 min

- [ ] **Limiter la taille des requêtes**
  - [ ] Ajouter: `express.json({ limit: '10kb' })`
  - [ ] Ajouter: `express.urlencoded({ extended: true, limit: '10kb' })`
  - **Fichier:** `backend/app.js:58-59`
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 2 min

### 🔹 Configuration

- [ ] **Ajouter `ALLOWED_ORIGINS` dans `.env.example`**
  - [ ] Documenter le format (comma-separated list)
  - **Fichier:** `.env.example`
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 2 min

- [ ] **Vérifier que `.env` est dans `.gitignore`**
  - [ ] Confirmer que `.env` n'est pas versionné
  - **Fichier:** `.gitignore`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 1 min

### 🔹 Dépendances

- [ ] **Mettre à jour les dépendances**
  - [ ] Exécuter: `npm install`
  - [ ] Exécuter: `npm audit`
  - [ ] Exécuter: `npm audit fix`
  - [ ] Vérifier les vulnérabilités restantes
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 15 min

- [ ] **Vérifier les versions des dépendances**
  - [ ] `better-sqlite3`: vérifier pour CVE-2023-42262
  - [ ] `express-session`: mettre à jour si nécessaire
  - [ ] `systeminformation`: vérifier les CVEs
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 20 min

---

## ✅ Tâches Complétées

- [ ] Rapport d'audit initial terminé ✅
- [ ] Analyse complète du code ✅
- [ ] Identification des vulnérabilités ✅
- [ ] Créer ce fichier TODO ✅

---

## 📊 Statistiques

| Catégorie | Total | Complétés | En Cours | Restants |
|----------|-------|-----------|----------|----------|
| 🔴 Critique | 6 | 0 | 0 | 6 |
| 🟡 Moyen | 9 | 0 | 0 | 9 |
| 🟠 Performance | 7 | 0 | 0 | 7 |
| 🟢 Bonnes Pratiques | 7 | 0 | 0 | 7 |
| **Total** | **29** | **0** | **0** | **29** |

---

## 🎯 Roadmap

### Phase 1: Corrections Critiques (0/6 tâches)
- **Objectif:** Sécuriser les vulnérabilités les plus dangereuses
- **Durée estimée:** 1 heure
- **Priorité:** À faire **IMMÉDIATEMENT**

### Phase 2: Sécurité Moyenne (0/9 tâches)
- **Objectif:** Renforcer la sécurité globale
- **Durée estimée:** 2-3 heures
- **Priorité:** À faire cette semaine

### Phase 3: Performance et Bonnes Pratiques (0/14 tâches)
- **Objectif:** Optimiser et améliorer la qualité du code
- **Durée estimée:** 2-4 heures
- **Priorité:** À faire dans le mois

---

## 💡 Conseils

1. **Travaillez par priorité:** Commencez par les tâches ⭐⭐⭐⭐⭐ (Critique)
2. **Testez après chaque modification:** Vérifiez que l'application fonctionne toujours
3. **Faites des commits fréquents:** Un commit par correction pour faciliter le rollback
4. **Documentez les changements:** Ajoutez des commentaires dans le code
5. **Testez en staging:** Ne déployez pas en production sans test préalable

---

## 📞 Besoin d'Aide ?

Si vous avez besoin d'aide pour implémenter une correction spécifique, mentionnez le numéro de la tâche et je peux vous fournir :
- Le code exact à modifier
- Des explications détaillées
- Des exemples de tests

---

**Dernière mise à jour:** 30/06/2026  
**Prochaine révision:** Après mise en place des corrections critiques

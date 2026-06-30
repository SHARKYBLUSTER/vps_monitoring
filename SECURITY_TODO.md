# 🔒 VPS Monitoring - Liste des Tâches de Sécurité

**Version:** 0.5.0  
**Date:** 30/06/2026  
**Priorité:** CRITIQUE - À traiter avant tout déploiement en production  
**Statut:** Phase 1 terminée ✅ | Phase 2 en cours

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

- [x] **Changer le mot de passe admin par défaut** ✅
  - [x] Générer un mot de passe fort: `node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"`
  - [x] Mettre à jour `.env` ligne 24: `ADMIN_PASSWORD=MYo+xLiceE7rMUazl/OJ6IAgGEUHhMmY`
  - [x] Supprimer le mot de passe par défaut dans `backend/middleware/auth.js` ligne 18
  - [x] Ajouter vérification stricte (erreur si non défini)
  - **Fichier:** `.env`, `backend/middleware/auth.js`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 5 min
  - **Commit:** f405a19

- [x] **Supprimer la clé de session par défaut** ✅
  - [x] Supprimer la valeur par défaut dans `backend/app.js` ligne 64
  - [x] Garder seulement: `secret: process.env.SESSION_SECRET`
  - [x] Ajouter vérification stricte (erreur si non défini)
  - **Fichier:** `backend/app.js:64`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 2 min
  - **Commit:** f405a19

- [x] **Sécuriser l'endpoint `/api/history/clear-all`** ✅
  - [x] Ajouter middleware `requireApiAuth`
  - [x] Ajouter confirmation explicite côté serveur
  - [x] Exiger un paramètre `confirm=DELETE_ALL_DATA`
  - [x] Limiter aux administrateurs (vérification `req.session.username`)
  - **Fichier:** `backend/app.js:620-630`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 10 min
  - **Commit:** f405a19

### 🔹 CORS

- [x] **Remplacer le middleware CORS permissif** ✅
  - [x] Créer une liste blanche des origines autorisées
  - [x] Utiliser `ALLOWED_ORIGINS` dans `.env`
  - [x] Supprimer la logique basée sur `req.headers.origin`
  - [x] Ajouter vérification stricte (erreur si `ALLOWED_ORIGINS` non défini)
  - **Fichier:** `backend/app.js:79-107`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 20 min
  - **Commit:** 89c1a8d
  - **Exemple:**
    ```javascript
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    ```

### 🔹 Injection de Commande

- [x] **Corriger `getPortsFromSS`** ✅
  - [x] Remplacer `exec` par `execFile`
  - [x] Utiliser des arguments séparés : `execFile('ss', ['-tlnp'], ...)`
  - [x] Ajouter timeout de 5000ms
  - **Fichier:** `backend/services/metrics.js:290-341`
  - **Priorité:** HAUT ⭐⭐⭐⭐
  - **Effort:** 15 min
  - **Commit:** 567520b

- [x] **Corriger `getTopProcessesFromPS`** ✅
  - [x] Valider strictement le paramètre `limit` (entier entre 1 et 100)
  - [x] Utiliser `execFile` au lieu de `exec`
  - [x] Appliquer la limite après exécution (pas dans la commande shell)
  - **Fichier:** `backend/services/metrics.js:363-402`
  - **Priorité:** HAUT ⭐⭐⭐⭐
  - **Effort:** 15 min
  - **Commit:** 567520b

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

### 🔹 Exposition d'informations

- [ ] **Masquer les tokens Telegram dans `/api/config`**
  - [ ] Remplacer `botToken` et `chatId` par `'***REDACTED***'` dans la réponse
  - **Fichier:** `backend/app.js:148-149, 413-414`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min

- [x] **Protéger `/api/config` avec authentification** ✅
  - [x] Le middleware `app.use('/api/*', requireApiAuth)` (ligne 182) protège déjà `/api/config`
  - **Fichier:** `backend/app.js:135`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 2 min
  - **Commit:** f405a19

- [x] **Corriger `/api/user` pour supprimer le fallback admin** ✅
  - [x] Supprimer `|| 'admin'` dans la réponse
  - **Fichier:** `backend/app.js:171`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 2 min
  - **Commit:** f405a19

### 🔹 Frontend

- [x] **Supprimer l'affichage des identifiants par défaut dans `login.html`** ✅
  - [x] Supprimer le bloc `<div class="credentials-info">`
  - **Fichier:** `frontend/login.html:212-218`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min
  - **Commit:** bddaeaf

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

- [x] **Nettoyer les intervalles à l'arrêt du serveur** ✅
  - [x] Déclarer `alertInterval` et `cleanupInterval` comme variables globales (lignes 30-31)
  - [x] Capturer `alertInterval` dans `setInterval` (ligne 57)
  - [x] Capturer `cleanupInterval` dans `scheduleCleanup()` (ligne 763)
  - [x] Ajouter `clearInterval` dans les handlers SIGINT/SIGTERM
  - [x] Appeler `historyService.stopAutoCollect()`
  - **Fichier:** `backend/app.js:30-31, 57, 763, 773-797`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 20 min
  - **Commit:** À définir

- [x] **Exporter `stopAutoCollect` depuis `history.js`** ✅
  - [x] Fonction déjà exportée dans `module.exports` (ligne 396)
  - **Fichier:** `backend/services/history.js:107-113, 396`
  - **Priorité:** MOYEN ⭐⭐⭐
  - **Effort:** 5 min
  - **Statut:** Déjà en place

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

- [x] **Ajouter `ALLOWED_ORIGINS` dans `.env.example`** ✅
  - [x] Documenter le format (comma-separated list)
  - [x] Ajouter exemple clair
  - **Fichier:** `.env.example`
  - **Priorité:** BAS ⭐⭐
  - **Effort:** 2 min
  - **Commit:** 89c1a8d

- [x] **Vérifier que `.env` est dans `.gitignore`** ✅
  - [x] `.env` est bien dans `.gitignore` (vérifié)
  - **Fichier:** `.gitignore`
  - **Priorité:** CRITIQUE ⭐⭐⭐⭐⭐
  - **Effort:** 1 min
  - **Statut:** Déjà en place

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

### 🎯 **Phase 1: Corrections Critiques** (6/6)
- [x] Rapport d'audit initial terminé ✅
- [x] Analyse complète du code ✅
- [x] Identification des vulnérabilités ✅
- [x] Créer ce fichier TODO ✅
- [x] Changer le mot de passe admin par défaut ✅
- [x] Supprimer la clé de session par défaut ✅
- [x] Sécuriser l'endpoint `/api/history/clear-all` ✅
- [x] Remplacer le middleware CORS permissif ✅
- [x] Corriger `getPortsFromSS` (injection de commande) ✅
- [x] Corriger `getTopProcessesFromPS` (injection de commande) ✅

### 🟡 **Phase 2: Sécurité Moyenne** (6/8)
- [x] Supprimer l'affichage des identifiants par défaut dans `login.html` ✅
- [x] Protéger `/api/config` avec authentification ✅
- [x] Corriger `/api/user` pour supprimer le fallback admin ✅
- [x] Ajouter `ALLOWED_ORIGINS` dans `.env.example` ✅
- [x] Nettoyer les intervalles à l'arrêt du serveur ✅
- [x] Exporter `stopAutoCollect` depuis `history.js` ✅

### 🟢 **Phase 3: Bonnes Pratiques** (1/7)
- [x] Vérifier que `.env` est dans `.gitignore` ✅

---

## 📊 Statistiques

| Catégorie | Total | Complétés | En Cours | Restants |
|----------|-------|-----------|----------|----------|
| 🔴 Critique | 6 | 6 | 0 | 0 |
| 🟡 Moyen | 8 | 6 | 0 | 2 |
| 🟠 Performance | 7 | 0 | 0 | 7 |
| 🟢 Bonnes Pratiques | 7 | 1 | 0 | 6 |
| **Total** | **28** | **13** | **0** | **15** |

---

## 🎯 Roadmap

### ✅ Phase 1: Corrections Critiques (6/6 tâches) **TERMINÉE**
- **Objectif:** Sécuriser les vulnérabilités les plus dangereuses
- **Durée estimée:** 1 heure
- **Durée réelle:** ~1h30
- **Priorité:** ✅ **FAIT**
- **Commits:** f405a19, 89c1a8d, bddaeaf, 567520b

### 🟡 Phase 2: Sécurité Moyenne (6/8 tâches) **EN COURS**
- **Objectif:** Renforcer la sécurité globale
- **Durée estimée:** 2-3 heures
- **Tâches restantes:** 2
- **Priorité:** À faire cette semaine

### ⏳ Phase 3: Performance et Bonnes Pratiques (1/14 tâches)
- **Objectif:** Optimiser et améliorer la qualité du code
- **Durée estimée:** 2-4 heures
- **Tâches restantes:** 13
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
**Prochaine révision:** Après mise en place des corrections moyennes  
**Commits liés:** f405a19, 89c1a8d, bddaeaf, 567520b, e497ab0

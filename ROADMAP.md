# Roadmap - VPS Monitoring Dashboard

> *Feuille de route pour le développement et l'amélioration du projet de surveillance VPS.*

---

## 🎯 Vision

Créer un **tableau de bord de surveillance complet, léger et open-source** pour les VPS, permettant aux utilisateurs de superviser en temps réel l'état de leurs serveurs (ressources, performances, sécurité, etc.).

---

## 📌 Statut Actuel

- **Version** : `0.1.3`
- **Statut** : 🟢 *Phase 2 terminée (100% des tâches non annulées)*
- **Dernière mise à jour** : 19 juin 2026
- **Stack technique** : **Backend** (Node.js + Express) | **Frontend** (Vanilla JS + HTML + CSS)
- **Architecture** : SSR + API REST avec authentification.

---

## 🚀 Phases de Développement

### 🔹 **Phase 1 : Fondations** *(Priorité : Haute)*
**Objectif** : Mise en place de l'infrastructure de base pour la collecte et l'affichage des métriques.
**Stack technique** : Backend (Node.js + Express) | Frontend (Vanilla JS + HTML + CSS)
**Architecture** : Génération HTML côté serveur (SSR) avec rafraîchissement automatique (pas d'API REST pour l'instant).

| ID | Tâche | Statut | Priorité | Estimations |
|----|-------|--------|----------|-------------|
| F-001 | ✅ Définir l'architecture globale (Node.js + Express + Vanilla JS) | ✅ Done | ⭐⭐⭐ | 1j |
| F-002 | ✅ Créer la structure du projet (dossiers `backend/` et `frontend/`) | ✅ Done | ⭐⭐⭐ | 1j |
| F-003 | ✅ Initialiser le projet Node.js (`package.json`, dépendances : `express`, `systeminformation`) | ✅ Done | ⭐⭐⭐ | 1j |
| F-004 | ✅ Implémenter le collecteur de métriques avec `systeminformation` (CPU, RAM, Disk) | ✅ Done | ⭐⭐⭐ | 2j |
| F-005 | ✅ Intégrer les métriques dans le HTML (sans API) | ✅ Done | ⭐⭐⭐ | 1j |
| F-006 | ✅ Développer l'interface HTML/CSS de base (structure + styles) | ✅ Done | ⭐⭐ | 2j |
| F-007 | ✅ Intégrer les métriques dynamiques dans le HTML (backend) et ajouter le rafraîchissement automatique | ✅ Done | ⭐⭐ | 1j |
| F-008 | ✅ Ajouter un système de logging (`morgan` pour Express) | ✅ Done | ⭐⭐ | 1j |

---

### 🔹 **Phase 2 : Fonctionnalités de Base** *(Priorité : Moyenne)*
**Objectif** : Ajouter des fonctionnalités essentielles pour une surveillance efficace.
**Architecture** : API REST + Authentification + Historique des métriques.
**Statut** : **100% terminée** (4/4 tâches actives complétées, 2 tâches exclues).

| ID | Tâche | Statut | Priorité | Estimations | Détails |
|----|-------|--------|----------|-------------|---------|
| B-001 | Surveillance réseau (bande passante, latence) | ✅ Done | ⭐⭐⭐ | 2j | Route `/api/network` avec métriques détaillées par interface. |
| B-002 | Alertes basiques (seuils CPU/RAM/Disk) | ✅ Done | ⭐⭐⭐ | 3j | Seuils configurables dans `backend/config/config.js`. |
| B-003 | Historique des métriques (stockage JSON temporaire) | ✅ Done | ⭐⭐⭐ | 3j | Stockage dans `data/metrics_history.json` + collecte automatique toutes les 5 minutes. |
| B-004 | Authentification utilisateur (login/mot de passe dans .env) | ✅ Done | ⭐⭐ | 2j | Middleware `auth.js` avec sessions `express-session`, hashage des mots de passe avec `bcryptjs`. |
| B-005 | Support multi-VPS (gestion de plusieurs serveurs) | ❌ Cancelled | ⭐⭐ | 3j | Exclu par l'utilisateur. |
| B-006 | Notifications (email, webhook) | ❌ Cancelled | ⭐⭐ | 2j | Exclu par l'utilisateur. |

---

### 🔹 **Phase 3 : Fonctionnalités Avancées** *(Priorité : Moyenne/Basse)*
**Objectif** : Améliorer l'expérience utilisateur et ajouter des fonctionnalités avancées.

| ID | Tâche | Statut | Priorité | Estimations |
|----|-------|--------|----------|-------------|
| A-001 | Tableaux de bord personnalisables (widgets) | ⬜ Todo | ⭐⭐ | 4j |
| A-002 | Surveillance des services (HTTP, MySQL, Redis, etc.) | ⬜ Todo | ⭐⭐ | 3j |
| A-003 | Intégration avec Prometheus/Grafana | ⬜ Todo | ⭐⭐ | 2j |
| A-004 | Détection d'anomalies (IA/ML basique) | ⬜ Todo | ⭐ | 5j |
| A-005 | Export des données (CSV, JSON, PDF) | ⬜ Todo | ⭐ | 2j |
| A-006 | API publique (pour intégration tierce) | ⬜ Todo | ⭐ | 3j |

---

### 🔹 **Phase 4 : Optimisation & Sécurité** *(Priorité : Moyenne)*
**Objectif** : Améliorer les performances, la sécurité et la fiabilité.

| ID | Tâche | Statut | Priorité | Estimations |
|----|-------|--------|----------|-------------|
| O-001 | Optimisation des requêtes API | ⬜ Todo | ⭐⭐ | 2j |
| O-002 | Chiffrement des données sensibles | ⬜ Todo | ⭐⭐⭐ | 2j |
| O-003 | Audit de sécurité (OWASP) | ⬜ Todo | ⭐⭐⭐ | 3j |
| O-004 | Tests de charge et optimisation | ⬜ Todo | ⭐⭐ | 2j |
| O-005 | Documentation technique complète | ⬜ Todo | ⭐⭐ | 2j |

---

### 🔹 **Phase 5 : Déploiement & CI/CD** *(Priorité : Moyenne)*
**Objectif** : Automatiser le déploiement et la maintenance.

| ID | Tâche | Statut | Priorité | Estimations |
|----|-------|--------|----------|-------------|
| D-001 | Scripts de déploiement (Docker, Kubernetes) | ⬜ Todo | ⭐⭐⭐ | 2j |
| D-002 | Pipeline CI/CD (GitHub Actions) | ⬜ Todo | ⭐⭐⭐ | 2j |
| D-003 | Tests automatisés (unitaires, intégration) | ⬜ Todo | ⭐⭐ | 3j |
| D-004 | Documentation utilisateur (guide d'installation) | ⬜ Todo | ⭐⭐ | 1j |

---

### 🔹 **Phase 6 : Évolutions Futures** *(Priorité : Basse)*
**Objectif** : Idées pour les versions futures.

| ID | Tâche | Statut | Priorité | Estimations |
|----|-------|--------|----------|-------------|
| E-001 | Application mobile (React Native/Flutter) | ⬜ Todo | ⭐ | 10j |
| E-002 | Support des conteneurs (Docker, LXC) | ⬜ Todo | ⭐ | 5j |
| E-003 | Intégration avec des outils cloud (AWS, GCP) | ⬜ Todo | ⭐ | 5j |
| E-004 | Plugin pour WordPress/Joomla | ⬜ Todo | ⭐ | 4j |
| E-005 | Marketplace de plugins (extensibilité) | ⬜ Todo | ⭐ | 8j |

---

## 📅 Calendrier Prévisionnel

| Phase | Début | Fin | Durée |
|-------|-------|-----|-------|
| Phase 1 | Juin 2025 | Juillet 2025 | ~3 semaines |
| Phase 2 | Juillet 2025 | Juin 2026 | ~11 mois |
| Phase 3 | À définir | À définir | ~6 semaines |
| Phase 4 | À définir | À définir | ~4 semaines |
| Phase 5 | À définir | À définir | ~4 semaines |
| Phase 6 | 2026 | - | À définir |

---

## 🎯 Prochaines Étapes (Next Steps)

1. **Phase 1** : ✅ **100% terminée**
   - [x] Définir l'architecture technique (Node.js + Express + Vanilla JS).
   - [x] Créer la structure du projet (`backend/` et `frontend/`).
   - [x] Initialiser le projet Node.js avec les dépendances (`express`, `systeminformation`).
   - [x] Implémenter le collecteur de métriques (CPU, RAM, Disk).
   - [x] Intégrer les métriques dans le HTML (backend).
   - [x] Développer l'interface HTML/CSS de base (barres de progression, animations, responsive design).
   - [x] Rafraîchir automatiquement les métriques (via `fetch()` toutes les 5 secondes).
   - [x] Ajouter un système de logging (`morgan` pour Express).

2. **Phase 2** : ✅ **100% terminée** (4/4 tâches actives)
   - [x] **B-001** : Surveillance réseau (API `/api/network` avec métriques détaillées par interface).
   - [x] **B-002** : Alertes basiques (seuils configurables dans `backend/config/config.js`).
   - [x] **B-003** : Historique des métriques (stockage JSON dans `data/metrics_history.json` + collecte automatique toutes les 5 minutes).
   - [x] **B-004** : Authentification utilisateur (middleware `auth.js` avec `express-session` et `bcryptjs`).
   - [ ] **B-005** : Support multi-VPS (exclu par l'utilisateur).
   - [ ] **B-006** : Notifications (exclu par l'utilisateur).

3. **Améliorations possibles** :
   - [ ] Remplacer le stockage JSON par **SQLite** pour l'historique (B-003).
   - [ ] Ajouter des **graphiques** (Chart.js) pour visualiser l'historique (`/api/history/:metric` déjà disponible).
   - [ ] Passer à la **Phase 3** (tableaux de bord personnalisables, surveillance des services).
   - [ ] Améliorer l'UI du formulaire de login (CSS, animations).
   - [ ] Ajouter une page de **configuration** pour modifier les seuils d'alerte.
   - [ ] Implémenter le middleware d'authentification sur les routes API.

---

## 📊 Métriques de Succès

| Métrique | Objectif | Statut |
|----------|----------|--------|
| Couverture des tests | > 80% | ❌ 0% |
| Temps de réponse API | < 200ms | ❌ Non mesuré |
| Nombre de VPS supportés | 10+ | ❌ 1 (mono-VPS) |
| Nombre d'utilisateurs actifs | 100+ | ❌ 0 |
| Endpoints API implémentés | 8+ | ✅ 8 endpoints |
| Stockage historique | Fonctionnel | ✅ JSON |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment aider :

1. **Signaler un bug** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) avec une description détaillée.
2. **Proposer une fonctionnalité** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues) avec le label `enhancement`.
3. **Contribuer au code** : Fork le dépôt, créez une branche, et soumettez une Pull Request.

---

## 📝 Changelog

| Version | Date | Modifications |
|---------|------|---------------|
| 0.1.0 | 19 juin 2025 | Création du dépôt et de la roadmap initiale. |
| 0.1.1 | 19 juin 2025 | Mise à jour de l'architecture : **Backend (Node.js + Express)** + **Frontend (Vanilla JS + HTML + CSS)**. Ajout des tâches détaillées pour la Phase 1. |
| 0.1.2 | 19 juin 2025 | **F-002** : Structure du projet créée (`backend/`, `frontend/`, `package.json`). **F-003** : Projet Node.js initialisé (dépendances définies). |
| 0.1.3 | 19 juin 2025 | **F-004** : Collecteur de métriques implémenté (`systeminformation`). **F-005** : Intégration des métriques dans le HTML (backend). **F-006** : Interface HTML/CSS de base finalisée. **F-007** : Rafraîchissement automatique des métriques (5s) via `fetch()`. **F-008** : Système de logging ajouté (`morgan`). |
| 0.1.3 | 19 juin 2026 | **Phase 2** : API REST implémentée (`/api/metrics`, `/api/network`, `/api/alerts`, `/api/health`, `/api/history`). **B-001** : Surveillance réseau. **B-002** : Alertes basiques avec seuils configurables. **B-003** : Historique des métriques (stockage JSON + collecte automatique). **B-004** : Middleware d'authentification (`auth.js` avec `express-session` et `bcryptjs`). Nettoyage du code et simplification. |

---

## 🔗 Liens Utiles

- [Repository GitHub](https://github.com/SHARKYBLUSTER/vps_monitoring)
- [Documentation](https://github.com/SHARKYBLUSTER/vps_monitoring/wiki) *(À venir)*
- [Discussions](https://github.com/SHARKYBLUSTER/vps_monitoring/discussions) *(À venir)*

---

> *Ce document est mis à jour régulièrement. Dernière révision : **19 juin 2026** (Version 0.1.3).*

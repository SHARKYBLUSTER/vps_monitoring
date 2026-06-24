# 🚀 Roadmap - VPS Monitoring Dashboard

> *Feuille de route simplifiée et orientée résultats pour le projet de surveillance VPS.*

---

## 🎯 **Vision**
Fournir un **tableau de bord léger, open-source et facile à déployer** pour surveiller en temps réel les métriques clés d'un VPS (CPU, RAM, disque, réseau, processus, ports, **Docker**).
**Fonctionnalités clés** : Mode sombre, multi-langues (Français/Anglais), authentification, et surveillance avancée.

---

## ✅ **État Actuel (v0.1.3)**
- **Fonctionnalités implémentées** :
  - Surveillance en temps réel (CPU, RAM, disque, réseau, processus).
  - API REST avec 8 endpoints (`/api/metrics`, `/api/network`, `/api/alerts`, etc.).
  - Alertes configurables (seuils CPU/RAM/disque).
  - Historique des métriques (stockage JSON).
  - Surveillance des ports ouverts et classification des services.
  - Interface responsive avec rafraîchissement automatique.

- **À implémenter** :
  - **Authentification (login/mot de passe)** : Middleware existant mais non intégré à toutes les routes.
  - **Mode sombre** : Thème alternatif pour une meilleure expérience utilisateur.
  - **Multi-langues** : Support du Français et de l'Anglais.
  - **Surveillance Docker** : Lister les conteneurs Docker et leurs stats.

- **Stack technique** :
  - Backend : Node.js + Express
  - Frontend : Vanilla JS + HTML5 + CSS3
  - Métriques : `systeminformation`
  - Stockage : JSON (fichiers `data/metrics_history.json` et `data/alerts_history.json`)

---

## 📌 **Prochaines Étapes (Priorités 2026)**

---

### 🔹 **1. Améliorations Immédiates (Haute Priorité)**
| ID | Tâche | Description | Impact | Estimation |
|----|-------|-------------|--------|------------|
| **P1-001** | **Graphiques interactifs** | Intégrer **Chart.js** pour visualiser l'historique des métriques (CPU, RAM, disque). | 🟢 Élevé | 2 jours |
| **P1-002** | **Base de données SQLite** | Remplacer le stockage JSON par **SQLite** pour l'historique (meilleure performance, requêtes avancées). | 🟢 Élevé | 3 jours |
| **P1-003** | **Page de configuration** | Interface pour modifier les **seuils d'alerte** et les paramètres du dashboard. | 🟢 Élevé | 2 jours |
| **P1-004** | **Mode sombre** | Ajouter un thème sombre avec un bouton de bascule (CSS + JavaScript). | 🟢 Élevé | 2 jours |
| **P1-006** | **Amélioration de l'UI** | Refonte du design (animations fluides, icônes). | 🟡 Moyen | 3 jours |

---

### 🔹 **2. Fonctionnalités Avancées (Moyenne Priorité)**
| ID | Tâche | Description | Impact | Estimation |
|----|-------|-------------|--------|------------|
| **P2-001** | **Surveillance des services** | Vérifier l'état des services (HTTP, MySQL, Redis, SSH, etc.) via des **ping/port checks**. | 🟢 Élevé | 3 jours |
| **P2-003** | **Support multi-langues (Français/Anglais)** | Internationalisation (i18n) avec des fichiers JSON pour les traductions. | 🟢 Élevé | 3 jours |
| **P2-004** | **Implémentation complète du login** | Finaliser l'authentification (intégration du middleware sur toutes les pages, gestion des sessions). | 🟢 Élevé | 2 jours |
| **P2-005** | **Notifications en temps réel** | Envoyer des alertes par **email** ou **webhook** (Discord/Slack). | 🟢 Élevé | 4 jours |
| **P2-006** | **Tableau de bord personnalisable** | Permettre aux utilisateurs de **choisir les widgets** à afficher. | 🟡 Moyen | 5 jours |
| **P2-007** | **Export des données** | Exporter l'historique en **CSV/JSON** pour analyse externe. | 🟡 Moyen | 2 jours |
| **P1-005** | **Sécurisation des routes API** | Appliquer le middleware d'authentification sur **toutes les routes API**. | 🟢 Élevé | 1 jour |

---

### 🔹 **3. Optimisation & Sécurité (Priorité Moyenne)**
| ID | Tâche | Description | Impact | Estimation |
|----|-------|-------------|--------|------------|
| **P3-001** | **Optimisation des requêtes API** | Réduire la latence et améliorer les performances. | 🟢 Élevé | 2 jours |
| **P3-002** | **Chiffrement des données sensibles** | Chiffrer les mots de passe et les données critiques. | 🟢 Élevé | 2 jours |
| **P3-003** | **Audit de sécurité** | Vérifier les vulnérabilités (OWASP Top 10). | 🟢 Élevé | 3 jours |
| **P3-004** | **Tests automatisés** | Ajouter des tests unitaires et d'intégration (Jest/Mocha). | 🟡 Moyen | 3 jours |

---

### 🔹 **4. Déploiement & Automatisation (Priorité Moyenne)**
| ID | Tâche | Description | Impact | Estimation |
|----|-------|-------------|--------|------------|
| **P4-001** | **Dockerisation** | Créer un **Dockerfile** et un **docker-compose.yml** pour un déploiement facile. | 🟢 Élevé | 2 jours |
| **P2-002** | **Surveillance Docker** | Lister les conteneurs Docker en cours d'exécution, leurs stats (CPU, RAM, statut) et leur état (running/stopped). | 🟢 Élevé | 4 jours |
| **P4-002** | **Pipeline CI/CD** | Configurer **GitHub Actions** pour les tests et le déploiement. | 🟢 Élevé | 2 jours |
| **P4-003** | **Script d'installation automatique** | Script Bash pour installer et configurer le projet en une commande. | 🟡 Moyen | 1 jour |
| **P4-004** | **Documentation utilisateur** | Guide d'installation et de configuration complet. | 🟡 Moyen | 2 jours |

---

### 🔹 **5. Évolutions Futures (Basse Priorité)**
| ID | Tâche | Description | Impact | Estimation |
|----|-------|-------------|--------|------------|
| **P5-001** | **Application mobile** | Développer une app **React Native** pour surveiller son VPS depuis son téléphone. | 🟠 Faible | 10 jours |
| **P5-002** | **Intégration avec Prometheus/Grafana** | Exporter les métriques au format **Prometheus** pour une intégration avec Grafana. | 🟡 Moyen | 4 jours |
| **P5-003** | **Plugin pour CMS** | Créer un plugin **WordPress/Joomla** pour afficher les métriques. | 🟠 Faible | 5 jours |

---

## 📅 **Calendrier Prévisionnel**
| Phase | Objectif | Début | Durée |
|-------|----------|-------|-------|
| **Phase 1** | Améliorations immédiates (P1-001 à P1-004, P1-006) | Immédiat | ~12 jours |
| **Phase 2** | Fonctionnalités avancées (P2-001, P2-003 à P2-007, P1-005) | Après Phase 1 | ~20 jours |
| **Phase 3** | Optimisation & Sécurité (P3-001 à P3-004) | Après Phase 2 | ~10 jours |
| **Phase 4** | Déploiement & Automatisation (P4-001 à P4-004, P2-002) | Après Phase 3 | ~11 jours |
| **Phase 5** | Évolutions futures (P5-001 à P5-003) | 2027 | À définir |

---

## 🎯 **Objectifs à Court Terme (3 mois)**
- [ ] **Terminer la Phase 1** (Graphiques, SQLite, page de configuration, mode sombre, UI améliorée).
- [ ] **Terminer la Phase 2** (Surveillance des services, multi-langues, login, sécurisation API, notifications, etc.).
- [ ] **Atteindre 100% de couverture des tests** pour les fonctionnalités critiques.
- [ ] **Publier une version v0.2.0** avec les améliorations majeures.

---

## 🤝 **Comment Contribuer ?**
1. **Signaler un bug** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues).
2. **Proposer une fonctionnalité** : Ouvrez une issue avec le label `enhancement`.
3. **Contribuer au code** : Fork le dépôt, créez une branche, et soumettez une Pull Request.

---

## 📊 **Métriques de Succès**
| Métrique | Objectif | Statut |
|----------|----------|--------|
| **Endpoints API** | 10+ | ✅ 10/10 (avec authentification) |
| **Stockage historique** | Fonctionnel | ✅ **SQLite** (remplace JSON) |
| **Surveillance Docker** | Implémentée | ❌ À venir |
| **Authentification** | Complète | ✅ **100%** (sessions + middleware) |
| **Graphiques** | 4 graphiques | ✅ **100%** (CPU, RAM, Disque, Réseau) |
| **Mode sombre** | Implémenté | ❌ À venir |
| **Multi-langues** | Français/Anglais | ❌ À venir |
| **Couverture des tests** | > 80% | ❌ 0% |
| **Temps de réponse API** | < 200ms | ❌ Non mesuré |

---

## 📝 Changelog des Versions

### Version 0.3.0 - 24 juin 2026
**Graphiques interactifs**
- ✅ Ajout de 3 nouveaux graphiques (CPU, RAM, Disque) avec Chart.js
- ✅ Amélioration du graphique réseau existant
- ✅ Filtres par période indépendants pour chaque graphique (Jour/Semaine/Mois)
- ✅ Mise à jour automatique des graphiques toutes les minutes
- ✅ Design responsive pour mobile

### Version 0.2.5 - 24 juin 2026
**Migration vers SQLite**
- ✅ Remplacement du stockage JSON par SQLite (better-sqlite3)
- ✅ Création des tables : metrics, alerts, users
- ✅ Ajout d'index pour les performances
- ✅ Migration transparente (compatibilité API préservée)
- ✅ Fermeture propre de la base de données

### Version 0.2.0 - 24 juin 2026
**Authentification complète**
- ✅ Protection de toutes les routes API avec middleware `requireApiAuth`
- ✅ Protection du dashboard avec middleware `requireAuth`
- ✅ Page de login moderne avec gestion des erreurs
- ✅ Déconnexion propre et destruction de session
- ✅ Récupération du username connecté via API

---

## 🔗 **Liens Utiles**
- [Repository GitHub](https://github.com/SHARKYBLUSTER/vps_monitoring)
- [Documentation](https://github.com/SHARKYBLUSTER/vps_monitoring#readme)
- [Discussions](https://github.com/SHARKYBLUSTER/vps_monitoring/discussions)

---
> *Dernière mise à jour : **24 juin 2026** (Version 0.3.0).*

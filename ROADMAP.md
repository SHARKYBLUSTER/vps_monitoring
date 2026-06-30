# 🚀 Roadmap - VPS Monitoring Dashboard

> *Feuille de route simplifiée et orientée résultats pour le projet de surveillance VPS.*

---

## 🎯 **Vision**
Fournir un **tableau de bord léger, open-source et facile à déployer** pour surveiller en temps réel les métriques clés d'un VPS (CPU, RAM, disque, réseau, processus, ports, **Docker**).
**Fonctionnalités clés** : Mode sombre, **multi-langues (Français/Anglais)**, authentification, et surveillance avancée.

---

## ✅ **État Actuel (v0.4.0)**
- **Fonctionnalités implémentées** :
  - Surveillance en temps réel (CPU, RAM, disque, réseau, processus).
  - API REST avec 17+ endpoints (`/api/metrics`, `/api/network`, `/api/alerts`, `/api/processes`, `/api/ports`, `/api/config`, etc.).
  - Alertes configurables (seuils CPU/RAM/disque).
  - Historique des métriques (stockage **SQLite**).
  - Surveillance des ports ouverts et classification des services (25+ ports connus).
  - Interface responsive avec rafraîchissement automatique.
  - **Authentification complète** : Page de login, gestion des sessions, protection de toutes les routes.
  - **Mode sombre** : Thème alternatif avec persistance via localStorage, appliqué de manière cohérente sur toutes les pages.
  - **Graphiques interactifs** : 4 graphiques (CPU, RAM, Disque, Réseau) avec Chart.js, filtres par période, affichage complet des 24h.
  - **Surveillance Docker** : Statut Docker Engine, liste des conteneurs, stats par conteneur.
  - **Menu de configuration** : Interface complète pour paramétrer l'application.
  - **Gestion des données** : Paramétrage de l'intervalle de collecte, de la rétention (1-24 mois), et bouton d'effacement total.
  - **Décalage horaire** : Paramétrage du décalage UTC pour ajuster l'affichage des graphiques historiques.
  - **Visibilité Docker Engine** : Option pour afficher ou masquer la section Docker du dashboard.
  - **Support multi-langues** : Système i18n complet avec Français et Anglais, sélecteur de langue dans le header.

- **Stack technique** :
  - Backend : Node.js + Express
  - Frontend : Vanilla JS + HTML5 + CSS3
  - Métriques : `systeminformation`
  - Stockage : **SQLite** (better-sqlite3)
  - Graphiques : Chart.js (v4.4.0)
  - Authentification : express-session + bcryptjs
  - Configuration : Menu intégré avec gestion des paramètres

---

## 📌 **Prochaines Étapes (Priorités 2026)**

---

### 🔹 **1. Améliorations Immédiates (Haute Priorité)**
| ID | Tâche | Description | Impact | Estimation | Statut |
|----|-------|-------------|--------|------------|--------|
| **P1-001** | **Graphiques interactifs** | Intégrer **Chart.js** pour visualiser l'historique des métriques (CPU, RAM, disque). | 🟢 Élevé | 2 jours | ✅ **Terminé** |
| **P1-002** | **Base de données SQLite** | Remplacer le stockage JSON par **SQLite** pour l'historique (meilleure performance, requêtes avancées). | 🟢 Élevé | 3 jours | ✅ **Terminé** |
| **P1-003** | **Page de configuration** | Interface pour modifier les **seuils d'alerte** et les paramètres du dashboard. | 🟢 Élevé | 2 jours | ✅ **Terminé** |
| **P1-004** | **Mode sombre** | Ajouter un thème sombre avec un bouton de bascule (CSS + JavaScript). | 🟢 Élevé | 2 jours | ✅ **Terminé** |
| **P1-006** | **Amélioration de l'UI** | Refonte du design (animations fluides, icônes). | 🟡 Moyen | 3 jours | ✅ **Terminé** |
| **P1-007** | **Gestion des données** | Menu de configuration avec intervalle de collecte, rétention, effacement total. | 🟢 Élevé | 3 jours | ✅ **Terminé v0.4.0** |

---

### 🔹 **2. Fonctionnalités Avancées (Moyenne Priorité)**
| ID | Tâche | Description | Impact | Estimation | Statut |
|----|-------|-------------|--------|------------|--------|
| **P2-001** | **Surveillance des services** | Vérifier l'état des services (HTTP, MySQL, Redis, SSH, etc.) via des **ping/port checks**. | 🟢 Élevé | 3 jours | ⏳ À venir |
| **P2-003** | **Support multi-langues (Français/Anglais)** | Internationalisation (i18n) avec des fichiers JSON pour les traductions. | 🟢 Élevé | 3 jours | ✅ **Terminé v0.4.0** |
| **P2-004** | **Implémentation complète du login** | Finaliser l'authentification (intégration du middleware sur toutes les pages, gestion des sessions). | 🟢 Élevé | 2 jours | ✅ **Terminé** |
| **P2-005** | **Notifications en temps réel** | Envoyer des alertes par **email** ou **webhook** (Discord/Slack). | 🟢 Élevé | 4 jours | ⏳ À venir |
| **P2-006** | **Tableau de bord personnalisable** | Permettre aux utilisateurs de **choisir les widgets** à afficher. | 🟡 Moyen | 5 jours | ⏳ À venir |
| **P2-007** | **Export des données** | Exporter l'historique en **CSV/JSON** pour analyse externe. | 🟡 Moyen | 2 jours | ⏳ À venir |
| **P1-005** | **Sécurisation des routes API** | Appliquer le middleware d'authentification sur **toutes les routes API**. | 🟢 Élevé | 1 jour | ✅ **Terminé** |

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
| **P4-001** | **Dockerisation** | Créer un **Dockerfile** et un **docker-compose.yml** pour un déploiement facile. | 🟢 Élevé | 2 jours | ✅ **Terminé v0.4.0** (avec mode host + privileged + dockerode) |
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
| **Phase 1** | Améliorations immédiates (P1-001 à P1-007) | Immédiat | ~12 jours | ✅ **Terminée v0.4.0** |
| **Phase 2** | Fonctionnalités avancées (P2-001, P2-003 à P2-007, P1-005) | Après Phase 1 | ~20 jours | ⏳ En cours |
| **Phase 3** | Optimisation & Sécurité (P3-001 à P3-004) | Après Phase 2 | ~10 jours |
| **Phase 4** | Déploiement & Automatisation (P4-001 à P4-004, P2-002) | Après Phase 3 | ~11 jours |
| **Phase 5** | Évolutions futures (P5-001 à P5-003) | 2027 | À définir |

---

## 🎯 **Objectifs à Court Terme (3 mois)**
- [x] **Terminer la Phase 1** (Graphiques, SQLite, page de configuration, mode sombre, UI améliorée, gestion des données).
- [x] **Terminer le multi-langues** (Support Français/Anglais complet avec i18n).
- [ ] **Terminer la Phase 2** (Surveillance des services, notifications, etc.).
- [ ] **Atteindre 100% de couverture des tests** pour les fonctionnalités critiques.
- [x] **Publier une version v0.4.0** avec les améliorations majeures.

---

## 🤝 **Comment Contribuer ?**
1. **Signaler un bug** : Ouvrez une [issue](https://github.com/SHARKYBLUSTER/vps_monitoring/issues).
2. **Proposer une fonctionnalité** : Ouvrez une issue avec le label `enhancement`.
3. **Contribuer au code** : Fork le dépôt, créez une branche, et soumettez une Pull Request.

---

## 📊 **Métriques de Succès**
| Métrique | Objectif | Statut |
|----------|----------|--------|
| **Endpoints API** | 10+ | ✅ **17+/17** (avec authentification + config) |
| **Stockage historique** | Fonctionnel | ✅ **SQLite** (remplace JSON) |
| **Surveillance Docker** | Implémentée | ✅ **Partielle** (Docker Engine + conteneurs) |
| **Authentification** | Complète | ✅ **100%** (sessions + middleware) |
| **Graphiques** | 4 graphiques | ✅ **100%** (CPU, RAM, Disque, Réseau) |
| **Mode sombre** | Implémenté | ✅ **100%** (intégré dans menu config) |
| **Menu de configuration** | Fonctionnel | ✅ **100%** (v0.4.0) |
| **Gestion des données** | Complète | ✅ **100%** (rétention + effacement) |
| **Multi-langues** | Français/Anglais | ✅ **100%** (i18n complet) |
| **Couverture des tests** | > 80% | ❌ 0% |
| **Temps de réponse API** | < 200ms | ❌ Non mesuré |

---

## 📝 Changelog des Versions

### Version 0.4.0 - 30 juin 2026
**Menu de configuration, gestion des données, décalage horaire, visibilité Docker, support multi-langues et support Docker complet**
- ✅ **Menu de configuration complet** : Interface accessible depuis le dashboard
- ✅ **Paramètre d'intervalle** : Configuration de la fréquence de collecte des métriques (en ms)
- ✅ **Rétention des données** : Paramétrage de la durée de stockage (1-24 mois)
- ✅ **Effacement total** : Bouton pour supprimer toutes les données historiques (SQLite + JSON)
- ✅ **Intégration du mode sombre** : Basculer entre mode clair/sombre depuis le menu configuration, appliqué sur toutes les pages
- ✅ **Style unifié** : Cohérence des boutons (logout, configuration) et ajout d'icônes
- ✅ **Rechargement automatique** : La page se recharge après effacement pour afficher les changements
- ✅ **Corrections de bugs** : Résolution des problèmes d'affichage des processus et ports
- ✅ **Graphiques corrigés** : Affichage complet des 24h pour le filtre jour (au lieu de 41 minutes), agrégation par 30 minutes avec 48 points, format HH:MM pour les labels du réseau
- ✅ **Thème cohérent** : Suppression du bouton de basculement de la page login, application automatique du thème depuis la configuration globale
- ✅ **Décalage horaire** : Ajout du paramètre UTC Heure locale pour ajuster les abscisses des graphiques historiques
- ✅ **Visibilité Docker Engine** : Bouton pour afficher/masquer la carte Docker Engine avec rechargement automatique
- ✅ **Support multi-langues** : Implémentation complète du système i18n avec fichiers JSON pour Français et Anglais, traduction de toutes les sections
- ✅ **Suppression des emojis** : Retrait des emojis (🔧,🕐,🌙,⏰,💾,✕) de la modale de configuration pour une interface plus épurée
- ✅ **Labels graphiques nettoyés** : Suppression des mots "Heure" et "Jour" sous les abscisses des graphiques historiques
- ✅ **Support Docker complet** : Ajout de Dockerfile et docker-compose.yml pour déploiement conteneurisé avec accès aux métriques système globales (mode host + privileged)
- ✅ **Correction Docker Engine sous Docker** : Remplacement de child_process par dockerode pour la détection Docker dans les containers, permettant l'affichage de la carte Docker Engine sous Docker
- ✅ **Correction Top 5 Processes** : Utilisation de `ps aux` au lieu de systeminformation.processes() pour obtenir directement les pourcentages CPU/MEM, ajout de procps au Dockerfile pour Alpine

### Version 0.3.0 - 27 juin 2026
**Mode sombre + Graphiques améliorés**
- ✅ **Mode sombre complet** : Thème alternatif avec toggle, persistance localStorage
- ✅ Adaptation de toutes les couleurs (cartes, graphiques, tableaux, boutons, alertes)
- ✅ Icône dynamique (lune/soleil) dans le header
- ✅ Ajout de 4 graphiques (CPU, RAM, Disque, Réseau) avec Chart.js
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
> *Dernière mise à jour : **30 juin 2026** (Version 0.4.0 - Menu de configuration, gestion des données, décalage horaire, visibilité Docker, corrections graphiques, thème, support multi-langues complet, suppression emojis, labels graphiques nettoyés, **support Docker complet**, **correction Docker Engine sous Docker**, **correction Top 5 Processes**).*
